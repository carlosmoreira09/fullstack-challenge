import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  taskId!: string;

  @IsString()
  authorId!: string;

  @IsString()
  content!: string;
}
