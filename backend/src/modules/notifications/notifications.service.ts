import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notificationRepo: Repository<Notification>) {}

  getUserNotifications(userId: string) {
    return this.notificationRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markAsRead(id: string) {
    await this.notificationRepo.update(id, { isRead: true });
    return { message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId }, { isRead: true });
    return { message: 'All marked as read' };
  }

  create(data: { userId: string; title: string; message: string; type?: string }) {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }
}
