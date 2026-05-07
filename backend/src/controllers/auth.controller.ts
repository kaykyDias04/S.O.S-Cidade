import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);
      
      // Cross-domain cookies (Vercel frontend + Render backend) require
      // sameSite: 'none' and secure: true
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: true, // always true — Render and Vercel are always HTTPS
        sameSite: 'none', // required for cross-domain requests
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({ user, token });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ success: true });
  }
}
