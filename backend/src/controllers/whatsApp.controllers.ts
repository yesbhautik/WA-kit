import { Request, Response } from "express";
import fs from "fs";
import NodeCache from "node-cache";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { supabase } from "../utils/Supabase";

async function deleteSession(phoneNumber) {
  const sessionDir = `./sessions/${phoneNumber}`;
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
    console.log(`${phoneNumber} Deleted from Sessions`);
  }
  await supabase.from("bot").delete().eq("contact", phoneNumber);
  await supabase.from("users").delete().eq("contact", phoneNumber);
  await supabase.storage
    .from("session-files")
    .remove([`sessions/${phoneNumber}/creds.json`]);
}

function getPhoneNumbersFromSessions() {
  const sessionDirectories = fs
    .readdirSync("./sessions")
    .filter((file) => file.match(/^\d+$/));
  return sessionDirectories;
}

async function restoreSessionFromDB(phoneNumber, filePath) {
  try {
    console.log(`Restoring session for phone number: ${phoneNumber}`);
    const sessionDir = `./sessions/${phoneNumber}`;
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const { data, error } = await supabase.storage
      .from("session-files")
      .download(filePath);

    const fileData = await data.text();

    if (typeof fileData === "object") {
      fs.writeFileSync(`${sessionDir}/creds.json`, fileData);
    }
    await createBot(phoneNumber);
  } catch (error) {
    console.error("Error restoring session:", error);
  }
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

    const { data } = await supabase
      .from("bot")
      .select(
        `
          id,
          contact
        `
      )
      .eq("contact", parseInt(phoneNumber));

    if (data.length === 0) {
      const credsPath = `${sessionDir}/creds.json`;

      if (fs.existsSync(credsPath)) {
        const creds = fs.readFileSync(credsPath);
        const { data: storageData, error } = await supabase.storage
          .from("session-files")
          .upload(credsPath, creds, {
            contentType: "application/json",
            upsert: true,
          });

        if (error) {
          console.error("Error uploading session file to Supabase:", error);
          throw new ApiError(500, "Error uploading session file to Supabase");
        }

        if (storageData) {
          const { data, error } = await supabase
            .from("bot")
            .insert([
              {
                contact: phoneNumber,
                filePath: storageData?.fullPath,
                filePathId: storageData?.id,
              },
            ])
            .select();

          if (error) {
            console.error("Error creating bot to Supabase:", error);
          }
          console.log("Created User Bot >>>", data);
        }
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

async function reloadBots() {
  const phoneNumbers = getPhoneNumbersFromSessions();

  const { data } = await supabase.from("bot").select();
  const phoneNumbersInDB = data?.map((user) => user.contact) || [];

  for (const phoneNumber of phoneNumbers) {
    await createBot(phoneNumber);
  }

  for (const phoneNumber of phoneNumbersInDB) {
    if (!phoneNumbers.includes(String(phoneNumber))) {
      const user = data.find((user) => user.contact === Number(phoneNumber));
      if (user) {
        await restoreSessionFromDB(phoneNumber, user.filePath.slice(14));
      }
    }
  }
}
export { pairingRoute, reloadBots };
