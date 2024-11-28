import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserUpdateDto extends IntersectionType(
  PartialType(PickType(User, ['email', 'phone', 'name'] as const)),
) {}
