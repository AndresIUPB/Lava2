import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { logger } from '../utils/logger';

const isDevelopment = process.env.NODE_ENV === 'development';

let redisClient: Redis.Redis;

if (isDevelopment) {
  logger.info('Usando ioredis-mock en entorno de desarrollo');
  redisClient = new RedisMock();
} else {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => {
    logger.error('Error en la conexión con Redis', err);
  });
}

export { redisClient };
