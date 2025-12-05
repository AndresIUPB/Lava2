import { createClient } from 'redis';
import { logger } from '../utils/logger';

const isDevelopment = process.env.NODE_ENV === 'development';

let redisClient: any;

if (isDevelopment) {
  logger.info('Usando mock en memoria para Redis en entorno de desarrollo');

  class MemoryRedis {
    private store: Map<string, string> = new Map();

    on(_event: string, _cb: (...args: any[]) => void): void {
      // noop - eventos no necesarios para mock
    }

    async get(key: string): Promise<string | null> {
      return this.store.has(key) ? this.store.get(key) as string : null;
    }

    async set(key: string, value: string): Promise<'OK'> {
      this.store.set(key, value);
      return 'OK';
    }

    async del(key: string): Promise<number> {
      return this.store.delete(key) ? 1 : 0;
    }

    async connect(): Promise<void> {
      // noop
    }

    async quit(): Promise<void> {
      // noop
    }
  }

  redisClient = new MemoryRedis();
} else {
  const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`;
  redisClient = createClient({ url });

  redisClient.on('error', (err: any) => {
    logger.error('Error en la conexión con Redis', err);
  });

  // Intentar conectar y reportar si falla
  (async () => {
    try {
      await redisClient.connect();
      logger.info('Conectado a Redis');
    } catch (err: any) {
      logger.error('No se pudo conectar a Redis', err);
    }
  })();
}

export { redisClient };
