import { Server } from 'socket.io';
export declare class NotificationsGateway {
    server: Server;
    sendNotification(message: string): void;
}
