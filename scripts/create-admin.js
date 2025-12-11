const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@flumbericoco.com';
    const password = 'c>FK9B6U0u0o';
    const name = 'Admin Flumberico';

    try {
        console.log(`🔨 Creating/Updating admin user: ${email}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create or update user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'admin',
                name,
                // Pastikan admin statusnya active/verified jika ada field tersebut
                // emailVerified: new Date(),
            },
            create: {
                email,
                password: hashedPassword,
                role: 'admin',
                name,
                // emailVerified: new Date(),
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
