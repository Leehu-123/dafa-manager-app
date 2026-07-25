const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  conn.exec('cd /var/www/Core-API && git log -1', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code, signal) => {
      console.log('Output:\n' + output);
      conn.end();
    }).on('data', (data) => {
      output += data;
    });
  });
}).connect({
  host: '103.176.178.81',
  port: 22,
  username: 'root',
  password: 'Y6zqYBaga5UD5HWe',
  readyTimeout: 10000
});
