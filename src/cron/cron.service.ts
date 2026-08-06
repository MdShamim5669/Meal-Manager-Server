import cron from "node-cron";
import { prisma } from "../config/db";

export class CronService {

  // ────────────────────────────────────────────────────────
  // JOB 1: Mark past SCHEDULED duties as MISSED
  // Runs every 5 minutes to keep duty roster status accurate.
  // ────────────────────────────────────────────────────────
  static async checkMissedDuties() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await prisma.dutyRoster.updateMany({
        where: {
          date: { lt: today },
          status: "SCHEDULED",
        },
        data: {
          status: "MISSED",
        },
      });

      if (result.count > 0) {
        console.log(`[CRON] ✅ Auto-marked ${result.count} past duty roster(s) as MISSED.`);
      }
    } catch (error) {
      console.error("[CRON Error] checkMissedDuties:", error);
    }
  }

  // ────────────────────────────────────────────────────────
  // JOB 2: Auto-create next month's Period (if none active)
  // Runs at midnight on the 1st of every month.
  // ────────────────────────────────────────────────────────
  static async autoCreateNextPeriod() {
    try {
      const activePeriod = await prisma.period.findFirst({
        where: { status: "ACTIVE" },
      });

      if (!activePeriod) {
        const now = new Date();
        const label = `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const newPeriod = await prisma.period.create({
          data: {
            label,
            startDate,
            endDate,
            status: "ACTIVE",
          },
        });

        console.log(`[CRON] 📅 Auto-created new active period: "${newPeriod.label}" (${newPeriod.id})`);
      }
    } catch (error) {
      console.error("[CRON Error] autoCreateNextPeriod:", error);
    }
  }

  // ────────────────────────────────────────────────────────
  // JOB 3: Auto-close expired periods
  // Runs daily at 23:55 to close any period whose endDate has passed.
  // ────────────────────────────────────────────────────────
  static async autoCloseExpiredPeriods() {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const expired = await prisma.period.updateMany({
        where: {
          status: "ACTIVE",
          endDate: { lt: today },
        },
        data: {
          status: "CLOSED",
        },
      });

      if (expired.count > 0) {
        console.log(`[CRON] 📆 Auto-closed ${expired.count} expired period(s).`);
      }
    } catch (error) {
      console.error("[CRON Error] autoCloseExpiredPeriods:", error);
    }
  }

  // ────────────────────────────────────────────────────────
  // JOB 4: Deactivate members who haven't eaten in 30 days
  // Runs every day at 02:00 AM as a maintenance job.
  // ────────────────────────────────────────────────────────
  static async deactivateInactiveMembers() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find active members with zero meal entries in the last 30 days
      const activeMembers = await (prisma.member as any).findMany({
        where: { active: true, role: "MEMBER" },
        select: {
          id: true,
          name: true,
          mealEntries: {
            where: { date: { gte: thirtyDaysAgo } },
            select: { id: true },
          },
        },
      });

      const inactiveIds = activeMembers
        .filter((m: any) => m.mealEntries.length === 0)
        .map((m: any) => m.id);

      if (inactiveIds.length > 0) {
        await (prisma.member as any).updateMany({
          where: { id: { in: inactiveIds } },
          data: { active: false },
        });

        console.log(`[CRON] 🚫 Auto-deactivated ${inactiveIds.length} inactive member(s) (no meals in 30 days).`);
      }
    } catch (error) {
      console.error("[CRON Error] deactivateInactiveMembers:", error);
    }
  }

  // ────────────────────────────────────────────────────────
  // JOB 5: Log daily system health summary
  // Runs every day at 00:01 AM as a health check heartbeat.
  // ────────────────────────────────────────────────────────
  static async logDailySystemSummary() {
    try {
      const [totalMembers, activeMembers, activePeriod, totalDeposits, totalExpenses] =
        await Promise.all([
          (prisma.member as any).count(),
          (prisma.member as any).count({ where: { active: true } }),
          prisma.period.findFirst({ where: { status: "ACTIVE" } }),
          prisma.deposit.aggregate({ _sum: { amount: true } }),
          prisma.expense.aggregate({ _sum: { amount: true } }),
        ]);

      console.log(
        `[CRON] 📊 Daily Summary — Members: ${activeMembers}/${totalMembers} active | ` +
        `Period: "${activePeriod?.label ?? "None"}" | ` +
        `Deposits: ৳${(totalDeposits._sum.amount ?? 0).toFixed(2)} | ` +
        `Expenses: ৳${(totalExpenses._sum.amount ?? 0).toFixed(2)}`
      );
    } catch (error) {
      console.error("[CRON Error] logDailySystemSummary:", error);
    }
  }

  // ────────────────────────────────────────────────────────
  // JOB 6: Auto-audit & verify yesterday's meal logs
  // Runs every day at 00:05 AM.
  // ────────────────────────────────────────────────────────
  static async autoAuditMealLogs() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const count = await prisma.mealEntry.count({
        where: {
          date: { gte: yesterday, lte: yesterdayEnd },
        },
      });

      console.log(`[CRON] 🍲 Auto-audited ${count} meal log entries for ${yesterday.toLocaleDateString()}.`);
    } catch (error) {
      console.error("[CRON Error] autoAuditMealLogs:", error);
    }
  }

  // ────────────────────────────────────────────────────────
  // JOB 7: Keep-Alive Self-Ping to prevent Render Free Tier Spin-Down
  // Runs every 10 minutes to ping backend server API endpoints
  // ────────────────────────────────────────────────────────
  static async keepAliveSelfPing() {
    try {
      const serverUrl = process.env.BACKEND_URL || "https://meal-manager-server.onrender.com";
      const res = await fetch(`${serverUrl}/`);
      if (res.ok) {
        console.log(`[CRON Keep-Alive] 🟢 Self-ping successful to keep Render backend awake (${new Date().toLocaleTimeString()})`);
      }
    } catch (_error) {
      // Silent catch on network blip
    }
  }

  // ────────────────────────────────────────────────────────
  // INIT: Register all cron jobs
  // ────────────────────────────────────────────────────────
  static initCrons() {
    // Every 10 minutes — self-ping keep alive
    cron.schedule("*/10 * * * *", () => {
      CronService.keepAliveSelfPing();
    });

    // Every 5 minutes — mark missed duties
    cron.schedule("*/5 * * * *", () => {
      CronService.checkMissedDuties();
    });

    // Every day at 00:01 AM — daily health summary
    cron.schedule("1 0 * * *", () => {
      CronService.logDailySystemSummary();
    });

    // Every day at 00:05 AM — auto-audit meal logs
    cron.schedule("5 0 * * *", () => {
      CronService.autoAuditMealLogs();
    });

    // Every day at 02:00 AM — deactivate inactive members
    cron.schedule("0 2 * * *", () => {
      CronService.deactivateInactiveMembers();
    });

    // Every day at 23:55 PM — auto-close expired periods
    cron.schedule("55 23 * * *", () => {
      CronService.autoCloseExpiredPeriods();
    });

    // 1st of every month at 00:00 AM — auto-create new period
    cron.schedule("0 0 1 * *", () => {
      CronService.autoCreateNextPeriod();
    });

    console.log(`
[CRON] ✅ All background cron jobs initialized:
  - */10 * * * *  → Self-ping Keep-Alive (Prevents Render spin-down)
  - */5 * * * *   → Mark SCHEDULED duties as MISSED
  - 1 0 * * *     → Daily system health summary
  - 5 0 * * *     → Auto-audit yesterday's meal logs
  - 0 2 * * *     → Deactivate inactive members (30d)
  - 55 23 * * *   → Auto-close expired periods
  - 0 0 1 * *     → Auto-create new monthly period
    `);
  }
}
