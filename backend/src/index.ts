import dotenv from "dotenv";
import { app } from "./app";
import { reloadBots } from "./controllers/whatsApp.controllers";

dotenv.config({
  path: "./.env",
});

app.listen(process.env.PORT || 8000, () => {
  reloadBots()
    .then(() => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
    .catch((err) => {
      console.log("Error while reloadBots >>", err);
    });
});
