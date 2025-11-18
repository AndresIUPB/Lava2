import express from 'express';
import dotenv from 'dotenv';
import * as fs from 'fs';

// Log to file
const logFile = 'server.log';
fs.writeFileSync(logFile, `[${new Date().toISOString()}] Starting server\n`);

const log = (msg: string) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  fs.appendFileSync(logFile, line);
};

try {
  log('Loading dotenv...');
  dotenv.config();
  log('Dotenv loaded');

  log('Creating Express app...');
  const app = express();
  log('App created');

  const PORT = 3000;

  log('Setting up route...');
  app.get('/health', (_req, res) => {
    log('Health endpoint called');
    res.json({ ok: true });
  });
  log('Route set up');

  log('Starting listener...');
  app.listen(PORT, () => {
    log(`✅ Server listening on port ${PORT}`);
  });
  log('Listener started');
} catch (error) {
  log(`ERROR: ${error}`);
  process.exit(1);
}
