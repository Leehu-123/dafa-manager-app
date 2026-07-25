const http = require('http');

const data = JSON.stringify({
  fullName: "Trần Đăng Kiệt",
  email: "owner@dafa.com",
  phone: "",
  password: "password123",
  role: "ADMIN",
  jobTitle: "Chủ Tịch",
  branchId: "",
  departmentIds: [],
  isActive: true
});

const options = {
  hostname: 'localhost',
  port: 3005,
  path: '/api/organization/employees',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // Need a dummy cookie or auth mechanism to bypass auth? 
    // Ah, the API requires `await auth()`! I cannot easily hit it from a script without a valid NextAuth session.
  }
};
