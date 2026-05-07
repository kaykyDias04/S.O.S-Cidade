import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import denunciaRoutes from './routes/denuncia.routes';

const app = express();

// Build allowed origins from env vars + local defaults
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
];

// Accept multiple frontend URLs from a comma-separated env var, e.g.:
// FRONTEND_URL=https://sos-cidade-front.vercel.app,https://sos-cidade.vercel.app
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((url) => {
    allowedOrigins.push(url.trim());
    // Also accept without trailing slash
    allowedOrigins.push(url.trim().replace(/\/$/, ''));
  });
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Handle OPTIONS preflight for all routes BEFORE other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/denuncias', denunciaRoutes);

export default app;
