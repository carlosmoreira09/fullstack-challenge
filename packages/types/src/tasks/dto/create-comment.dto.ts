import {IsOptional, IsString, IsUUID} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'UUID of the task this comment belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  taskId!: string;

  @ApiPropertyOptional({
    description: 'UUID of the comment author (optional, can be extracted from JWT)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  authorId?: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'This task needs to be completed by end of week'
  })
  @IsString()
  content!: string;
}
