import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;

  return cached.conn;
};

export default connectDB;