const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let authToken = null;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1${path}`,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Starting API Tests...');
  let hasErrors = false;

  // 0. Auth
  console.log('\n--- Auth ---');
  const testUser = `test_admin_${Date.now()}`;
  res = await request('POST', '/auth/register', {
    username: testUser,
    password: 'password123',
    role: 'admin'
  });
  console.log('POST /auth/register:', res.status, res.data);

  res = await request('POST', '/auth/login', {
    username: testUser,
    password: 'password123'
  });
  console.log('POST /auth/login:', res.status);
  if (res.data && res.data.token) {
    authToken = res.data.token;
    console.log('Got Auth Token');
  } else {
    console.log('Failed to get token:', res.data);
    return;
  }

  // 1. Test Warehouses
  console.log('\n--- Warehouses ---');
  res = await request('GET', '/warehouses');
  console.log('GET /warehouses:', res.status);
  if (res.status >= 500) hasErrors = true;

  res = await request('GET', '/warehouses/count');
  console.log('GET /warehouses/count:', res.status, res.data);
  if (res.status >= 500) hasErrors = true;

  // Create a warehouse
  const whId = `TEST_WH_${Date.now()}`;
  res = await request('POST', '/warehouses', {
    custom_id: whId,
    name: 'Test Warehouse',
    location: 'Test Location',
    capacity: 1000
  });
  console.log('POST /warehouses:', res.status, res.data);
  if (res.status >= 500) hasErrors = true;

  // Get specific warehouse
  res = await request('GET', `/warehouses/${whId}`);
  console.log(`GET /warehouses/${whId}:`, res.status);
  if (res.status >= 500) hasErrors = true;

  // 2. Test Products
  console.log('\n--- Products ---');
  res = await request('GET', '/products');
  console.log('GET /products:', res.status);
  if (res.status >= 500) hasErrors = true;

  const prodId = `TEST_PROD_${Date.now()}`;
  res = await request('POST', '/products', {
    customId: prodId,
    name: 'Test Product',
    price: 100,
    category: 'Test',
    brand: 'Test'
  });
  console.log('POST /products:', res.status, res.data);
  let dbProductId = null;
  if (res.data && res.data.id) {
    dbProductId = res.data.id;
  }
  if (res.status >= 500) hasErrors = true;

  // 3. Test Inventory
  console.log('\n--- Inventory ---');
  res = await request('GET', '/inventory');
  console.log('GET /inventory:', res.status);
  if (res.status >= 500) hasErrors = true;

  res = await request('POST', '/inventory/import', {
    warehouse_id: whId,
    supplier_id: 'SUP1',
    products: [{ product_id: prodId, quantity: 50 }]
  });
  console.log('POST /inventory/import:', res.status, res.data);
  if (res.status >= 500) hasErrors = true;

  res = await request('POST', '/inventory/export', {
    warehouse_id: whId,
    customer_name: 'CUST1',
    products: [{ product_id: prodId, quantity: 10 }]
  });
  console.log('POST /inventory/export:', res.status, res.data);
  if (res.status >= 500) hasErrors = true;

  // Inventory transactions
  res = await request('GET', '/inventory/transactions');
  console.log('GET /inventory/transactions:', res.status);
  if (res.status >= 500) hasErrors = true;

  // Edge cases
  console.log('\n--- Edge Cases ---');
  res = await request('POST', '/inventory/export', {
    warehouse_id: whId,
    customer_name: 'CUST1',
    products: [{ product_id: prodId, quantity: 9999 }] // Over export
  });
  console.log('POST /inventory/export (over export):', res.status, res.data);
  if (res.status >= 500) hasErrors = true;

  res = await request('POST', '/inventory/import', {
    warehouse_id: whId,
    supplier_id: 'SUP1',
    products: [{ product_id: prodId, quantity: 99999 }] // Over capacity
  });
  console.log('POST /inventory/import (over capacity):', res.status, res.data);
  if (res.status >= 500) hasErrors = true;

  // Clean up
  console.log('\n--- Clean up ---');
  if (dbProductId) {
    res = await request('DELETE', `/products/${dbProductId}`);
    console.log(`DELETE /products/${dbProductId}:`, res.status);
  }

  res = await request('DELETE', `/warehouses/${whId}`);
  console.log(`DELETE /warehouses/${whId}:`, res.status);

  console.log('\n--- Summary ---');
  if (hasErrors) {
    console.log('Errors encountered (5xx responses).');
  } else {
    console.log('No 5xx errors encountered.');
  }
}

runTests().catch(console.error);