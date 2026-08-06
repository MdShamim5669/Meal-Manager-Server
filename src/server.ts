import { Server } from "http";
import app from "./app";
import config from "./config";
import { CronService } from "./cron/cron.service";

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    // Initialize background cron jobs
    CronService.initCrons();
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception detected:", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection detected:", error);
    exitHandler();
  });
}

main();
