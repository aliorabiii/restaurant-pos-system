import Expense from '../models/Expense.js';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Admin, Manager, Accountant)
export const getAllExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, status } = req.query;
    
    let filter = {};
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Category filter
    if (category) filter.category = category;
    
    // Status filter
    if (status) filter.status = status;

    const expenses = await Expense.find(filter)
      .populate('created_by', 'name email')
      .sort({ date: -1 });

    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({
      success: true,
      count: expenses.length,
      total,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('created_by', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Admin, Manager, Accountant)
export const createExpense = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      created_by: req.user._id
    };

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Admin, Manager, Accountant)
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update fields
    const allowedUpdates = ['date', 'category', 'subcategory', 'description', 'amount', 'status', 'notes'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        expense[field] = req.body[field];
      }
    });

    await expense.save();

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin)
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private (Admin, Manager, Accountant)
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    // Total expenses by category
    const byCategory = await Expense.aggregate([
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

    // Total for the period
    const totalExpenses = await Expense.aggregate([
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

    // Calculate daily average
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = totalExpenses[0]?.total || 0;
    const dailyAverage = totalAmount / daysDiff;

    res.json({
      success: true,
      data: {
        totalExpenses: totalAmount,
        totalCount: totalExpenses[0]?.count || 0,
        dailyAverage: dailyAverage,
        weeklyAverage: dailyAverage * 7,
        monthlyAverage: dailyAverage * 30,
        byCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get daily expense total
// @route   GET /api/expenses/daily-total
// @access  Private
export const getDailyTotal = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all expenses for the day
    const dailyExpenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay },
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

    const totalDailyExpense = dailyExpenses[0]?.total || 0;
    const expenseCount = dailyExpenses[0]?.count || 0;

    res.json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        total: totalDailyExpense,
        count: expenseCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};