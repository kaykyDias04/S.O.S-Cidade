import { DenunciaRepository } from '../repositories/denuncia.repository';
import { redisGet, redisSet, redisDel, redisKeys } from '../lib/redis';

export class DenunciaService {
  private denunciaRepository = new DenunciaRepository();

  // Deserializa o campo imagens de string JSON para array
  private parseImagens(d: any) {
    if (!d) return d;
    try {
      return { ...d, imagens: d.imagens ? JSON.parse(d.imagens) : null };
    } catch {
      return { ...d, imagens: null };
    }
  }

  async getDenuncias(page: number, limit: number) {
    const cacheKey = `denuncias:${page}:${limit}`;
    
    
    const cached = await redisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;
    const [denuncias, total] = await Promise.all([
      this.denunciaRepository.findAll(skip, limit),
      this.denunciaRepository.count()
    ]);

    const result = {
      data: denuncias.map((d) => this.parseImagens(d)),
      meta: { total, page, limit }
    };
    
    
    await redisSet(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getDenunciaById(id: number) {
    const d = await this.denunciaRepository.findById(id);
    return this.parseImagens(d);
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
      imagens: data.imagens ? JSON.stringify(data.imagens) : null,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });

    
    await this.clearCache();
    return this.parseImagens(denuncia);
  }

  async updateDenuncia(id: number, data: any) {
    const denuncia = await this.denunciaRepository.update(id, data);
    await this.clearCache();
    return this.parseImagens(denuncia);
  }

  async deleteDenuncia(id: number) {
    await this.denunciaRepository.delete(id);
    await this.clearCache();
  }

  private async clearCache() {
    const keys = await redisKeys('denuncias:*');
    await redisDel(...keys);
  }
}
