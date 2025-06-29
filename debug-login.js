// Login Debug Script
// Simpan sebagai: debug-login.js
// Jalankan dengan: node debug-login.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function debugLogin() {
  console.log('🔍 LOGIN DEBUG SCRIPT');
  console.log('=====================');
  
  try {
    // 1. Test Database Connection
    console.log('\n1. 🔌 Testing Database Connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // 2. Check if user exists
    console.log('\n2. 👤 Checking User in Database...');
    const testEmail = 'qori@gmail.com'; // Email yang Anda coba login
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ User tidak ditemukan dengan email:', testEmail);
      console.log('💡 Solusi: Register user dulu atau gunakan email yang benar');
      
      // List existing users
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true }
      });
      console.log('📋 Available users:');
      allUsers.forEach(u => {
        console.log(`   • ${u.email} (${u.name}) - ${u.role}`);
      });
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
    
    // 3. Test Password Verification
    console.log('\n3. 🔐 Testing Password Verification...');
    const testPassword = '1234567890'; // Password yang Anda coba
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Password tidak match');
      console.log('💡 Solusi: Gunakan password yang benar atau reset password');
      
      // Test dengan sample passwords
      const commonPasswords = ['password123', '123456', 'admin123'];
      console.log('🧪 Testing common passwords...');
      
      for (const pwd of commonPasswords) {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          console.log(`✅ Password match: "${pwd}"`);
          break;
        }
      }
      return;
    }
    
    console.log('✅ Password verification successful');
    
    // 4. Test JWT Token Generation
    console.log('\n4. 🎫 Testing JWT Token Generation...');
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    console.log('JWT_SECRET:', JWT_SECRET ? 'PROVIDED' : 'MISSING');
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // 5. Test Token Verification
    console.log('\n5. ✅ Testing Token Verification...');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verification successful');
    console.log('Decoded payload:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      exp: new Date(decoded.exp * 1000)
    });
    
    // 6. Simulate API Response
    console.log('\n6. 📤 Simulating API Response...');
    
    const apiResponse = {
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
      },
      redirect: {
        url: user.role === 'ADMIN' ? '/dashboard/admin' : 
             user.role === 'INSTRUCTOR' ? '/dashboard/instructor' : 
             '/dashboard/student',
        reason: 'role_default'
      }
    };
    
    console.log('✅ API Response would be:', JSON.stringify(apiResponse, null, 2));
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('💡 If login still fails, check:');
    console.log('   • Frontend request format');
    console.log('   • Network tab in browser');
    console.log('   • Server terminal for exact error');
    
  } catch (error) {
    console.error('\n❌ DEBUG ERROR:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Database connection failed - start PostgreSQL');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('💡 JWT error - check JWT_SECRET in .env');
    } else if (error.code === 'P2025') {
      console.log('💡 Record not found - user doesn\'t exist');
    } else {
      console.log('💡 Unknown error - check implementation');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Test API Endpoint Function
async function testAPIEndpoint() {
  console.log('\n🌐 TESTING API ENDPOINT');
  console.log('=======================');
  
  const loginData = {
    email: 'qori@gmail.com',
    password: '1234567890',
    rememberMe: false
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      const jsonData = JSON.parse(data);
      console.log('✅ API call successful:', jsonData);
    } else {
      console.log('❌ API call failed');
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    console.log('💡 Make sure Next.js server is running on http://localhost:3000');
  }
}

// Run the debug
debugLogin().then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('Want to test API endpoint directly? Uncomment the line below:');
  console.log('testAPIEndpoint();');
});