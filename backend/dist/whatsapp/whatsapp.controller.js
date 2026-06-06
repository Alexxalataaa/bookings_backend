"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const whatsapp_service_1 = require("./whatsapp.service");
let WhatsappController = class WhatsappController {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    verifyWebhook(mode, token, challenge, res) {
        const result = this.whatsappService.verifyWebhook(mode, token, challenge);
        if (result !== null) {
            return res.status(200).send(result);
        }
        return res.status(403).send('Forbidden');
    }
    async receiveMessage(body) {
        try {
            const entry = body?.entry?.[0];
            const changes = entry?.changes?.[0];
            const message = changes?.value?.messages?.[0];
            if (!message || message.type !== 'text') {
                return { status: 'ignored' };
            }
            const phoneNumber = message.from;
            const text = message.text?.body || '';
            await this.whatsappService.processMessage(phoneNumber, text);
            return { status: 'received' };
        }
        catch {
            return { status: 'error' };
        }
    }
    async simulate(body) {
        const reply = await this.whatsappService.processMessage(body.phoneNumber || 'simulator_demo', body.message);
        return { reply };
    }
    getSessions() {
        return this.whatsappService.getActiveSessions();
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'WhatsApp webhook verification (Meta handshake)' }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Receive incoming WhatsApp messages from Meta' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "receiveMessage", null);
__decorate([
    (0, common_1.Post)('simulate'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate a WhatsApp conversation (admin panel demo)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "simulate", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active WhatsApp conversation sessions (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getSessions", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, swagger_1.ApiTags)('whatsapp'),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map