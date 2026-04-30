import app from './app';
import { startCronJobs } from './jobs/cron';

const PORT = process.env.PORT || 8000;

startCronJobs();

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
