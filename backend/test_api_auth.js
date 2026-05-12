const http = require('http');

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTING AUTH API ---');
  let token = '';
  
  // 1. Register User
  console.log('\n[POST] /api/v1/auth/register');
  const regRes = await request('POST', '/api/v1/auth/register', { username: 'testuser2', password: 'password123' });
  console.log(`Status: ${regRes.status}, Data:`, regRes.data);
  
  // 2. Login User
  console.log('\n[POST] /api/v1/auth/login');
  const loginRes = await request('POST', '/api/v1/auth/login', { username: 'testuser2', password: 'password123' });
  console.log(`Status: ${loginRes.status}, Data:`, loginRes.data);
  if (loginRes.data.token) {
      token = loginRes.data.token;
  }
  
  // 3. Login Admin (Assuming default admin/admin exists)
  console.log('\n[POST] /api/v1/auth/login (Admin)');
  const adminLogin = await request('POST', '/api/v1/auth/login', { username: 'admin', password: 'admin123' }); // Might fail if password is diff
  console.log(`Status: ${adminLogin.status}, Data:`, adminLogin.data);
  let adminToken = adminLogin.data.token || '';
  
  console.log('\n--- TESTING USERS API ---');
  
  // 4. Get Users (Admin token required)
  console.log('\n[GET] /api/v1/users');
  const getUsersRes = await request('GET', '/api/v1/users', null, adminToken);
  console.log(`Status: ${getUsersRes.status}, Data:`, getUsersRes.data);
  
  // 5. Get Users count
  console.log('\n[GET] /api/v1/users/count');
  const getCountRes = await request('GET', '/api/v1/users/count', null, adminToken);
  console.log(`Status: ${getCountRes.status}, Data:`, getCountRes.data);
  
  // 6. Logout
  console.log('\n[POST] /api/v1/auth/logout');
  const logoutRes = await request('POST', '/api/v1/auth/logout');
  console.log(`Status: ${logoutRes.status}, Data:`, logoutRes.data);
}

runTests().catch(console.error);
