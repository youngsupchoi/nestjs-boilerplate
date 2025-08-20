import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultingController } from './consulting.controller';
import { ConsultingService } from './consulting.service';
import { Consultant } from './entities/consultant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consultant])],
  controllers: [ConsultingController],
  providers: [ConsultingService],
})
export class ConsultingModule {}


