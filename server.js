// Entry point for MyDevil.net Passenger (Node.js)
// Always run in production mode
process.env.NODE_ENV = 'production';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dir = __dirname;
const app = next({ dev: false, dir });
const handle = app.getRequestHandler();

const port = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(async () => {
  // Initialize DB tables
  try {
    const { initDB } = await import('./lib/storage/db.js');
    await initDB();
    console.log('> Database initialized');
  } catch (err) {
    console.error('Database init failed:', err);
    process.exit(1);
  }

  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, '127.0.0.1', () => {
    console.log(`> CV Tailor ready on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
