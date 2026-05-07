import app from './app';
import { startCronJobs } from './jobs/cron';

const PORT = parseInt(process.env.PORT || '8000', 10);

// Health check route
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'SOS Cidade API is running' });
});

// Always start the server (Render is a persistent server, not serverless)
startCronJobs();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;
