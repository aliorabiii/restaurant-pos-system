import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: [
      'Delivery Driver',
      'Shawarma Maker',
      'Kitchen Helper',
      'Cleaner',
      'Security Guard',
      'Dishwasher',
      'Food Prep',
      'Other'
    ]
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
  },
  dailySalary: {
    type: Number,
    required: [true, 'Daily salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
employeeSchema.index({ status: 1 });
employeeSchema.index({ role: 1 });

export default mongoose.model('Employee', employeeSchema);