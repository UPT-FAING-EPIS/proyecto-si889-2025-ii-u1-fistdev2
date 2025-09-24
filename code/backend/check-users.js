const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos');
    } else {
      console.log(`✅ Se encontraron ${users.length} usuarios:`);
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Usuario:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.name}`);
        console.log(`   Roles: ${user.roles.join(', ')}`);
        console.log(`   Creado: ${user.createdAt.toISOString()}`);
      });
    }

    // Verificar específicamente los usuarios mencionados
    console.log('\n🔍 Verificando usuarios específicos...');
    
    const sergio = await prisma.user.findUnique({
      where: { email: 'Sergio@gmail.com' }
    });
    
    const walter = await prisma.user.findUnique({
      where: { email: 'Walter@gmail.com' }
    });

    console.log(`Sergio (Sergio@gmail.com): ${sergio ? '✅ Encontrado' : '❌ No encontrado'}`);
    console.log(`Walter (Walter@gmail.com): ${walter ? '✅ Encontrado' : '❌ No encontrado'}`);

  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();