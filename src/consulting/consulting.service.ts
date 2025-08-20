import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultant, ConsultantType } from './entities/consultant.entity';

@Injectable()
export class ConsultingService {
  constructor(@InjectRepository(Consultant) private readonly repo: Repository<Consultant>) {}

  async listByType(type: ConsultantType) {
    return this.repo.find({ where: { type }, order: { id: 'ASC' } });
  }
}


