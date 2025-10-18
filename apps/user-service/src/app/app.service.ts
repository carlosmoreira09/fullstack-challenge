import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {UsersEntity} from "../entities/user.entity";
import {CreateUserDto} from "../dto/create-user.dto";
import {UpdateUserDto} from "../dto/update-user.dto";

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepository: Repository<UsersEntity>) {}

    async findOne(userId: number) {
        return await this.userRepository.findOne({
            where: {
                id: userId
            }
        })
    }

    async findAll() {
        return await this.userRepository.find()
    }

    async create(createUserData: CreateUserDto) {
        const newUser = this.userRepository.create({
            ...createUserData,
            created_by: {
                id: createUserData.createdById
            }
        })
        return await this.userRepository.save(newUser)
    }

    async update(userId: number, updateUserData: UpdateUserDto ) {
        const user = await this.findOne(userId)
        if (!user) {
            throw new Error('User not found')
        }
        const updateUser = this.userRepository.create({
            ...updateUserData,
            created_by: {
                id: user.createdById
            }
        })
        return await this.userRepository.update(userId, updateUser)
    }

    async softDelete(userId: number) {
        return await this.userRepository.softDelete(userId)
    }

    async restore(userId: number) {
        return await this.userRepository.restore(userId)
    }

    async findByCreator(userId: number) {
        return await this.userRepository.find({
            where: {
                created_by: {
                    id: userId
                }
            }
        })
    }
}
