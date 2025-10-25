import {
    Module
} from '@nestjs/common';
import {CommentsController} from "./comments.controller";



@Module({
    imports: [],
    controllers: [CommentsController],
    providers: [],
    exports: []
})
export class CommentsModule {}
