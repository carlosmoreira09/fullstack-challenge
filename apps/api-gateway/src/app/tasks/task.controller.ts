import {Body, Controller, Get, HttpException, HttpStatus, Inject, Logger, Param, Post, Put, Query} from "@nestjs/common";
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
                    Logger.error(`Failed to fetch user ${userId}:`, error);
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
    @Get('user/:userId')
    async findByUserId(
        @Param('userId') userId: string,
        @Query('includeAssigned') includeAssigned?: string
    ) {
        let messagePattern = 'list-tasks-created-by-user';
        
        if (includeAssigned === 'true') {
            messagePattern = 'list-tasks-created-and-assigned';
        }

        const tasks: TaskDto[] = await firstValueFrom(this.taskClient.send(messagePattern, userId));

        if(!tasks || tasks.length === 0){
            return [];
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
                    Logger.error(`Failed to fetch list tasks by user ${userId}:`, error);
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

    @Get(':taskId')
    async findOne(@Param('taskId') taskId: string) {
        const task: TaskDto = await firstValueFrom(this.taskClient.send('get-task', taskId));

        if(!task){
            throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
        }

        const uniqueAssigneeIds = [...new Set(task.assignees)];
        const allUserIds = [...new Set([...uniqueAssigneeIds, task.createdById])];
        const usersMap = new Map<string, UserDto>();
        
        await Promise.all(
            allUserIds.map(async (userId) => {
                try {
                    const user = await firstValueFrom(this.userClient.send("user-profile", userId));
                    usersMap.set(userId, user);
                } catch (error) {
                    Logger.error(`Failed to fetch user ${userId}:`, error);
                }
            })
        );

        return {
            ...task,
            createdByData: usersMap.get(task.createdById),
            assigneesData: task.assignees
                .map(assigneeId => usersMap.get(assigneeId))
                .filter(user => user !== undefined)
        };
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
