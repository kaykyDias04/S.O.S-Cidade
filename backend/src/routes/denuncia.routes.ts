import { Router } from 'express';
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
