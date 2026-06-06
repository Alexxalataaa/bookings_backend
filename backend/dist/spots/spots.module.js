"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const spots_service_1 = require("./spots.service");
const spots_controller_1 = require("./spots.controller");
const spot_entity_1 = require("./spot.entity");
const appointment_entity_1 = require("../appointments/appointment.entity");
const business_entity_1 = require("../businesses/business.entity");
let SpotsModule = class SpotsModule {
};
exports.SpotsModule = SpotsModule;
exports.SpotsModule = SpotsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([spot_entity_1.Spot, appointment_entity_1.Appointment, business_entity_1.Business])],
        controllers: [spots_controller_1.SpotsController],
        providers: [spots_service_1.SpotsService],
        exports: [spots_service_1.SpotsService],
    })
], SpotsModule);
//# sourceMappingURL=spots.module.js.map