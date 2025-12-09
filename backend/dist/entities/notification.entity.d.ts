import { User } from './user.entity';
export declare class Notification {
    id: string;
    user: User;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    type: string;
    createdAt: Date;
}
