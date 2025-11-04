#!/usr/bin/env node

/**
 * Helper script to validate and construct Supabase connection string
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function urlEncode(str) {
  return encodeURIComponent(str);
}

function validateConnectionString(connStr) {
  try {
    const url = new URL(connStr);
    
    // Check protocol
    if (url.protocol !== 'postgresql:') {
      return { valid: false, error: 'Protocol must be postgresql:' };
    }
    
    // Check username format (should be postgres.PROJECT_REF)
    if (!url.username || !url.username.startsWith('postgres.')) {
      return { valid: false, error: 'Username must be postgres.PROJECT_REF (e.g., postgres.yfqcfxxuefrprxzngkhk)' };
    }
    
    // Check hostname format
    if (!url.hostname.includes('pooler.supabase.com')) {
      return { valid: false, error: 'Hostname must be aws-0-[REGION].pooler.supabase.com' };
    }
    
    // Check port
    if (url.port !== '6543') {
      return { valid: false, error: 'Port must be 6543 for Transaction Pooler' };
    }
    
    // Check database
    if (url.pathname !== '/postgres') {
      return { valid: false, error: 'Database path must be /postgres' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function constructConnectionString(projectRef, password, region) {
  // URL encode the password
  const encodedPassword = urlEncode(password);
  
  // Construct connection string
  const connStr = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  
  return connStr;
}

console.log('🔍 Supabase Connection String Validator\n');
console.log('This script will help you construct a valid connection string.\n');

rl.question('Enter your Supabase project ref (e.g., yfqcfxxuefrprxzngkhk): ', (projectRef) => {
  rl.question('Enter your database password (input will be hidden): ', (password) => {
    rl.question('Enter your region (e.g., us-west-1, us-east-1, eu-west-1): ', (region) => {
      console.log('\n📋 Constructing connection string...\n');
      
      const connStr = constructConnectionString(projectRef.trim(), password.trim(), region.trim());
      
      console.log('✅ Generated connection string:');
      console.log(connStr);
      console.log('\n🔍 Validating...\n');
      
      const validation = validateConnectionString(connStr);
      
      if (validation.valid) {
        console.log('✅ Connection string is valid!');
        console.log('\n📝 To use this connection string:');
        console.log(`export DATABASE_URL="${connStr}"`);
        console.log('\n🧪 To test:');
        console.log('npx prisma db pull --print');
      } else {
        console.log('❌ Connection string is invalid:');
        console.log(`   ${validation.error}`);
      }
      
      console.log('\n💡 Tip: If you have special characters in your password, they are automatically URL-encoded.');
      console.log('   Common special characters: @ → %40, # → %23, $ → %24, & → %26\n');
      
      rl.close();
    });
  });
});

