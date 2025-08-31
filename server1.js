const http = require('http');
const router = require('./router');
require('dotenv').config();
const { PORT } = process.env;

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});