import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
export declare class NotificationsService {
    private notificationRepo;
    constructor(notificationRepo: Repository<Notification>);
    getUserNotifications(userId: string): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<{
        message: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    create(data: {
        userId: string;
        title: string;
        message: string;
        type?: string;
    }): Promise<Notification>;
}
