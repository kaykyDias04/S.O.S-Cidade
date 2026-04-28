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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const startCronJobs = () => {
    // Limpeza de cache órfão às 3h da manhã
    node_cron_1.default.schedule('0 3 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('[CRON] Cleaning up old redis cache...');
        const keys = yield redis_1.redis.keys('denuncias:*');
        if (keys.length > 0) {
            yield redis_1.redis.del(...keys);
        }
    }));
    // Cálculo de métricas diárias (exemplo)
    node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('[CRON] Consolidating daily metrics...');
        const count = yield prisma_1.prisma.denuncia.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000)
                }
            }
        });
        console.log(`[CRON] Total denuncias created yesterday: ${count}`);
    }));
};
exports.startCronJobs = startCronJobs;
