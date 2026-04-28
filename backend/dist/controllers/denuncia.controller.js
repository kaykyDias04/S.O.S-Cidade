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
exports.DenunciaController = void 0;
const denuncia_service_1 = require("../services/denuncia.service");
class DenunciaController {
    constructor() {
        this.denunciaService = new denuncia_service_1.DenunciaService();
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query._page) || 1;
                const limit = parseInt(req.query._limit) || 50;
                const result = yield this.denunciaService.getDenuncias(page, limit);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const denuncia = yield this.denunciaService.getDenunciaById(id);
                if (!denuncia)
                    return res.status(404).json({ success: false, error: 'Not found' });
                res.json(denuncia);
            }
            catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const data = Object.assign(Object.assign({}, req.body), { userId: user.id, userEmail: user.email });
                const denuncia = yield this.denunciaService.createDenuncia(data);
                res.json(denuncia);
            }
            catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const denuncia = yield this.denunciaService.updateDenuncia(id, req.body);
                res.json(denuncia);
            }
            catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                yield this.denunciaService.deleteDenuncia(id);
                res.json({ success: true });
            }
            catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        });
    }
}
exports.DenunciaController = DenunciaController;
