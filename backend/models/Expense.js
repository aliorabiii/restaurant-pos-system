import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'COGS',           // Cost of Goods Sold
      'Utilities',      // Gas, Electricity, Water
      'Rent',           // Property costs
      'Operational',    // Cleaning, uniforms, equipment
      'Marketing',      // Advertising, promotions
      'Delivery',       // Fuel, delivery costs
      'Maintenance',    // Repairs, upkeep
      'Salaries',       // Employee wages
      'Other'           // Miscellaneous
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
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
  receipt_image: {
    type: String  // Path to uploaded receipt image
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ status: 1 });

export default mongoose.model('Expense', expenseSchema);