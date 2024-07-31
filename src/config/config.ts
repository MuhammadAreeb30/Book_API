import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  databaseurl: process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET,
  cloud_name: process.env.CLOUD_NAME,
  cloud_api_key: process.env.CLOUD_API_KEY,
  cloud_api_secret: process.env.CLOUD_API_SEC,
  front_end_domain: process.env.FRONT_END_DOMAIN || "http://localhost:1000/",
  // dashboard_domain: process.env.DASHBOARD || "http://localhost:1000/",
};

export const config = Object.freeze(_config);
