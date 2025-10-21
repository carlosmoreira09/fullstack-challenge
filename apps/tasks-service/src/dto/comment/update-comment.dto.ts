import {IsString} from "class-validator";
import {CreateCommentDto} from "./create-comment.dto";

export class UpdateCommentDto extends CreateCommentDto {
    @IsString()
    id: string;
}