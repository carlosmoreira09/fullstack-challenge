import {Controller, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {CommentEntity} from "../../entities/comment.entity";
import {Repository} from "typeorm";
import {CreateCommentDto, UpdateCommentDto} from "@taskmanagerjungle/types";

@Controller('comments')
export class CommentController {
    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>
    ) {}

    async findAll() {
        return await this.commentRepository.find()
    }

    async findByTask(taskId: string) {
        return await this.commentRepository.find({
            where: { taskId: taskId }
        })
    }

    async findOne(id: string) {
        return await this.commentRepository.findOne({
            where: { id: id }
        })
    }

    async findByAuthorId(authorId: string) {
        return await this.commentRepository.findOne({ where: { authorId: authorId } })
    }

    async createComment(createComment: CreateCommentDto) {
        const addComment = this.commentRepository.create(createComment)
        return await this.commentRepository.save(addComment)
    }

    async updateComment(id: string, updateComment: UpdateCommentDto) {
        const comment = await this.findOne(id)
        if(!comment) {
            throw new NotFoundException('Comment not found')
        }
        const update = this.commentRepository.create({...comment,...updateComment})
        return await this.commentRepository.save(update)
    }

    async deleteComment(id: string) {
        const comment = await this.findOne(id)
        if(!comment) {
            throw new NotFoundException('Comment not found')
        }
        return await this.commentRepository.delete(id)
    }

}