import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {LoginDTO} from "./auth/dto/login.dto";

describe('AppController', () => {
  let appController: AppController;
  const payload: LoginDTO = {
      username: 'teste',
      password: '123456'
  }
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return true"', () => {
      expect(appController.login(payload)).toBe('Hello World!');
    });
  });
});
