import {IsString, IsUUID} from 'class-validator';
import { CreateCommentDto } from './create-comment.dto.js';

export class UpdateCommentDto extends CreateCommentDto {
  @IsUUID()
  id!: string;
}
