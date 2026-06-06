import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    verifyWebhook(mode: string, token: string, challenge: string, res: any): any;
    receiveMessage(body: any): Promise<{
        status: string;
    }>;
    simulate(body: {
        phoneNumber: string;
        message: string;
    }): Promise<{
        reply: string;
    }>;
    getSessions(): any[];
}
