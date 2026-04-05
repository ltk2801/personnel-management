import { Module } from '@nestjs/common';
import { EmployeesModule } from './modules/employees/employees.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

const usernameRedis = process.env.USERNAME_REDIS;
const passwordRedis = process.env.PASSWORD_REDIS;

@Module({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // set up radis
    CacheModule.registerAsync({
      isGlobal: true, // cho phep dung o moi noi o ung dung, khong can import lai
      useFactory: async () => ({
        store: await redisStore({
          // URL tu cloud database
          url: `redis://${usernameRedis}:${passwordRedis}@redis-14347.c239.us-east-1-2.ec2.cloud.redislabs.com:14347`,
          ttl: 600,
        }),
      }),
    }),
    DatabaseModule,
    EmployeesModule,
    DepartmentsModule,
    JobsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
})
export class AppModule {}
