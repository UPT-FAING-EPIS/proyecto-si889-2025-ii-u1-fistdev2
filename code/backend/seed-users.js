const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Creando usuarios en la base de datos...\n');

    // Hashear las contraseñas
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Crear usuario Sergio
    const sergio = await prisma.user.upsert({
      where: { email: 'Sergio@gmail.com' },
      update: {},
      create: {
        email: 'Sergio@gmail.com',
        password: hashedPassword,
        name: 'Sergio',
        roles: ['user']
      }
    });

    console.log('✅ Usuario Sergio creado:', {
      id: sergio.id,
      email: sergio.email,
      name: sergio.name,
      roles: sergio.roles
    });

    // Crear usuario Walter
    const walter = await prisma.user.upsert({
      where: { email: 'Walter@gmail.com' },
      update: {},
      create: {
        email: 'Walter@gmail.com',
        password: hashedPassword,
        name: 'Walter',
        roles: ['user']
      }
    });

    console.log('✅ Usuario Walter creado:', {
      id: walter.id,
      email: walter.email,
      name: walter.name,
      roles: walter.roles
    });

    // Crear un usuario admin para pruebas
    const admin = await prisma.user.upsert({
      where: { email: 'admin@devflow.com' },
      update: {},
      create: {
        email: 'admin@devflow.com',
        password: hashedPassword,
        name: 'Administrador',
        roles: ['admin', 'user']
      }
    });

    console.log('✅ Usuario Admin creado:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      roles: admin.roles
    });

    console.log('\n🎉 Todos los usuarios han sido creados exitosamente!');

  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();