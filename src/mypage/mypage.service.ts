import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class MypageService {
  constructor(private readonly usersService: UsersService) {}

  async getMyPage(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      name: user.name,
      calendarType: user.calendarType,
      birthday: user.birthday,
      birthTime: user.birthTime,
      sajuEightLetters: user.sajuEightLetters,
      luckDaewoon: user.luckDaewoon,
      luckSewoon: user.luckSewoon,
    };
  }
}


