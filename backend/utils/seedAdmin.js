import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Role from '../models/Role.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

// Default permissions for each role
const rolesData = [
  {
    name: 'main_admin',
    displayName: 'Main Administrator',
    permissions: ['*'], // All permissions
    description: 'Full system access - Super Admin'
  },
{
  name: 'admin',
  displayName: 'Administrator',
  permissions: [
    'view_dashboard',
    // 'manage_users',  // ← Remove this from default
    'view_reports',
    'manage_menu',
    'manage_inventory',
    'view_orders',
    'manage_settings'
  ],
  description: 'System administrator with most permissions'
},
  {
    name: 'manager',
    displayName: 'Manager',
    permissions: [
      'view_dashboard',
      'view_reports',
      'manage_menu',
      'manage_inventory',
      'view_orders',
      'manage_staff_schedule'
    ],
    description: 'Restaurant manager - operations focused'
  },
  {
    name: 'accountant',
    displayName: 'Accountant',
    permissions: [
      'view_dashboard',
      'view_accounting',
      'edit_accounting',
      'view_financial_reports',
      'manage_expenses',
      'view_revenue'
    ],
    description: 'Financial management and accounting'
  },
  {
    name: 'cashier',
    displayName: 'Cashier',
    permissions: [
      'view_pos',
      'process_orders',
      'process_payments',
      'view_menu',
      'print_receipts'
    ],
    description: 'Point of sale operations'
  },
  {
    name: 'waiter',
    displayName: 'Waiter/Server',
    permissions: [
      'view_orders',
      'create_orders',
      'update_orders',
      'view_menu',
      'manage_tables'
    ],
    description: 'Table service and order management'
  },
  {
    name: 'kitchen',
    displayName: 'Kitchen Staff',
    permissions: [
      'view_kitchen_display',
      'update_order_status',
      'view_orders'
    ],
    description: 'Kitchen display system access'
  },
  {
    name: 'inventory_manager',
    displayName: 'Inventory Manager',
    permissions: [
      'view_dashboard',
      'view_inventory',
      'manage_inventory',
      'create_purchase_orders',
      'manage_suppliers',
      'view_inventory_reports'
    ],
    description: 'Inventory and supply management'
  }
];

// Main admin user
const mainAdmin = {
  name: 'Main Administrator',
  email: 'admin@restaurant.com',
  password: 'admin123', // Change this in production!
  role: 'main_admin',
  permissions: ['*'],
  isActive: true
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Role.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Cleared existing roles and users');

    // Insert roles
    await Role.insertMany(rolesData);
    console.log('✅ Roles created successfully');

    // Create main admin
    await User.create(mainAdmin);
    console.log('✅ Main Admin created successfully');
    console.log('\n📧 Main Admin Credentials:');
    console.log('   Email: admin@restaurant.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();