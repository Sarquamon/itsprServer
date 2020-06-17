import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { expressContext } from "../contexts/expressContext";

export const isAuth: MiddlewareFn<expressContext> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    throw new Error("Not authenticated");
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (error) {
    console.log("Error!: ", error);
    throw new Error("Not authenticated");
  }
  return next();
};
