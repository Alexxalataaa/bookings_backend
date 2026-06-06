import { Repository } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { Service } from '../services/service.entity';
import { AppointmentsService } from '../appointments/appointments.service';
export type ConvStep = 'IDLE' | 'ASK_BUSINESS' | 'ASK_SERVICE' | 'ASK_DATE' | 'ASK_TIME' | 'ASK_NAME' | 'CONFIRM' | 'BOOKED';
interface ConversationState {
    step: ConvStep;
    business?: Business;
    service?: Service;
    date?: string;
    time?: string;
    userName?: string;
    phoneNumber: string;
    lastActivity: number;
}
export declare class WhatsappService {
    private readonly businessRepo;
    private readonly serviceRepo;
    private readonly appointmentsService;
    private conversations;
    constructor(businessRepo: Repository<Business>, serviceRepo: Repository<Service>, appointmentsService: AppointmentsService);
    processMessage(phoneNumber: string, text: string): Promise<string>;
    verifyWebhook(mode: string, token: string, challenge: string): string | null;
    getActiveSessions(): ConversationState[];
    private handleStep;
    private handleIdle;
    private handleAskBusiness;
    private askService;
    private handleAskService;
    private handleAskName;
    private handleAskDate;
    private handleAskTime;
    private handleConfirm;
    private greet;
    private resetState;
    private parseDate;
    private formatDate;
    private cleanupStale;
}
export {};
