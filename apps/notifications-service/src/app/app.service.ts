import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {NotificationsEntity} from "../entities/notifications.entity";
import {Repository} from "typeorm";
import {UpdateNotificationsDto} from "../dto/update-notifications.dto";
import {CreateNotificationsDto} from "../dto/create-notifications.dto";

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(NotificationsEntity)
        private readonly notifcationsRepository: Repository<NotificationsEntity>
    ) {}

    async findAll() {
        return await this.notifcationsRepository.find()
    }

    async findOne(notificationId: number) {
        return await this.notifcationsRepository.findOne({
            where: {
                id: notificationId
            }
        })
    }

    async create(notificationData: CreateNotificationsDto) {
    }

    async update(notificationId: number, notificationData: UpdateNotificationsDto) {
    }

    async delete(notificationId: number) {
        return await this.notifcationsRepository.delete(notificationId)
    }

}
