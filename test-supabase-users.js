const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Configuration Check:');
console.log('URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function checkUsersTable() {
  console.log('\n👥 Checking users table...');
  
  try {
    // Check if users table exists and has data
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Error accessing users table:', error.message);
      return;
    }
    
    console.log(`✅ Users table accessible. Found ${users.length} users:`);
    
    if (users.length === 0) {
      console.log('📝 No users found in the table.');
    } else {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}`);
        console.log(`     Username: ${user.username}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Created: ${user.created_at}`);
        console.log('');
      });
    }
  } catch (err) {
    console.error('❌ Error checking users table:', err.message);
  }
}

async function testAuthTables() {
  console.log('\n🔐 Checking auth tables...');
  
  try {
    // Check auth.users table (this is Supabase's built-in auth table)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('ℹ️  Cannot access auth.users (requires admin privileges)');
      console.log('   This is normal for client-side access');
    } else {
      console.log(`✅ Auth users table accessible. Found ${authUsers.users.length} users:`);
      authUsers.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`     Created: ${user.created_at}`);
        console.log('');
      });
    }
  } catch (err) {
    console.log('ℹ️  Cannot access auth.users (requires admin privileges)');
    console.log('   This is normal for client-side access');
  }
}

async function testLogin(email, password) {
  console.log(`\n🔑 Testing login with email: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.log(`❌ Login failed: ${error.message}`);
      return false;
    }
    
    if (data.user) {
      console.log('✅ Login successful!');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Username: ${data.user.user_metadata?.username || 'Not set'}`);
      
      // Sign out after test
      await supabase.auth.signOut();
      console.log('   Signed out after test');
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase User Table Check...\n');
  
  // Test connection
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.log('❌ Cannot proceed without connection');
    return;
  }
  
  // Check users table
  await checkUsersTable();
  
  // Check auth tables
  await testAuthTables();
  
  // Test login if credentials provided
  const testEmail = process.argv[2];
  const testPassword = process.argv[3];
  
  if (testEmail && testPassword) {
    await testLogin(testEmail, testPassword);
  } else {
    console.log('\n💡 To test login, run:');
    console.log(`   node test-supabase-users.js "email@example.com" "password"`);
  }
  
  console.log('\n✨ Check complete!');
}

// Run the main function
main().catch(console.error);




