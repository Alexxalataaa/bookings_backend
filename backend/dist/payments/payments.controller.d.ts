import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(req: any, range?: string, businessId?: string): Promise<import("./payment.entity").Payment[]>;
    findOne(id: number): Promise<import("./payment.entity").Payment>;
    create(createPaymentDto: CreatePaymentDto): Promise<import("./payment.entity").Payment>;
    update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<import("./payment.entity").Payment>;
    remove(id: number): Promise<void>;
}
