import { CustomersService, CustomerResponse } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(req: any): Promise<CustomerResponse[]>;
    findOne(id: number): Promise<CustomerResponse>;
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponse>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponse>;
    remove(id: number, req: any): Promise<void>;
}
