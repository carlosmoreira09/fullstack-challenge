import  { IsUUID} from 'class-validator';
import { CreateCommentDto } from './create-comment.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto extends CreateCommentDto {
  @ApiProperty({
    description: 'UUID of the comment to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id!: string;
}
