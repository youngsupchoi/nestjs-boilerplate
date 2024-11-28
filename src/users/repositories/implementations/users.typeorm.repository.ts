import { User } from '../../../users/entities/user.entity';
import { UsersRepository } from '../users.repository.interface';
import { Repository, UpdateResult } from 'typeorm';
import { UserProfileDto } from '../../../users/dto/user-profile.dto';
import { UserUpdateDto } from '../../../users/dto/user-update.dto';
import { UserDto } from '../../../users/dto/user.dto';
import { HashingService } from '../../../shared/hashing/hashing.service';
import { AccountsUsers } from '../../../users/interfaces/accounts-users.interface';

export class UsersTypeOrmRepository implements UsersRepository {
  constructor(
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  public async findAll() {
    return await this.usersRepository.find();
  }

  public async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({
      email: email,
    });
  }

  public async findByPhone(phone: string): Promise<User> {
    return await this.usersRepository.findOneBy({
      phone: phone,
    });
  }

  public async findBySub(sub: number): Promise<User> {
    return await this.usersRepository.findOneByOrFail({
      id: sub,
    });
  }

  public async findById(userId: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({
      id: +userId,
    });
  }

  public async create(userDto: UserDto): Promise<AccountsUsers> {
    return await this.usersRepository.save(userDto);
  }

  public async updateByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email: email });
    user.password = await this.hashingService.hash(
      Math.random().toString(36).slice(-8),
    );

    return await this.usersRepository.save(user);
  }

  public async updateByPassword(
    phone: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({ phone: phone });
    user.password = await this.hashingService.hash(password);

    return await this.usersRepository.save(user);
  }

  public async updateUserProfile(
    id: string,
    userProfileDto: UserProfileDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: +id });
    user.name = userProfileDto.name;
    user.email = userProfileDto.email;

    return await this.usersRepository.save(user);
  }

  public async updateUser(
    id: string,
    userUpdateDto: { phone: string; email: string },
  ): Promise<UpdateResult> {
    return await this.usersRepository.update(
      {
        id: +id,
      },
      { ...userUpdateDto },
    );
  }

  public async deleteUser(
    userId: number,
    withdrawalReason: string,
    withdrawalReasonType: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      name: null,
      email: null,
      phone: null,
      birthday: null,
      withdrawalDate: new Date(),
      withdrawalReason: withdrawalReason,
      withdrawalReasonType: withdrawalReasonType,
      isWithdrawal: true,
    });
  }

  public async updatePreQuestionProcessed(userId: number) {
    return await this.usersRepository.update(userId, {
      preQuestionProcessed: true,
    });
  }

  public async updatePostQuestionProcessed(userId: number) {
    return await this.usersRepository.update(userId, {
      postQuestionProcessed: true,
    });
  }
}
