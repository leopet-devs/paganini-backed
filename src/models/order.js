import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: true,
      unique: true
    },
    items: {
      type: [{
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        image: String,
        hasImage: {
          type: Boolean,
          required: true
        }
      }],
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    appID: {
      type: String,
      required: true, 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model('Order', OrderSchema);
