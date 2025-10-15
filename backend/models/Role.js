import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['main_admin', 'admin', 'manager', 'accountant', 'cashier', 'waiter', 'kitchen', 'inventory_manager']
  },
  displayName: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  description: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Role', roleSchema);