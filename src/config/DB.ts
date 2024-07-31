import mongoose from "mongoose";
import { config } from "./config";

const DBConnect = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to Database Successfully");
    });
    mongoose.connection.on("error", (error) => {
      console.error("Failed to connect to Database", error);
    });
    await mongoose.connect(config.databaseurl as string);
  } catch (error) {
    console.error("Failed to connect to Database", error);
  }
};

export default DBConnect;
