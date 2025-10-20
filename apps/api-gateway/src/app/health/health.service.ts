import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError, firstValueFrom } from 'rxjs';
import * as amqp from 'amqplib';

export interface ServiceHealthResponse {
  service: string;
  status: boolean;
  message?: string;
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  async checkAllServices() {
    const [auth, tasks, notifications, users, postgres, rabbitmq] =
      await Promise.all([
        this.checkAuthService(),
        this.checkTasksService(),
        this.checkNotificationsService(),
        this.checkUsersService(),
        this.checkPostgres(),
        this.checkRabbitMQ(),
      ]);

    return {
      timestamp: new Date().toISOString(),
      services: {
        auth,
        tasks,
        notifications,
        users,
        postgres,
        rabbitmq,
      },
    };
  }

  async checkAuthService(): Promise<ServiceHealthResponse> {
    try {
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'health' }, {}).pipe(
          timeout(3000),
          catchError((error) => {
            this.logger.error(`Auth service health check failed: ${error.message}`);
            throw error;
          }),
        ),
      );

      return {
        service: 'auth-service',
        status: true,
        message: result?.message || 'Service is healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'auth-service',
        status: false,
        message: error.message || 'Service unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkTasksService(): Promise<ServiceHealthResponse> {
    try {
      const result = await firstValueFrom(
        this.tasksClient.send({ cmd: 'health' }, {}).pipe(
          timeout(3000),
          catchError((error) => {
            this.logger.error(`Tasks service health check failed: ${error.message}`);
            throw error;
          }),
        ),
      );

      return {
        service: 'tasks-service',
        status: true,
        message: result?.message || 'Service is healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'tasks-service',
        status: false,
        message: error.message || 'Service unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkNotificationsService(): Promise<ServiceHealthResponse> {
    try {
      const result = await firstValueFrom(
        this.notificationsClient.send({ cmd: 'health' }, {}).pipe(
          timeout(3000),
          catchError((error) => {
            this.logger.error(
              `Notifications service health check failed: ${error.message}`,
            );
            throw error;
          }),
        ),
      );

      return {
        service: 'notifications-service',
        status: true,
        message: result?.message || 'Service is healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'notifications-service',
        status: false,
        message: error.message || 'Service unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkUsersService(): Promise<ServiceHealthResponse> {
    try {
      const result = await firstValueFrom(
        this.usersClient.send({ cmd: 'health' }, {}).pipe(
          timeout(3000),
          catchError((error) => {
            this.logger.error(`Users service health check failed: ${error.message}`);
            throw error;
          }),
        ),
      );

      return {
        service: 'users-service',
        status: true,
        message: result?.message || 'Service is healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'users-service',
        status: false,
        message: error.message || 'Service unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkPostgres(): Promise<ServiceHealthResponse> {
    try {
      // Since we don't have direct Postgres connection in API Gateway,
      // we'll check if any service that uses Postgres is responding
      // This is a proxy check - if services are up, Postgres is likely up
      const authCheck = await this.checkAuthService();
      
      return {
        service: 'postgres',
        status: authCheck.status,
        message: authCheck.status 
          ? 'Database is accessible through services' 
          : 'Database may be unavailable',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        service: 'postgres',
        status: false,
        message: 'Unable to verify database status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkRabbitMQ(): Promise<ServiceHealthResponse> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
      
      // Try to connect to RabbitMQ
      const connection = await amqp.connect(rabbitmqUrl);
      await connection.close();

      return {
        service: 'rabbitmq',
        status: true,
        message: 'RabbitMQ is accessible',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`RabbitMQ health check failed: ${error.message}`);
      return {
        service: 'rabbitmq',
        status: false,
        message: error.message || 'RabbitMQ unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
