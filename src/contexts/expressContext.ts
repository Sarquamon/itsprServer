import { Request, Response } from "express";

export interface expressContext {
  req: Request;
  res: Response;
  payload?: { userId: string };
}
