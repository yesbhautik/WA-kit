import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";

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

import superUserRoute from "./routes/superUser.routes";
import whatsAppRoute from "./routes/whatsApp.routes";

if (!fs.existsSync("./sessions")) {
  fs.mkdirSync("./sessions", { recursive: true });
}
// User Route
app.use("/api/users", superUserRoute);

// Whatsapp pair route
app.use("/api/whatsapp", whatsAppRoute);

// async function connectToWhatsApp() {
//   const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

//   const sock = makeWASocket({
//     // can provide additional config here
//     printQRInTerminal: true,
//     auth: state,
//   });
//   sock.ev.on("connection.update", (update) => {
//     const { connection, lastDisconnect } = update;
//     if (connection === "close") {
//       const shouldReconnect =
//         (lastDisconnect.error as Boom)?.output?.statusCode !==
//         DisconnectReason.loggedOut;
//       console.log(
//         "connection closed due to ",
//         lastDisconnect.error,
//         ", reconnecting ",
//         shouldReconnect
//       );
//       // reconnect if not logged out
//       if (shouldReconnect) {
//         connectToWhatsApp();
//       }
//     } else if (connection === "open") {
//       console.log("opened connection");
//     }
//   });
//   sock.ev.on("messages.upsert", async (m) => {
//     // console.log(JSON.stringify(m, undefined, 2));
//     console.log(JSON.stringify(m.messages[0].message, undefined, 2));

//     if (m.messages[0].message.conversation.includes("ping")) {
//       console.log("replying to", m.messages[0].key.remoteJid);
//       await sock.sendMessage(m.messages[0].key.remoteJid!, {
//         text: "Pong!",
//       });
//     }
//   });

//   sock.ev.on("creds.update", saveCreds);
// }

// connectToWhatsApp();

export { app };
