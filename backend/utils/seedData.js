import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const products = [
  // Sandwiches
  {
    name: 'Beef Burger',
    category: 'Sandwich',
    price: 5.99,
    description: 'Juicy beef patty with fresh vegetables',
    customizations: [
      {
        name: 'Remove Ingredients',
        options: [
          { name: 'No Onions', price: 0 },
          { name: 'No Tomatoes', price: 0 },
          { name: 'No Pickles', price: 0 }
        ]
      },
      {
        name: 'Add Extra',
        options: [
          { name: 'Extra Cheese', price: 0.50 },
          { name: 'Extra Toom', price: 0.30 },
          { name: 'Extra Sauce', price: 0.20 }
        ]
      }
    ]
  },
  {
    name: 'Chicken Burger',
    category: 'Sandwich',
    price: 6.99,
    description: 'Grilled chicken with special sauce',
    customizations: [
      {
        name: 'Remove Ingredients',
        options: [
          { name: 'No Lettuce', price: 0 },
          { name: 'No Mayo', price: 0 }
        ]
      },
      {
        name: 'Add Extra',
        options: [
          { name: 'Extra Chicken', price: 2.00 },
          { name: 'Extra Cheese', price: 0.50 }
        ]
      }
    ]
  },
  {
    name: 'Falafel Wrap',
    category: 'Sandwich',
    price: 4.99,
    description: 'Fresh falafel with tahini sauce',
    customizations: [
      {
        name: 'Add Extra',
        options: [
          { name: 'Extra Falafel', price: 1.00 },
          { name: 'Extra Tahini', price: 0.30 }
        ]
      }
    ]
  },
  
  // Pizza
  {
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 8.99,
    description: 'Classic tomato and mozzarella',
    customizations: [
      {
        name: 'Size',
        options: [
          { name: 'Small', price: 0 },
          { name: 'Medium', price: 2.00 },
          { name: 'Large', price: 4.00 }
        ]
      },
      {
        name: 'Extra Toppings',
        options: [
          { name: 'Extra Cheese', price: 1.00 },
          { name: 'Olives', price: 0.50 },
          { name: 'Mushrooms', price: 0.50 }
        ]
      }
    ]
  },
  {
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    price: 10.99,
    description: 'Loaded with pepperoni',
    customizations: [
      {
        name: 'Size',
        options: [
          { name: 'Small', price: 0 },
          { name: 'Medium', price: 2.00 },
          { name: 'Large', price: 4.00 }
        ]
      }
    ]
  },
  
  // Drinks
  {
    name: 'Pepsi',
    category: 'Drinks',
    price: 1.99,
    description: 'Chilled Pepsi',
    customizations: [
      {
        name: 'Size',
        options: [
          { name: 'Can (330ml)', price: 0 },
          { name: 'Bottle (500ml)', price: 0.50 },
          { name: 'Large (1L)', price: 1.00 }
        ]
      }
    ]
  },
  {
    name: 'Coca Cola',
    category: 'Drinks',
    price: 1.99,
    description: 'Chilled Coca Cola',
    customizations: [
      {
        name: 'Size',
        options: [
          { name: 'Can (330ml)', price: 0 },
          { name: 'Bottle (500ml)', price: 0.50 }
        ]
      }
    ]
  },
  {
    name: 'Fresh Orange Juice',
    category: 'Drinks',
    price: 3.99,
    description: 'Freshly squeezed orange juice',
    customizations: []
  },
  
  // Sides
  {
    name: 'French Fries',
    category: 'Sides',
    price: 2.99,
    description: 'Crispy golden fries',
    customizations: [
      {
        name: 'Size',
        options: [
          { name: 'Small', price: 0 },
          { name: 'Medium', price: 1.00 },
          { name: 'Large', price: 2.00 }
        ]
      }
    ]
  },
  {
    name: 'Onion Rings',
    category: 'Sides',
    price: 3.49,
    description: 'Crispy onion rings',
    customizations: []
  },
  
  // Desserts
  {
    name: 'Chocolate Cake',
    category: 'Desserts',
    price: 4.99,
    description: 'Rich chocolate cake',
    customizations: []
  },
  {
    name: 'Ice Cream',
    category: 'Desserts',
    price: 3.49,
    description: 'Vanilla ice cream',
    customizations: [
      {
        name: 'Flavor',
        options: [
          { name: 'Vanilla', price: 0 },
          { name: 'Chocolate', price: 0 },
          { name: 'Strawberry', price: 0 }
        ]
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing products
    await Product.deleteMany();
    console.log('🗑️  Cleared existing products');
    
    // Insert new products
    await Product.insertMany(products);
    console.log('✅ Sample products added successfully!');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();