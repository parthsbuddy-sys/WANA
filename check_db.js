const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const configs = await prisma.botConfig.findMany();
    console.log("BotConfigs:", JSON.stringify(configs, null, 2));
    const sessions = await prisma.session.findMany();
    console.log("Sessions:", JSON.stringify(sessions, null, 2));
}

check().then(() => prisma.$disconnect()).catch(e => console.error(e));
