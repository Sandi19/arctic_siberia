const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  console.log('🔌 Testing database connection...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version();`;
    console.log('📊 PostgreSQL version:', result[0]?.version);
    
    // List tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
    // Test if Prisma tables exist
    const prismaTablesCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '_prisma_migrations';
    `;
    
    if (prismaTablesCheck[0].count > 0) {
      console.log('✅ Prisma migration table exists');
    } else {
      console.log('⚠️  Prisma migration table not found - need to run migrations');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution: Start PostgreSQL service');
      console.log('   macOS: brew services start postgresql');
      console.log('   Linux: sudo systemctl start postgresql');
      console.log('   Windows: net start postgresql-x64-14');
    } else if (error.code === '28P01') {
      console.log('💡 Solution: Check username/password in DATABASE_URL');
      console.log('   Current DATABASE_URL uses postgres:3119');
    } else if (error.code === '3D000') {
      console.log('💡 Solution: Create database "db_as"');
      console.log('   Run: createdb db_as');
      console.log('   Or manually: psql -U postgres -c "CREATE DATABASE db_as;"');
    } else if (error.message.includes('password authentication failed')) {
      console.log('💡 Solution: Password authentication failed');
      console.log('   Check if password "3119" is correct for user "postgres"');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();