import mongoose from "mongoose";

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URI}/${process.env.DB_NAME}`
    );
    console.log(
      "Connected to DATABASE... DB_HOST: ",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default connectDB;
