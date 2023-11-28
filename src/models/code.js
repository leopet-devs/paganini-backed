import mongoose from 'mongoose';

const CodeScheme = new mongoose.Schema(
 {
   code: { 
     type: String,
     required: true, 
     unique: true
   },
   description: {
     type: String,
     required: true, 
   },
   reason: {
     type: String,
     required: true,
   }
 },
 { timestamps: true, versionKey: false }
);

export default mongoose.model('Code', CodeScheme);
