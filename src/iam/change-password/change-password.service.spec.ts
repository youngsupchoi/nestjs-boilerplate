import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordService } from './change-password.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { MailerService } from '../../shared/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';

const changePasswordUser = {
  phone: '01012345678',
  password: '1234567',
};

describe('ChangePasswordService', () => {
  let service: ChangePasswordService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordService,
        {
          provide: UsersService,
          useValue: {
            updateByPassword: jest.fn().mockResolvedValue(changePasswordUser),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('some string'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            updateByPassword: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChangePasswordService>(ChangePasswordService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('change password user', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should change password a user', () => {
      expect(
        service.changePassword({
          phone: '01012345678',
          password: '1234567',
        }),
      ).resolves.toEqual(changePasswordUser);
    });
  });
});
