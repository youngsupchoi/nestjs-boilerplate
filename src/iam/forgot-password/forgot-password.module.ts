import { Module } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptService } from '../../shared/hashing/bcrypt.service';
import { HashingService } from '../../shared/hashing/hashing.service';
import { MailerModule } from '../../shared/mailer/mailer.module';
import { UtilsModule } from '../../shared/utils/utils.module';
import { User } from '../../users/entities/user.entity';
import { provideUsersRepository } from '../../users/repositories/users.repository.provider';
import { UsersService } from '../../users/users.service';
import { UsersModule } from '@/users/users.module';
@Module({
  imports: [MailerModule, UtilsModule, UsersModule],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    ForgotPasswordService,
    UsersService,
    ...provideUsersRepository(),
  ],
  controllers: [ForgotPasswordController],
})
export class ForgotPasswordModule {}
