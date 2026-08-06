import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const pinHash = await bcrypt.hash("5669", 10);

  // 1. Super Admin Account
  const superAdminEmail = "tamjidulislamsamim@gmail.com";
  const superAdminPhone = "01743597989";
  const superAdminName = "Md Samim";

  let superAdmin = await (prisma.member as any).findFirst({
    where: { OR: [{ email: superAdminEmail }, { phone: superAdminPhone }] },
  });

  if (!superAdmin) {
    superAdmin = await (prisma.member as any).create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        phone: superAdminPhone,
        pinHash,
        role: "SUPER_ADMIN",
        active: true,
      },
    });
  } else {
    superAdmin = await (prisma.member as any).update({
      where: { id: superAdmin.id },
      data: {
        name: superAdminName,
        email: superAdminEmail,
        phone: superAdminPhone,
        pinHash,
        role: "SUPER_ADMIN",
        active: true,
      },
    });
  }

  // 2. Manager Account
  const managerPhone = "01711223344";
  const managerEmail = "manager.rahim@gmail.com";
  let manager = await (prisma.member as any).findFirst({
    where: { OR: [{ email: managerEmail }, { phone: managerPhone }] },
  });

  if (!manager) {
    manager = await (prisma.member as any).create({
      data: {
        name: "Manager Rahim",
        email: managerEmail,
        phone: managerPhone,
        pinHash,
        role: "MANAGER",
        active: true,
      },
    });
  } else {
    await (prisma.member as any).update({
      where: { id: manager.id },
      data: { pinHash, active: true },
    });
  }

  // 3. Member Account
  const memberPhone = "01811223344";
  const memberEmail = "member.karim@gmail.com";
  let memberItem = await (prisma.member as any).findFirst({
    where: { OR: [{ email: memberEmail }, { phone: memberPhone }] },
  });

  if (!memberItem) {
    memberItem = await (prisma.member as any).create({
      data: {
        name: "Member Karim",
        email: memberEmail,
        phone: memberPhone,
        pinHash,
        role: "MEMBER",
        active: true,
      },
    });
  } else {
    await (prisma.member as any).update({
      where: { id: memberItem.id },
      data: { pinHash, active: true },
    });
  }

  console.log("\n=========================================");
  console.log("👑 SEEDED DEMO ACCOUNTS READY!");
  console.log("=========================================");
  console.log(`1. SUPER ADMIN: ${superAdmin.name} (${superAdmin.phone} / ${superAdmin.email}) - PIN: 5669`);
  console.log(`2. MANAGER:     ${manager.name} (${manager.phone} / ${manager.email}) - PIN: 5669`);
  console.log(`3. MEMBER:      ${memberItem.name} (${memberItem.phone} / ${memberItem.email}) - PIN: 5669`);
  console.log("=========================================\n");

  const activePeriod = await prisma.period.findFirst({ where: { status: "ACTIVE" } });
  if (!activePeriod) {
    const now = new Date();
    const periodLabel = `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const period = await prisma.period.create({
      data: {
        label: periodLabel,
        startDate,
        endDate,
        status: "ACTIVE",
      },
    });
    console.log(`Active Period Created: ${period.label}`);
  }
}

main()
  .catch((e) => {
    console.error("Error seeding DB:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
