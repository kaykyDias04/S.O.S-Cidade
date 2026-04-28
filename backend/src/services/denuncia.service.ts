import { DenunciaRepository } from '../repositories/denuncia.repository';
import { redis } from '../lib/redis';

export class DenunciaService {
  private denunciaRepository = new DenunciaRepository();

  async getDenuncias(page: number, limit: number) {
    const cacheKey = `denuncias:${page}:${limit}`;
    
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
