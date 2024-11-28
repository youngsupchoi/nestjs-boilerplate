import { User } from './user.entity';

describe('User class', () => {
  it('should make a user with no fields', () => {
    const user = new User();
    expect(user).toBeTruthy();
    expect(user.name).toBeUndefined();
    expect(user.email).toBeUndefined();
    expect(user.password).toBeUndefined();
  });

  it('should make a user with fields', () => {
    const user = new User();
    Object.assign(user, {
      name: 'name#1',
      email: 'test@example.com',
      password: 'password#1',
    });

    expect(user).toBeTruthy();
    expect(user.name).toBe('name#1');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('password#1');
  });

  it('should make a user with name only', () => {
    const user = new User();
    Object.assign(user, {
      name: 'name#1',
    });

    expect(user).toBeTruthy();
    expect(user.name).toBe('name#1');
    expect(user.email).toBeUndefined();
    expect(user.password).toBeUndefined();
  });

  it('should make a user with name and email', () => {
    const user = new User();
    Object.assign(user, {
      name: 'name#1',
      email: 'test@example.com',
    });

    expect(user).toBeTruthy();
    expect(user.name).toBe('name#1');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBeUndefined();
  });

  it('should make a user with name, email and username', () => {
    const user = new User();
    Object.assign(user, {
      name: 'name#1',
      email: 'test@example.com',
      username: 'username#1',
    });

    expect(user).toBeTruthy();
    expect(user.name).toBe('name#1');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBeUndefined();
  });
});
