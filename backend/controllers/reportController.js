import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Expense from '../models/Expense.js';





// Add this import at the top
// ADD THESE NEW FUNCTIONS AT THE END OF THE FILE:

// @desc    Get expense overview stats
// @route   GET /api/reports/expense-overview
// @access  Private (Admin, Manager, Accountant)
export const getExpenseOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    // Get all expenses for the period
    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalExpenses = expenseData[0]?.total || 0;
    const expenseCount = expenseData[0]?.count || 0;

    // Calculate averages
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const dailyAverage = totalExpenses / daysDiff;

    res.json({
      success: true,
      data: {
        totalExpenses,
        expenseCount,
        dailyAverage,
        weeklyAverage: dailyAverage * 7,
        monthlyAverage: dailyAverage * 30
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get expenses by category
// @route   GET /api/reports/expenses-by-category
// @access  Private
export const getExpensesByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.json({
      success: true,
      data: expensesByCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get expenses over time
// @route   GET /api/reports/expenses-over-time
// @access  Private
export const getExpensesOverTime = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        break;
      case 'week':
        dateFormat = { $week: '$date' };
        break;
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
    }

    const expensesData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: 'active'
        }
      },
      {
        $group: {
          _id: dateFormat,
          expenses: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: expensesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get top expense categories
// @route   GET /api/reports/top-expense-categories
// @access  Private
export const getTopExpenseCategories = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const topCategories = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: 'active'
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            subcategory: '$subcategory'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          category: '$_id.category',
          subcategory: '$_id.subcategory',
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: topCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get comprehensive financial report (Revenue vs Expenses)
// @route   GET /api/reports/financial-summary
// @access  Private
export const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    // Get revenue data
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSubtotal: { $sum: '$subtotal' },
          totalTax: { $sum: '$tax' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Get expense data
    const expenseData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      totalSubtotal: 0,
      totalTax: 0,
      orderCount: 0
    };

    const totalExpenses = expenseData[0]?.total || 0;
    const expenseCount = expenseData[0]?.count || 0;

    const grossProfit = revenue.totalRevenue - totalExpenses;
    const profitMargin = revenue.totalRevenue > 0 
      ? ((grossProfit / revenue.totalRevenue) * 100).toFixed(2) 
      : 0;

    res.json({
      success: true,
      data: {
        revenue: {
          total: revenue.totalRevenue,
          subtotal: revenue.totalSubtotal,
          tax: revenue.totalTax,
          orderCount: revenue.orderCount
        },
        expenses: {
          total: totalExpenses,
          count: expenseCount
        },
        profit: {
          gross: grossProfit,
          margin: parseFloat(profitMargin)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Get dashboard overview stats
// @route   GET /api/reports/overview
// @access  Private (Admin, Manager, Accountant)
export const getOverviewStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to today if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    // Get total orders
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    });

    // Get total revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSubtotal: { $sum: '$subtotal' },
          totalTax: { $sum: '$tax' }
        }
      }
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      totalSubtotal: 0,
      totalTax: 0
    };

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? revenue.totalRevenue / totalOrders : 0;

    // Get total items sold
    const itemsSold = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$items.quantity' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: revenue.totalRevenue,
        totalSubtotal: revenue.totalSubtotal,
        totalTax: revenue.totalTax,
        averageOrderValue,
        totalItemsSold: itemsSold[0]?.totalItems || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get revenue over time (daily/weekly/monthly)
// @route   GET /api/reports/revenue-over-time
// @access  Private
export const getRevenueOverTime = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
        break;
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        dateFormat = { $week: '$createdAt' };
        break;
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: dateFormat,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales by category
// @route   GET /api/reports/sales-by-category
// @access  Private
export const getSalesByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.subCategory',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get top selling products
// @route   GET /api/reports/top-products
// @access  Private
export const getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment methods breakdown
// @route   GET /api/reports/payment-methods
// @access  Private
export const getPaymentMethodsBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const paymentData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales by hour (peak hours)
// @route   GET /api/reports/sales-by-hour
// @access  Private
export const getSalesByHour = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const hourlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: hourlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales by day of week
// @route   GET /api/reports/sales-by-day
// @access  Private
export const getSalesByDayOfWeek = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Map day numbers to names
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedData = dailyData.map(item => ({
      day: dayNames[item._id - 1],
      dayNumber: item._id,
      orders: item.orders,
      revenue: item.revenue
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};