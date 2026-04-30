import app from './app';
import { startCronJobs } from './jobs/cron';

const PORT = process.env.PORT || 8000;

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SOS Cidade API is running' });
});

if (process.env.NODE_ENV !== 'production') {
  startCronJobs();
  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
