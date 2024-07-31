import app from "./src/app";
import DBConnect from "./src/config/DB";
import { config } from "./src/config/config";

const startServer = async () => {
  await DBConnect();
  const port = config.port || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();