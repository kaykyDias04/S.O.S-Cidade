"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenunciaService = void 0;
const denuncia_repository_1 = require("../repositories/denuncia.repository");
const redis_1 = require("../lib/redis");
class DenunciaService {
    constructor() {
        this.denunciaRepository = new denuncia_repository_1.DenunciaRepository();
    }
    getDenuncias(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `denuncias:${page}:${limit}`;
            // Try cache first
            const cached = yield redis_1.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const skip = (page - 1) * limit;
            const [denuncias, total] = yield Promise.all([
                this.denunciaRepository.findAll(skip, limit),
                this.denunciaRepository.count()
            ]);
            const result = { data: denuncias, meta: { total, page, limit } };
            // Store in cache for 60 seconds
            yield redis_1.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
            return result;
        });
    }
    getDenunciaById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.denunciaRepository.findById(id);
        });
    }
    createDenuncia(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const protocolo = data.protocolo || ('SOS-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase());
            const denuncia = yield this.denunciaRepository.create({
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
            yield this.clearCache();
            return denuncia;
        });
    }
    updateDenuncia(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const denuncia = yield this.denunciaRepository.update(id, data);
            yield this.clearCache();
            return denuncia;
        });
    }
    deleteDenuncia(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.denunciaRepository.delete(id);
            yield this.clearCache();
        });
    }
    clearCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield redis_1.redis.keys('denuncias:*');
            if (keys.length > 0) {
                yield redis_1.redis.del(...keys);
            }
        });
    }
}
exports.DenunciaService = DenunciaService;
