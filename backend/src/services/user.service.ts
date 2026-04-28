import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';

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
