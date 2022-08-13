import loadExpress from "./express";
import { Logger } from "../lib";
import { Server } from "http";
import { AddressInfo } from "net";

const { PORT = 8000 } = process.env;
export default async function initServer() {
  const app = loadExpress();
  const server = app.listen(PORT, () => {
    const { port, address } = server.address() as AddressInfo;
    Logger.info(`📦 Server initialized on ${address}:${port}.`);
  });
  
  server.on("error", (err) => {
    Logger.error(`🌋 Server connection error: ${err?.message}`);
  })
}