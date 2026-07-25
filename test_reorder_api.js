const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/organization/reorder',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({
  type: 'USER',
  items: [{ id: '00000000-0000-0000-0000-000000000000', sortOrder: 0 }]
}));
req.end();
