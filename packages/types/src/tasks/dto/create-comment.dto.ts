import {IsOptional, IsString, IsUUID} from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  taskId!: string;

  @IsUUID()
  @IsOptional()
  authorId?: string;

  @IsString()
  content!: string;
}
