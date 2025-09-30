const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test database connection
const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    
    // Simple connection test
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed!');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error details:', error.message);
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('💡 Troubleshooting: Check if your database server is running and accessible');
    } else if (error.message.includes('Access denied')) {
      console.error('💡 Troubleshooting: Check your database credentials (username/password)');
    } else if (error.message.includes('Unknown database')) {
      console.error('💡 Troubleshooting: Check if the database name exists');
    } else if (error.message.includes('SSL')) {
      console.error('💡 Troubleshooting: Add ?sslaccept=strict to your DATABASE_URL');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

// Initialize database connection with retry
const initializeDatabase = async () => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    const connected = await testDatabaseConnection();
    if (connected) {
      return true;
    }
    
    retries++;
    if (retries < maxRetries) {
      console.log(`🔄 Retrying connection... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
  }
  
  console.error('❌ Failed to connect to database after multiple attempts');
  process.exit(1);
};

module.exports = {
  prisma,
  testDatabaseConnection,
  initializeDatabase
};
