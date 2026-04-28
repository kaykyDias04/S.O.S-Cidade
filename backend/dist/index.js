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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Auth middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }
            req.user = user;
            next();
        });
    }
    else {
        res.status(401).json({ success: false, error: 'Unauthorized' });
    }
};
// --- AUTH ROUTES ---
app.post('/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
// --- USERS ROUTES ---
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, password, role } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role || 'DENUNCIANTE'
            }
        });
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
// --- DENUNCIAS ROUTES ---
app.get('/denuncias', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query._page) || 1;
        const limit = parseInt(req.query._limit) || 50;
        const skip = (page - 1) * limit;
        const [denuncias, total] = yield Promise.all([
            prisma.denuncia.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
            prisma.denuncia.count()
        ]);
        res.json({
            data: denuncias,
            meta: { total, page, limit }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
app.get('/denuncias/:id', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const denuncia = yield prisma.denuncia.findUnique({ where: { id } });
        if (!denuncia)
            return res.status(404).json({ success: false, error: 'Not found' });
        res.json(denuncia);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
app.post('/denuncias', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { tipoDenuncia, identificacao, bairroOcorrencia, descricaoOcorrencia, dataOcorrencia, protocolo: reqProtocolo, situacao, createdAt, updatedAt } = req.body;
        const protocolo = reqProtocolo || ('SOS-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase());
        const denuncia = yield prisma.denuncia.create({
            data: {
                tipoDenuncia,
                identificacao,
                nomeDenunciante: req.body.nomeDenunciante || (identificacao ? user.email : 'Anônimo'),
                userId: user.id,
                bairroOcorrencia,
                descricaoOcorrencia,
                dataOcorrencia,
                protocolo,
                situacao: situacao || 'Em Andamento',
                createdAt: createdAt ? new Date(createdAt) : undefined,
                updatedAt: updatedAt ? new Date(updatedAt) : undefined,
            }
        });
        res.json(denuncia);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
app.patch('/denuncias/:id', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        const denuncia = yield prisma.denuncia.update({
            where: { id },
            data
        });
        res.json(denuncia);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
app.delete('/denuncias/:id', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prisma.denuncia.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
// Default start script wrapper to run migrations then start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
