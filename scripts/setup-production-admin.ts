import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "katkarparth6494@gmail.com";
    const adminPass = "WINA6494_parth@00713";
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    console.log(`Setting up SuperAdmin: ${adminEmail}...`);

    let superAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (superAdmin) {
        superAdmin = await prisma.user.update({
            where: { email: adminEmail },
            data: {
                name: "Parth Katkar",
                password: hashedPassword,
                role: "SUPERADMIN"
            }
        });
        console.log("Updated existing user to SUPERADMIN with new password.");
    } else {
        superAdmin = await prisma.user.create({
            data: {
                name: "Parth Katkar",
                email: adminEmail,
                password: hashedPassword,
                role: "SUPERADMIN"
            }
        });
        console.log("Created new SUPERADMIN user successfully.");
    }

    // Transfer any orphaned sessions from old test/typo accounts to the new SuperAdmin
    const testEmails = ["katkarparr+th6494@gmail.com", "admin@admin.com", "admin@wina.local"];
    for (const testEmail of testEmails) {
        const testUser = await prisma.user.findUnique({
            where: { email: testEmail },
            include: { sessions: true }
        });

        if (testUser) {
            console.log(`Found old account ${testEmail}. Migrating sessions to new SuperAdmin...`);
            if (testUser.sessions.length > 0) {
                await prisma.session.updateMany({
                    where: { userId: testUser.id },
                    data: { userId: superAdmin.id }
                });
            }
            await prisma.user.delete({
                where: { id: testUser.id }
            });
            console.log(`Removed old user ${testEmail}.`);
        }
    }

    console.log("Production SuperAdmin setup completed successfully!");
}

main()
    .catch((e) => {
        console.error("Error setting up admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
