import {Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Put} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";
import {TaskDto, UserDto} from "@taskmanagerjungle/types";

@Controller('tasks')
export class TaskController {
    constructor(
        @Inject("TASKS_SERVICE")
        private readonly taskClient: ClientProxy,
        @Inject("USERS_SERVICE")
        private readonly userClient: ClientProxy,
    ) {}

    @Get()
    async findAll() {
        const tasks: TaskDto[] = await firstValueFrom(this.taskClient.send('list-tasks', {}));
        
        if(tasks.length === 0){
            throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
        }
        
        const uniqueAssigneeIds = [...new Set(tasks.flatMap(task => task.assignees))];
        const uniqueCreatorIds = [...new Set(tasks.map(task => task.createdById))];
        const allUserIds = [...new Set([...uniqueAssigneeIds, ...uniqueCreatorIds])];
        
        const usersMap = new Map<string, UserDto>();
        await Promise.all(
            allUserIds.map(async (userId) => {
                try {
                    const user = await firstValueFrom(this.userClient.send("user-profile", userId));
                    usersMap.set(userId, user);
                } catch (error) {
                    console.error(`Failed to fetch user ${userId}:`, error);
                }
            })
        );

        return tasks.map(task => ({
            ...task,
            createdByData: usersMap.get(task.createdById),
            assigneesData: task.assignees
                .map(assigneeId => usersMap.get(assigneeId))
                .filter(user => user !== undefined)
        }));
    }

    @Post()
    async createTask(@Body() task: any) {
        return await firstValueFrom(this.taskClient.send('create-task', task));
    }

    @Put()
    async updateTask(@Body() task: any) {
        return await firstValueFrom(this.taskClient.send('update-task', task));
    }
}
