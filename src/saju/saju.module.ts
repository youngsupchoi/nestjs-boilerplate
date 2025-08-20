import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SajuService } from './saju.service';
import { SajuController } from './saju.controller';
import { CalendarData } from './entities/calendar-data.entity';
import { CalendarDataRepository } from './repositories/calendar-data.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarData]),
  ],
  controllers: [SajuController],
  providers: [
    SajuService,
    CalendarDataRepository,
  ],
  exports: [SajuService],
})
export class SajuModule {}
