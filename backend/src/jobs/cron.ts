import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { redisKeys, redisDel } from '../lib/redis';

export const startCronJobs = () => {
  
  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Cleaning up old redis cache...');
    const keys = await redisKeys('denuncias:*');
    await redisDel(...keys);
  });

  
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Consolidating daily metrics...');
    const count = await prisma.denuncia.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0,0,0,0) - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`[CRON] Total denuncias created yesterday: ${count}`);
  });
};
