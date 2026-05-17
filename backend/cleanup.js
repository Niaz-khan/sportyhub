require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const clearData = async () => {
    try {
        await prisma.review.deleteMany();
        await prisma.reply.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.order.deleteMany();
        await prisma.blog.deleteMany();
        await prisma.expertTip.deleteMany();
        await prisma.product.deleteMany();
        await prisma.user.deleteMany();

        console.log('All PostgreSQL data cleared successfully.');
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
};

clearData();
