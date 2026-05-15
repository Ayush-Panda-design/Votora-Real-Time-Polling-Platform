import mongoose from 'mongoose';


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

   
    try {
   
      const pollsColl = conn.connection.collection('polls');
      const pIndexes = await pollsColl.indexes();
      for (const idx of pIndexes) {
        if (idx.unique && idx.name !== '_id_' && idx.name !== 'pollCode_1') {
          console.log(`ℹ️  Dropping unintended unique index on Polls: ${idx.name}`);
          await pollsColl.dropIndex(idx.name);
        }
      }

     
      const analyticsColl = conn.connection.collection('analytics');
      const aIndexes = await analyticsColl.indexes();
      for (const idx of aIndexes) {
        if (idx.unique && idx.name !== '_id_' && idx.name !== 'pollId_1') {
          console.log(`ℹ️  Dropping unintended unique index on Analytics: ${idx.name}`);
          await analyticsColl.dropIndex(idx.name);
        }
      }
    } catch (err) {
      console.warn('  Index cleanup warning:', err.message);
    }

  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

