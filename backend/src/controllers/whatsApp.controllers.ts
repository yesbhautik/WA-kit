import { Request, Response } from "express";
import fs from "fs";
import NodeCache from "node-cache";
import pino from "pino";
import PastebinAPI from "pastebin-js";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { Bot } from "../models/bot.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const logger = pino({ level: "silent" });
const pastebin = new PastebinAPI("EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL");

async function deleteSession(phoneNumber) {
  const sessionDir = `./sessions/${phoneNumber}`;
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
    console.log(`${phoneNumber} Deleted from Sessions`);
  }
  await Bot.findOneAndDelete({ phoneNumber });
  console.log(`Deleted ${phoneNumber} From DB`);
}

async function createBot(phoneNumber: string) {
  try {
    const sessionDir = `./sessions/${phoneNumber}`;

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const msgRetryCounterCache = new NodeCache();

    const Matrix = makeWASocket({
      printQRInTerminal: false,
      browser: ["Mac OS", "chrome", "121.0.6167.159"],
      auth: state,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => ({ conversation: "Hello, World!" }),
      msgRetryCounterCache,
    });

    Matrix.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          setTimeout(() => createBot(phoneNumber), 5000);
        } else {
          console.log(`== Phone number ${phoneNumber}, Device logged out.`);
          await deleteSession(phoneNumber);
        }
      } else if (connection === "open") {
        console.log(`Device ${phoneNumber} connected to WhatsApp.`);
      }
    });

    Matrix.ev.on("creds.update", saveCreds);

    // Handle incoming messages specifically for the current device
    Matrix.ev.on("messages.upsert", async (m) => {
      if (
        m.messages[0].message &&
        ((m.messages[0].message.conversation &&
          m.messages[0].message.conversation.toLowerCase().includes("ping")) ||
          (m.messages[0].message.extendedTextMessage &&
            m.messages[0].message.extendedTextMessage.text
              .toLowerCase()
              .includes("ping")))
      ) {
        await Matrix.sendMessage(m.messages[0].key.remoteJid!, {
          text: "Pong!",
        });
      }
    });

    const existingUser = await Bot.findOne({ phoneNumber });

    if (!existingUser) {
      const credsPath = `${sessionDir}/creds.json`;

      if (fs.existsSync(credsPath)) {
        // const pasteUrl = await pastebin.createPasteFromFile(
        //   credsPath,
        //   "Session",
        //   null,
        //   1,
        //   "N"
        // );
        // const sessionId = pasteUrl.split("/").pop();
        // await Bot.create({ phoneNumber, sessionId });
        await Bot.create({ phoneNumber, sessionId: 1 });
        console.log(`New user created for phone number: ${phoneNumber}`);
      }
    }
    return Matrix;
  } catch (error) {
    console.error("Error creating bot:", error);
    await deleteSession(phoneNumber);
  }
}

const pairingRoute = asyncHandler(async (req: Request, res: Response) => {
  try {
    let { phoneNumber, isUpdate } = req.body;

    if (!phoneNumber) {
      return res
        .status(400)
        .json(new ApiResponse(400, [], "Invalid phone number"));
    }

    if (isUpdate) {
      const oldNumber = req.body.oldNumber;
      if (!oldNumber) {
        return res
          .status(400)
          .json(new ApiResponse(400, [], "Number is required!"));
      }

      // const sessionDir = `./sessions/${oldNumber}`;
      // const { state } = await useMultiFileAuthState(sessionDir);
      // const oldBot = makeWASocket({ auth: state });

      // // Check if the bot is connected before attempting logout
      // if (oldBot) {
      //   console.log(`Attempting to log out bot for ${oldNumber}...`);
      //   try {
      //     await oldBot.logout();
      //     console.log(`Bot for ${phoneNumber} logged out successfully.`);
      //   } catch (logoutError) {
      //     console.error(
      //       `Failed to log out bot for ${oldNumber}:`,
      //       logoutError.message
      //     );
      //   }
      // }
    }

    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

    console.log(`Creating bot for phone number: ${phoneNumber}, Device.`);
    const bot = await createBot(phoneNumber);

    if (!bot) {
      throw new ApiError(500, "Bot creation failed");
    }

    setTimeout(async () => {
      try {
        let code = await bot.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        return res
          .status(201)
          .json(
            new ApiResponse(
              201,
              { pairingCode: code },
              "Pairing code generated"
            )
          );
      } catch (error) {
        console.error("Error generating pairing code:", error);
        await deleteSession(phoneNumber);
        return res
          .status(500)
          .json(new ApiResponse(500, [], "Error generating pairing code"));
      }
    }, 3000);
  } catch (error) {
    console.log("Error >>", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error generating pairing code"));
  }
});

export { pairingRoute };
