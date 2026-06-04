import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    findAll(req: any, businessId?: string): Promise<import("./appointment.entity").Appointment[]>;
    findOne(id: number): Promise<import("./appointment.entity").Appointment>;
    create(createAppointmentDto: CreateAppointmentDto, req: any): Promise<import("./appointment.entity").Appointment>;
    update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<import("./appointment.entity").Appointment>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
