import mongoose from 'mongoose';

const AppSchema = new mongoose.Schema(
 {
   appName: { 
     type: String,
     required: true, 
     trim: true,
     unique: true,
     dropDups: true // Quizas
   },
   appID: {
     type: String,
     required: true, 
     unique: true,
     dropDups: true
   },
   appSecret: {
     type: String,
     required: true, 
     unique: true,
     dropDups: true
   },
 },
 { timestamps: true, versionKey: false }
);

export default mongoose.model('Application', AppSchema);
