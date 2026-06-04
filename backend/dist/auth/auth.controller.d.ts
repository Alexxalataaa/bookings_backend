import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<{
        token: string;
        user: {
            id: number;
            username: string;
            fullName: string;
            email: string;
            role: string;
        };
    }>;
    verifyRegister(body: Verify2faDto): Promise<{
        message: string;
    }>;
    register(body: RegisterDto): Promise<{
        require2fa: boolean;
        tempToken: string;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        id: number;
        username: string;
        fullName: string;
        email: string;
        role: string;
    }>;
    updateProfile(req: any, body: UpdateProfileDto): Promise<{
        id: number;
        username: string;
        fullName: string;
        email: string;
        role: string;
    }>;
}
