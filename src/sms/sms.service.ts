import { SendSmsRequestDto } from '@/sms/dto/send-sms.request.dto';
import { configService } from '../users/repositories/users.repository.provider';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SolapiMessageService } from 'solapi';

@Injectable()
export class SmsService {
  private readonly messageService = new SolapiMessageService(
    configService.get('SOLAPI_API_KEY'),
    configService.get('SOLAPI_API_SECRET'),
  );

  async sendSms(phoneNumber: string, name: string): Promise<boolean> {
    const messageData = {
      to: phoneNumber,
      from: '01027905947',
      kakaoOptions: {
        pfId: configService.get('KAKAO_CHANNEL_ID'),
        disableSms: false,
        adFlag: false,
        templateId: 'KA01TP241115023322184OezWVyhaYsZ',
        variables: {
          '#{김파모}': name,
        },
      },
    };

    const sendResult = await this.messageService
      .sendOne(messageData)
      .then((res) => res)
      .catch((err) => {
        throw new BadRequestException();
      });

    return true;
  }

  async sendQna(
    name: string,
    email: string,
    phone: string,
    question: string,
  ): Promise<boolean> {
    const messageData = {
      // TODO: 배포할때 대표님 계정으로 변경
      to: '01053783514',
      from: '01027905947',
      text: `[파모] 문의가 들어왔습니다. 

이름: ${name}
이메일: ${email}
휴대폰 번호: ${phone}
질문: ${question}`,
      kakaoOptions: {
        pfId: configService.get('KAKAO_CHANNEL_ID'),
      },
    };

    const sendResult = await this.messageService
      .sendOne(messageData)
      .then((res) => res)
      .catch((err) => {
        throw new BadRequestException();
      });

    return true;
  }

  async sendVerificationCode(
    phoneNumber: string,
  ): Promise<{ verificationCode: number; createdAt: Date }> {
    // 100000 ~ 999999 사이의 6자리 난수 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date();
    console.log('생성 시간:', createdAt); // 시간 확인용 로그

    console.log('생성된 인증번호:', verificationCode); // 6자리 확인용 로그
    // const messageData = {
    //   to: phoneNumber,
    //   from: '01027905947',
    //   kakaoOptions: {
    //     pfId: configService.get('KAKAO_CHANNEL_ID'),
    //     disableSms: false,
    //     adFlag: false,
    //     templateId: 'KA01TP241126103201253jUEEdVpHdwo',
    //     variables: {
    //       '#{verificationCode}': verificationCode.toString(),
    //     },
    //   },
    // };

    // const sendResult = await this.messageService
    //   .sendOne(messageData)
    //   .then((res) => res)
    //   .catch((err) => {
    //     console.log('🚀 ~ SmsService ~ sendResult ~ err:', err);
    //     throw new BadRequestException();
    //   });

    return { verificationCode, createdAt };
  }
}
