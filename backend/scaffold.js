const fs = require('fs');
const path = require('path');

const files = {
  'src/lib/prisma.ts': `import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
`,

  'src/lib/redis.ts': `import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
`,

  'src/middlewares/auth.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
};
`,

  'src/repositories/user.repository.ts': `import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }
}
`,

  'src/repositories/denuncia.repository.ts': `import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class DenunciaRepository {
  async findAll(skip: number, take: number) {
    return prisma.denuncia.findMany({ skip, take, orderBy: { createdAt: 'desc' } });
  }

  async count() {
    return prisma.denuncia.count();
  }

  async findById(id: number) {
    return prisma.denuncia.findUnique({ where: { id } });
  }

  async create(data: Prisma.DenunciaCreateInput) {
    return prisma.denuncia.create({ data });
  }

  async update(id: number, data: Prisma.DenunciaUpdateInput) {
    return prisma.denuncia.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.denuncia.delete({ where: { id } });
  }
}
`,

  'src/services/user.service.ts': `import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export class UserService {
  private userRepository = new UserRepository();

  async createUser(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || 'DENUNCIANTE'
    });
  }
}
`,

  'src/services/auth.service.ts': `import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepository = new UserRepository();

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }
}
`,

  'src/services/denuncia.service.ts': `import { DenunciaRepository } from '../repositories/denuncia.repository';
import { redis } from '../lib/redis';

export class DenunciaService {
  private denunciaRepository = new DenunciaRepository();

  async getDenuncias(page: number, limit: number) {
    const cacheKey = \`denuncias:\${page}:\${limit}\`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;
    const [denuncias, total] = await Promise.all([
      this.denunciaRepository.findAll(skip, limit),
      this.denunciaRepository.count()
    ]);

    const result = { data: denuncias, meta: { total, page, limit } };
    
    // Store in cache for 60 seconds
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

    return result;
  }

  async getDenunciaById(id: number) {
    return this.denunciaRepository.findById(id);
  }

  async createDenuncia(data: any) {
    const protocolo = data.protocolo || ('SOS-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase());
    
    const denuncia = await this.denunciaRepository.create({
      tipoDenuncia: data.tipoDenuncia,
      identificacao: data.identificacao,
      nomeDenunciante: data.nomeDenunciante || (data.identificacao ? data.userEmail : 'Anônimo'),
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      bairroOcorrencia: data.bairroOcorrencia,
      descricaoOcorrencia: data.descricaoOcorrencia,
      dataOcorrencia: data.dataOcorrencia,
      protocolo,
      situacao: data.situacao || 'Em Andamento',
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });

    // Invalidate cache
    await this.clearCache();
    return denuncia;
  }

  async updateDenuncia(id: number, data: any) {
    const denuncia = await this.denunciaRepository.update(id, data);
    await this.clearCache();
    return denuncia;
  }

  async deleteDenuncia(id: number) {
    await this.denunciaRepository.delete(id);
    await this.clearCache();
  }

  private async clearCache() {
    const keys = await redis.keys('denuncias:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
`,

  'src/controllers/auth.controller.ts': `import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);
      
      // Set token as an HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ user, token });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ success: true });
  }
}
`,

  'src/controllers/user.controller.ts': `import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  async create(req: Request, res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
`,

  'src/controllers/denuncia.controller.ts': `import { Request, Response } from 'express';
import { DenunciaService } from '../services/denuncia.service';

export class DenunciaController {
  private denunciaService = new DenunciaService();

  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query._page as string) || 1;
      const limit = parseInt(req.query._limit as string) || 50;
      const result = await this.denunciaService.getDenuncias(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const denuncia = await this.denunciaService.getDenunciaById(id);
      if (!denuncia) return res.status(404).json({ success: false, error: 'Not found' });
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data = { ...req.body, userId: user.id, userEmail: user.email };
      const denuncia = await this.denunciaService.createDenuncia(data);
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const denuncia = await this.denunciaService.updateDenuncia(id, req.body);
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await this.denunciaService.deleteDenuncia(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
`,

  'src/routes/auth.routes.ts': `import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
`,

  'src/routes/user.routes.ts': `import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

router.post('/', userController.create.bind(userController));

export default router;
`,

  'src/routes/denuncia.routes.ts': `import { Router } from 'express';
import { DenunciaController } from '../controllers/denuncia.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const denunciaController = new DenunciaController();

router.use(authenticate);

router.get('/', denunciaController.list.bind(denunciaController));
router.get('/:id', denunciaController.getById.bind(denunciaController));
router.post('/', denunciaController.create.bind(denunciaController));
router.patch('/:id', denunciaController.update.bind(denunciaController));
router.delete('/:id', denunciaController.delete.bind(denunciaController));

export default router;
`,

  'src/jobs/cron.ts': `import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export const startCronJobs = () => {
  // Limpeza de cache órfão às 3h da manhã
  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Cleaning up old redis cache...');
    const keys = await redis.keys('denuncias:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  // Cálculo de métricas diárias (exemplo)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Consolidating daily metrics...');
    const count = await prisma.denuncia.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0,0,0,0) - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(\`[CRON] Total denuncias created yesterday: \${count}\`);
  });
};
`,

  'src/app.ts': `import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import denunciaRoutes from './routes/denuncia.routes';

const app = express();

app.use(cors({
  origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/denuncias', denunciaRoutes);

export default app;
`,

  'src/server.ts': `import app from './app';
import { startCronJobs } from './jobs/cron';

const PORT = process.env.PORT || 8000;

startCronJobs();

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log('Scaffolding completed successfully.');
