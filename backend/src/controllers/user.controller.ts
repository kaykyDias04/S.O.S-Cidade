import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  async create(req: Request, res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          success: false, 
          error: 'Este email já está cadastrado.' 
        });
      }

      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }
}
