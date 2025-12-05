import request from 'supertest';
import { app } from '../src/server';

(async () => {
  try {
    console.log('Consultando /health ...');
    const h = await request(app).get('/health');
    console.log('/health', h.status, h.body);

    console.log('Consultando /api/servicios ...');
    const s = await request(app).get('/api/servicios');
    console.log('/api/servicios', s.status);
    console.log('Response sample keys:', Object.keys(s.body || {}));

    console.log('Consultando /api/auth (GET) ...');
    const a = await request(app).get('/api/auth');
    console.log('/api/auth', a.status);

    process.exit(0);
  } catch (err) {
    console.error('Error en check_endpoints:', err);
    process.exit(1);
  }
})();
