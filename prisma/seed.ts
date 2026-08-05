import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const pinHash = await bcrypt.hash("5669", 10);
  const email = "tamjidulislamsamim@gmail.com";
  const phone = "01743597989";
  const name = "Md Samim";

  let superAdmin = await (prisma.member as any).findFirst({
    where: {
      OR: [{ email }, { name }],
    },
  });

  if (!superAdmin) {
    superAdmin = await (prisma.member as any).create({
      data: {
        name,
        email,
        phone,
        pinHash,
        role: "SUPER_ADMIN",
        active: true,
      },
    });
  } else {
    superAdmin = await (prisma.member as any).update({
      where: { id: superAdmin.id },
      data: {
        name,
        email,
        phone,
        role: "SUPER_ADMIN",
        active: true,
      },
    });
  }

  console.log("\n=========================================");
  console.log("👑 SUPER ADMIN ACCOUNT READY!");
  console.log("=========================================");
  console.log(`ID:       ${superAdmin.id}`);
  console.log(`Name:     ${superAdmin.name}`);
  console.log(`Email:    ${superAdmin.email}`);
  console.log(`Phone:    ${superAdmin.phone}`);
  console.log(`Role:     ${superAdmin.role}`);
  console.log(`PIN:      5669`);
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
    console.error("Error seeding Super Admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
