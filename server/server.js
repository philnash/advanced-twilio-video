import express from "express";
import pino from "express-pino-logger";

import Twilio from "twilio";
import compression from "compression";

import { join } from "node:path";
import * as url from "node:url";

import { twilio } from "./config.js";
const { accountSid, apiKey, apiSecret } = twilio;

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const app = express();

app.use(compression());
// app.use(pino);
app.use(express.static(join(__dirname, "..", "public")));
app.use("/images", express.static(join(__dirname, "..", "images")));
app.use(
  "/tf",
  express.static(
    join(
      __dirname,
      "..",
      "node_modules",
      "@twilio",
      "video-processors",
      "dist",
      "build"
    )
  )
);
app.use(express.json());

app.post("/token", (req, res) => {
  const { identity, room } = req.body;

  const { AccessToken } = Twilio.jwt;
  const { VideoGrant } = AccessToken;

  const grant = new VideoGrant();
  if (room) {
    grant.room = room;
  }

  if (accountSid && apiKey && apiSecret) {
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret);
    accessToken.addGrant(grant);
    accessToken.identity = identity;

    res.set("Content-Type", "application/json");
    res.json({ token: accessToken.toJwt() });
  } else {
    throw new Error(
      "Please set your Account Sid, API key and API secret in the environment"
    );
  }
});

export default app;
