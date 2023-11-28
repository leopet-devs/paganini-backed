import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
 {
   transactionID: {
     type: String,
     required: true,
     unique: true
   },
   appID: {
     type: String,
     required: true, 
   },
   code: {
     type:String,
     required: true
   },
   clientName: {
     type: String,
     required: true 
   },
   amount: {
     type: Number,
     required: true
   },
   orderID: {
     type: String,
     required: true
   }
 },
 { timestamps: true, versionKey: false }
);

export default mongoose.model('Transaction', TransactionSchema);
