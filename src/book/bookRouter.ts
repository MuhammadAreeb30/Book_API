import express from "express";
import {
  createBooks,
  updatebook,
  bookList,
  getSingleBook,
  deleteBook,
} from "../controller/bookController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

// uplaod file
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size
  },
});

// create book route
bookRouter.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBooks
);

// update book route
bookRouter.patch(
  "/:id",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updatebook
);

// book list route
bookRouter.get("/", bookList);

// single book route
bookRouter.get("/:id", getSingleBook);

// delete book route
bookRouter.delete("/:id", authenticate, deleteBook);

export default bookRouter;
