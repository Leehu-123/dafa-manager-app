const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS. Searching for project directories...');
  const cmd = `find /var /home /root /opt -type d \\( -name "Core-API" -o -name "dafa-manager" \\) 2>/dev/null`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code, signal) => {
      console.log('\n--- SEARCH RESULTS ---');
      console.log(output.trim() || 'No directories found.');
      console.log('----------------------');
      conn.end();
    }).on('data', (data) => {
      output += data;
    });
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
}).connect({
  host: '103.176.178.81',
  port: 22,
  username: 'root',
  password: 'Y6zqYBaga5UD5HWe',
  readyTimeout: 10000
});
