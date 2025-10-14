import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Sandwich', 'Pizza', 'Drinks', 'Sides', 'Desserts']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: '/images/placeholder.png'
  },
  description: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  customizations: [{
    name: {
      type: String,
      required: true
    },
    options: [{
      name: String,
      price: {
        type: Number,
        default: 0
      }
    }]
  }]
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);