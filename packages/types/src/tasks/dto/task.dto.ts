import { TaskPriority, TaskStatus } from '../task.enums.js';
import {IsArray, IsDate, IsString, IsUUID} from "class-validator";
import {User} from "../../users";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskDto {
    @ApiProperty({
        description: 'Task unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    id!: string;
    
    @ApiProperty({
        description: 'Task title',
        example: 'Implement user authentication'
    })
    @IsString()
    title!: string;
    
    @ApiPropertyOptional({
        description: 'Detailed task description',
        example: 'Implement JWT-based authentication with refresh tokens',
        nullable: true
    })
    @IsString()
    description?: string | null;
    
    @ApiProperty({
        description: 'Task priority level',
        enum: TaskPriority,
        example: TaskPriority.HIGH
    })
    @IsString()
    priority!: TaskPriority;
    
    @ApiProperty({
        description: 'Current task status',
        enum: TaskStatus,
        example: TaskStatus.IN_PROGRESS
    })
    @IsString()
    status!: TaskStatus;
    
    @ApiPropertyOptional({
        description: 'Task due date',
        example: '2024-12-31T23:59:59.000Z',
        type: Date,
        nullable: true
    })
    @IsDate()
    dueDate?: Date | null;
    
    @ApiProperty({
        description: 'UUID of the user who created this task',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    createdById!: string;
    
    @ApiProperty({
        description: 'Array of user IDs assigned to this task',
        type: [String],
        example: ['123e4567-e89b-12d3-a456-426614174000']
    })
    @IsArray()
    assignees!: string[];
    
    @ApiProperty({
        description: 'Task creation timestamp',
        example: '2024-01-15T10:30:00.000Z',
        type: Date
    })
    @IsDate()
    createdAt!: Date;
    
    @ApiProperty({
        description: 'Task last update timestamp',
        example: '2024-01-15T10:30:00.000Z',
        type: Date
    })
    @IsDate()
    updatedAt!: Date;
}

export interface Task {
    id?: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    assignees: string[];
    assigneesData?: User[];
    createdById?: string;
    createdByData?: User;
    createdAt?: string;
    updatedAt?: string;
}

export interface ListTasksParams {
    page?: number;
    size?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    createdById?: string;
}