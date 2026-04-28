import { prisma } from '../lib/prisma';
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
