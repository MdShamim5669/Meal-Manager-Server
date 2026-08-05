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

  // 3. Delete non-Super Admin members (by role)
  const deletedMembers = await prisma.member.deleteMany({
    where: {
      role: { not: Role.SUPER_ADMIN },
    },
  });
  console.log(`Deleted ${deletedMembers.count} non-Super Admin members.`);

  // 4. Verify remaining Super Admin
  const remainingMembers = await prisma.member.findMany();

  console.log("\n=========================================");
  console.log("✅ DATABASE CLEANUP COMPLETE!");
  console.log("=========================================");
  console.log(`Remaining members in DB: ${remainingMembers.length}`);
  remainingMembers.forEach((m) => {
    console.log(`- ID: ${m.id} | Name: ${m.name} | Role: ${m.role} | Email: ${m.email}`);
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
