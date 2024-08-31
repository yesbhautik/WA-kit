import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import makeWASocket, {
  DisconnectReason,
  SignalDataSet,
  SignalDataTypeMap,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import NodeCache from "node-cache";

const app = express();

dotenv.config({
  path: "./.env",
});

app.use(express.static("temp"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRoute from "./routes/user.routes";

// User Route
app.use("/api/users", userRoute);

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state,
  });
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect.error,
        ", reconnecting ",
        shouldReconnect
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });
  sock.ev.on("messages.upsert", async (m) => {
    // console.log(JSON.stringify(m, undefined, 2));
    console.log(JSON.stringify(m.messages[0].message, undefined, 2));

    if (m.messages[0].message.conversation.includes("ping")) {
      console.log("replying to", m.messages[0].key.remoteJid);
      await sock.sendMessage(m.messages[0].key.remoteJid!, {
        text: "Pong!",
      });
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

connectToWhatsApp();
app.post("/whatsapp", async (req, res) => {
  try {
    // await connectToWhatsApp();
  } catch (error) {
    console.log("Error >>", error);
  }
  // run in main file
});

export { app };
