import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { createConnection, MoreThan } from "typeorm";
import cookieParser from "cookie-parser";
import { urlencoded, json } from "body-parser";
import { verify } from "jsonwebtoken";
import { hash } from "argon2";
import CORS from "cors";
import sgMail from "@sendgrid/mail";
import { Student } from "./entity/Student";
import {
  createAccessToken,
  createRefresToken as createRefreshToken,
} from "./resolvers/auth";
import { sendRefreshToken } from "./resolvers/sendRefreshToken";
import { closeAllUserSessions } from "./resolvers/closeAllUserSessions";

const PORT = process.env.PORT || 4000;

(async () => {
  const app = express();

  await createConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });

  app.use(CORS());
  app.use(cookieParser());
  app.use(urlencoded({ extended: false }));
  app.use(json());
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  app.get("/", (_, res) => {
    res.status(200).json({ message: "api root" });
  });

  app.post("/h/activate", async (req, res) => {
    const { token, email } = req.body;

    if (!token) {
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    try {
      verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    const user = await Student.findOne({
      email,
    });

    if (!user) {
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    try {
      await Student.update(user.controlNumber, {
        activeUser: true,
      });
    } catch (error) {
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    return res.send({ ok: true });
  });

  app.post("/j/recoverpwd", async (req, res) => {
    const { token, email } = req.body;
    let payload: any;

    if (!token) {
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    try {
      payload = verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    const user = await Student.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordTokenExpires: MoreThan(new Date()),
    });

    if (!user) {
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    if (user.resetPasswordTokenExpires! > payload.tokenExpires) {
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    return res.send({ ok: true });
  });

  app.post("/w/resetpwd", async (req, res) => {
    const { newPwd, email } = req.body;

    if (!newPwd || !email) {
      return res.send({
        ok: false,
        message: "no email or no pwd provided",
      });
    }

    const user = await Student.findOne({ email });

    if (!user) {
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    const closedSessions = await closeAllUserSessions(user.controlNumber);

    if (!closedSessions) {
      return res.send({
        ok: false,
        message: "could not close sessions",
      });
    }

    const hashed = await hash(newPwd);

    try {
      Student.update(user.controlNumber, {
        password: hashed,
        resetPasswordToken: "",
      });
    } catch (error) {
      console.log(error);
      return res.send({
        ok: false,
        message: "token has expired or is invalid",
      });
    }

    const msg = {
      from: process.env.emailSender!,
      to: user.email,
      subject: "Cambio de contraseña",
      dynamicTemplateData: {
        names: user.names,
        lastname: user.lastname,
        secondLastname: user.secondLastname,
      },
      templateId: "d-3480a559f75440929162432b00cc2a12",
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.log(error.response.body);
      throw new Error("Mail not sent");
    }

    return res.send({ ok: true, message: "password updated" });
  });

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    let payload: any;

    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }

    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({ ok: false, accessToken: "" });
    }

    const user = await Student.findOne({ controlNumber: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      nullableByDefault: true,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app });
})();
