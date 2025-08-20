import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { IamModule } from './iam/iam.module';
import { validateSchemaEnv } from './helpers/validation-schema-env';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SmsModule } from './sms/sms.module';
import { ChatModule } from './chat/chat.module';
import { OrdersModule } from './orders/orders.module';
import { ConsultingModule } from './consulting/consulting.module';
import { MypageModule } from './mypage/mypage.module';
import { SajuModule } from './saju/saju.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.dev', '.env.stage', '.env.prod'],
      validate: validateSchemaEnv,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL'),
          limit: config.get<number>('THROTTLE_LIMIT'),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('TYPEORM_HOST'),
        port: config.get<number>('TYPEORM_PORT'),
        username: config.get<string>('TYPEORM_USERNAME'),
        password: config.get<string>('TYPEORM_PASSWORD'),
        database: config.get<string>('TYPEORM_DATABASE'),
        synchronize: false, // 만세력 데이터는 기존 구조 유지
        entities: [__dirname + '/**/*.{model,entity}.{ts,js}'],
        namingStrategy: new SnakeNamingStrategy(),
        migrations: ['dist/migrations/**/*.js'],
        subscribers: ['dist/subscriber/**/*.js'],
        cli: {
          migrationsDir: config.get<string>('TYPEORM_MIGRATIONS_DIR'),
          subscribersDir: config.get<string>('TYPEORM_SUBSCRIBERS_DIR'),
        },
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    IamModule,
    UsersModule,
    SmsModule,
    ChatModule,
    OrdersModule,
    ConsultingModule,
    MypageModule,
    SajuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
