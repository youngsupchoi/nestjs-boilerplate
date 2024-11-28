import { User } from '../entities/user.entity';

export interface AccountsUsers extends User {
  readonly id: number;
  readonly email: string;
  readonly password: string;
  readonly createdAt: Date;
}

// 선택적으로 생성 시 사용할 타입도 추가할 수 있습니다
export type CreateAccountsUsers = Omit<AccountsUsers, 'id' | 'createdAt'>;
