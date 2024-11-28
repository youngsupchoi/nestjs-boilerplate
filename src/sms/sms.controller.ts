import { SendSmsRequestDto } from '@/sms/dto/send-sms.request.dto';
import { SmsService } from '@/sms/sms.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('/sms')
  async sendSms(@Body() smsInfo: SendSmsRequestDto): Promise<boolean> {
    return await this.smsService.sendSms(smsInfo.phone, smsInfo.name);
  }
}
