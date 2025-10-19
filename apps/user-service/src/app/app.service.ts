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
        console.log('teste')
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
            createdById: createUserData.createdById

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
            createdById: user.createdById
        })
        return await this.userRepository.update(userId, updateUser)
    }

    async delete(userId: number) {
        return await this.userRepository.delete(userId)
    }


    async findByCreator(userId: string) {
        return await this.userRepository.find({
            where: {
                createdById: userId
            }
        })
    }
}
