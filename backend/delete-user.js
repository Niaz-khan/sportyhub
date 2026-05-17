require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const email = process.argv[2] || 'usman@example.com';

const deleteUser = async () => {
    try {
        const result = await prisma.user.deleteMany({
            where: { email },
        });

        if (result.count > 0) {
            console.log(`User deleted successfully: ${email}`);
        } else {
            console.log(`User not found: ${email}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
};

deleteUser();
