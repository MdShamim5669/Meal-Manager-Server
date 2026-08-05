import cron from "node-cron";
import { prisma } from "../config/db";

export class CronService {
  static async checkMissedDuties() {
    try {
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0);

      const missedDuties = await prisma.dutyRoster.updateMany({
        where: {
          date: { lt: yesterday },
          status: "SCHEDULED",
        },
        data: {
          status: "MISSED",
        },
      });

      if (missedDuties.count > 0) {
        console.log(`[CRON] Auto-updated ${missedDuties.count} past duty roster(s) to MISSED status.`);
      }
    } catch (error) {
      console.error("[CRON Error] Error checking missed duties:", error);
    }
  }

  static initCrons() {
    cron.schedule("*/5 * * * *", () => {
      CronService.checkMissedDuties();
    });

    console.log("[CRON] Scheduled background cron jobs initialized.");
  }
}
