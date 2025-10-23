import Employee from '../models/Employee.js';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin, Manager)
export const getAllEmployees = async (req, res) => {
  try {
    const { status, role } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const employees = await Employee.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate total daily salary cost
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    const totalDailyCost = activeEmployees.reduce((sum, emp) => sum + emp.dailySalary, 0);

    res.json({
      success: true,
      count: employees.length,
      activeCount: activeEmployees.length,
      totalDailyCost,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin, Manager)
export const createEmployee = async (req, res) => {
  try {
    const employeeData = {
      ...req.body,
      createdBy: req.user._id
    };

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, Manager)
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update fields
    const allowedUpdates = ['fullName', 'role', 'phoneNumber', 'dailySalary', 'startDate', 'status', 'notes'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    });

    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle employee status
// @route   PATCH /api/employees/:id/toggle-status
// @access  Private (Admin, Manager)
export const toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    await employee.save();

    res.json({
      success: true,
      message: `Employee ${employee.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private (Admin, Manager, Accountant)
export const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });

    // Get employees grouped by role
    const employeesByRole = await Employee.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalDailySalary: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$dailySalary', 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate total daily cost
    const activeSalaries = await Employee.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: null,
          totalDailyCost: { $sum: '$dailySalary' }
        }
      }
    ]);

    const totalDailyCost = activeSalaries[0]?.totalDailyCost || 0;
    const monthlyEstimate = totalDailyCost * 30;
    const yearlyEstimate = totalDailyCost * 365;

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesByRole,
        salaryEstimates: {
          daily: totalDailyCost,
          monthly: monthlyEstimate,
          yearly: yearlyEstimate
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