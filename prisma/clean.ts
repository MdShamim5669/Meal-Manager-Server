import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("🧹 Starting database cleanup...");

  // 1. Delete transactional records
  const deletedMeals = await prisma.mealEntry.deleteMany({});
  console.log(`Deleted ${deletedMeals.count} meal entries.`);

  const deletedExpenses = await prisma.expense.deleteMany({});
  console.log(`Deleted ${deletedExpenses.count} expenses.`);

  const deletedDeposits = await prisma.deposit.deleteMany({});
  console.log(`Deleted ${deletedDeposits.count} deposits.`);

  const deletedDutyRosters = await prisma.dutyRoster.deleteMany({});
  console.log(`Deleted ${deletedDutyRosters.count} duty roster records.`);

  // 2. Delete all period records
  const deletedPeriods = await prisma.period.deleteMany({});
  console.log(`Deleted ${deletedPeriods.count} periods.`);

  // 3. Delete non-Super Admin members
  const deletedMembers = await prisma.member.deleteMany({
    where: {
      AND: [
        { role: { not: Role.SUPER_ADMIN } },
        { email: { not: "tamjidulislamsamim@gmail.com" } },
      ],
    },
  });
  console.log(`Deleted ${deletedMembers.count} non-Super Admin members.`);

  // 4. Verify Super Admin exists
  const superAdmins = await prisma.member.findMany({
    where: {
      OR: [
        { role: Role.SUPER_ADMIN },
        { email: "tamjidulislamsamim@gmail.com" },
      ],
    },
  });

  console.log("\n=========================================");
  console.log("✅ DATABASE CLEANUP COMPLETE!");
  console.log("=========================================");
  console.log(`Remaining Super Admin accounts: ${superAdmins.length}`);
  superAdmins.forEach((sa) => {
    console.log(`- ID: ${sa.id} | Name: ${sa.name} | Role: ${sa.role}`);
  });
  console.log("=========================================\n");
}

cleanDatabase()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
