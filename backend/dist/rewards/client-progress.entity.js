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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProgress = void 0;
const typeorm_1 = require("typeorm");
const business_entity_1 = require("../businesses/business.entity");
const user_entity_1 = require("../auth/user.entity");
let ClientProgress = class ClientProgress {
    id;
    points;
    user;
    business;
    updatedAt;
};
exports.ClientProgress = ClientProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClientProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ClientProgress.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], ClientProgress.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_entity_1.Business, { onDelete: 'CASCADE' }),
    __metadata("design:type", business_entity_1.Business)
], ClientProgress.prototype, "business", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", String)
], ClientProgress.prototype, "updatedAt", void 0);
exports.ClientProgress = ClientProgress = __decorate([
    (0, typeorm_1.Entity)()
], ClientProgress);
//# sourceMappingURL=client-progress.entity.js.map