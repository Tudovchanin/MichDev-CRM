
import type { NotificationBase, CreateNotification } from "../shared";


export type NotificationRepository = {
  findByUserId(userId:string, skip:number, take:number): Promise<NotificationBase[]>;
  markAllAsRead(userId: string): Promise<number>;
  create(data:CreateNotification):Promise<NotificationBase>;
};


