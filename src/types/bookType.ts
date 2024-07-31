import { User } from "./userType";

export interface Book {
  _id: string;
  title: string;
  description: string;
  author: string;
  token: User;
  genre: string;
  coverImage: string;
  file: string;
  createdAt: Date;
  updatedAt: Date;
}
