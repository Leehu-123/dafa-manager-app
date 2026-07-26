const fs = require('fs');
const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('Uploading dist.tar.gz and schema.prisma...');
    sftp.fastPut('../Core-API/dist.tar.gz', '/var/www/Core-API/dist.tar.gz', (err) => {
      if (err) throw err;
      sftp.fastPut('../Core-API/prisma/schema.prisma', '/var/www/Core-API/schema.prisma', (err2) => {
        if (err2) throw err2;
        console.log('Upload complete, extracting and updating schema...');
        const cmd = `
          cd /var/www/Core-API
          rm -rf dist_new && mkdir dist_new
          tar -xzf dist.tar.gz -C dist_new
          docker cp dist_new/. core_api_app:/app/dist/
          docker cp schema.prisma core_api_app:/app/prisma/schema.prisma
          docker exec -u root core_api_app npx prisma db push --accept-data-loss
          docker exec -u root core_api_app npx prisma generate
          docker restart core_api_app
        `;
        conn.exec(cmd, (err3, stream) => {
          if (err3) throw err3;
          stream.on('close', (code, signal) => {
            console.log('Done.');
            conn.end();
          }).on('data', (data) => {
            console.log('' + data);
          }).stderr.on('data', (data) => {
            console.error('' + data);
          });
        });
      });
    });
  });
}).connect({
  host: '103.176.178.81',
  port: 22,
  username: 'root',
  password: 'Y6zqYBaga5UD5HWe'
});
