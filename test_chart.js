const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/v1/dashboard/chart-data');
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.log('Error status:', err.response ? err.response.status : 'No response');
    console.log('Error data:', err.response ? err.response.data : err.message);
  }
}

test();
