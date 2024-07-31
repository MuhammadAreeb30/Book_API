import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import fs from "node:fs";
import Books from "../model/bookSchema";
import { AuthRequest } from "../middlewares/authenticate";
import createHttpError from "http-errors";

// create book
const createBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { title, author, genre, description } = await req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );
    const coverImageFormat = files.coverImage[0].mimetype.split("/").at(-1);
    const fileUpload = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book_covers",
      format: coverImageFormat,
    });
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );
    const bookFileUpload = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book_pdfs",
      format: "pdf",
    });
    const _req = req as AuthRequest;
    const newBook = await Books.create({
      title,
      genre,
      description,
      author,
      token: _req.userId,
      coverImage: fileUpload.secure_url,
      file: bookFileUpload.secure_url,
    });

    // Delete temp.files
    fs.promises.unlink(filePath);
    fs.promises.unlink(bookFilePath);

    return res
      .status(201)
      .json({ id: newBook._id, message: "Book created successfully" });
  } catch (error) {
    next(error);
  }
};

// update book
const updatebook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, author, genre, description } = await req.body;
    const bookId = req.params.id;

    // find book
    const book = await Books.findOne({ _id: bookId });
    if (!book) {
      const err = createHttpError(404, "Book not found");
      next(err);
    }

    // Check access
    const _req = req as AuthRequest;
    if (book?.token.toString() !== _req.userId) {
      const err = createHttpError(403, "Unauthorized");
      next(err);
    }

    // cover image update
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let coverImage = "";
    if (files.coverImage) {
      const imageName = files.coverImage[0].filename;
      coverImage = imageName;
      const imagePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        imageName
      );
      const imageFormat = files.coverImage[0].mimetype.split("/").at(-1);
      const uploadImage = await cloudinary.uploader.upload(imagePath, {
        filename_override: coverImage,
        folder: "book_covers",
        format: imageFormat,
      });
      coverImage = uploadImage.secure_url;
      await fs.promises.unlink(imagePath);
    }

    // pdf file update
    let completeFile = "";
    if (files.file) {
      const fileName = files.file[0].filename;
      completeFile = fileName;
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        completeFile
      );
      const uploadFile = await cloudinary.uploader.upload(filePath, {
        filename_override: completeFile,
        folder: "book_pdfs",
        format: "pdf",
        resource_type: "raw",
      });
      completeFile = uploadFile.secure_url;
      await fs.promises.unlink(filePath);
    }

    // book update
    const updateBook = await Books.findOneAndUpdate(
      {
        _id: bookId,
      },
      {
        title: title,
        genre: genre,
        author: author,
        description: description,
        coverImage: coverImage ? coverImage : book?.coverImage,
        file: completeFile ? completeFile : book?.file,
      },
      {
        new: true,
      }
    );
    console.log(updateBook, "updated");
    return res
      .status(201)
      .json({ book: updateBook, message: "Book updated successfully" });
  } catch (error) {
    next(error);
  }
};

// books list
const bookList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await Books.find();
    if (!books) {
      const err = createHttpError(404, "Books not found");
      next(err);
    }
    return res.status(200).json({ books: books });
  } catch (error) {
    const err = createHttpError(500, "Errro while getting a books");
    next(err);
  }
};

// single book
const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.id;
    const book = await Books.findOne({ _id: bookId });
    if (!book) {
      const err = createHttpError(404, "Book not found");
      next(err);
    }
    return res.status(200).json({ book: book });
  } catch (error) {
    const err = createHttpError(500, "Error white getting book");
    next(err);
  }
};

// delete book
const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.id;
    const book = await Books.findOne({ _id: bookId });
    if (!book) {
      const err = createHttpError(404, "Book not found");
      next(err);
    }
    const _req = req as AuthRequest;
    if (book?.token.toString() !== _req.userId) {
      const err = createHttpError(403, "Unauthorized");
      next(err);
    }
    const coverImageSplit = book?.coverImage.split("/");
    const coverImagePublicId =
      coverImageSplit?.at(-2) +
      "/" +
      coverImageSplit?.at(-1)?.split(".").at(-2);
    const fileSplit = book?.file.split("/");
    const filePublicId = fileSplit?.at(-2) + "/" + fileSplit?.at(-1);
    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(filePublicId, {
      resource_type: "raw",
    });
    await Books.findOneAndDelete({ _id: bookId });
    return res.status(201).json({ message: "Book deleted successfully" });
  } catch (error) {
    const err = createHttpError(500, "Could not delete book");
    next(err);
  }
};

export { createBooks, updatebook, bookList, getSingleBook, deleteBook };
