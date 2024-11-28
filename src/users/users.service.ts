import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { AccountsUsers } from './interfaces/accounts-users.interface';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { USERS_REPOSITORY_TOKEN } from './repositories/users.repository.interface';
import { UsersTypeOrmRepository } from './repositories/implementations/users.typeorm.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly usersRepository: UsersTypeOrmRepository,

    @InjectRepository(User)
    private readonly userRealRepository: Repository<User>,
  ) {}

  public async getWithdrawnUsers(): Promise<any[]> {
    return await this.userRealRepository
      .createQueryBuilder('user')
      .leftJoin('payment', 'payment', '"user".id = payment.user_id')
      .select([
        '"user".*',
        'CASE WHEN COUNT(payment.id) > 0 THEN true ELSE false END as "hasPaymentHistory"',
      ])
      .where('"user".is_withdrawal = :isWithdrawal', { isWithdrawal: true })
      .groupBy('"user".id')
      .getRawMany();
  }

  public async findAll(): Promise<any[]> {
    return await this.userRealRepository
      .createQueryBuilder('user')
      .leftJoin(
        'family_member',
        'familyMember',
        'user.id = familyMember.userId',
      )
      .leftJoin(
        (subQuery) => {
          return subQuery
            .select('p.*')
            .addSelect(
              'ROW_NUMBER() OVER (PARTITION BY p."user_id" ORDER BY p."created_at" DESC)',
              'rn',
            )
            .from('payment', 'p');
        },
        'latest_payment',
        'latest_payment."user_id" = user.id AND latest_payment.rn = 1',
      )
      .addSelect([
        'familyMember.name',
        'familyMember.relationship',
        'latest_payment."expiry_date"',
      ])
      .where('familyMember.isPrimary = :isPrimary', { isPrimary: true })
      .getRawMany();
  }

  public async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  public async findBySub(sub: number): Promise<User> {
    const user = await this.usersRepository.findBySub(sub);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  public async findById(userId: string): Promise<User> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  public async findUserIdByPhone(phone: string): Promise<number> {
    const user = await this.usersRepository.findByPhone(phone);

    if (!user) {
      throw new NotFoundException(`User #${phone} not found`);
    }

    return user.id;
  }

  public async create(userDto: UserDto): Promise<AccountsUsers> {
    try {
      return await this.usersRepository.create(userDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.updateByEmail(email);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateByPassword(
    phone: string,
    password: string,
  ): Promise<User> {
    try {
      return await this.usersRepository.updateByPassword(phone, password);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateUserProfile(
    id: string,
    userProfileDto: UserProfileDto,
  ): Promise<User> {
    try {
      return await this.usersRepository.updateUserProfile(id, userProfileDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateUser(
    id: string,
    phone: string,
    email: string,
  ): Promise<UpdateResult> {
    try {
      return await this.usersRepository.updateUser(id, { phone, email });
    } catch (err) {
      throw new BadRequestException('User not updated');
    }
  }

  async completePreQuestion(userId: number) {
    return await this.usersRepository.updatePreQuestionProcessed(userId);
  }

  async completePostQuestion(userId: number) {
    return await this.usersRepository.updatePostQuestionProcessed(userId);
  }

  async withdrawUser(
    userId: number,
    withdrawalReason: string,
    withdrawalReasonType: string,
  ) {
    return await this.usersRepository.deleteUser(
      userId,
      withdrawalReason,
      withdrawalReasonType,
    );
  }
}
