import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./users/userRoute";
import bookRouter from "./book/bookRouter";
import cors from "cors";
// import { config } from "./config/config";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
// console.log(config.front_end_domain)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.json({
    message: "hello world",
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// global error
app.use(globalErrorHandler);

export default app;
