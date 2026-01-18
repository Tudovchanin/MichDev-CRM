
import argon2 from 'argon2';
import { createActivateEmailToken, verifyActivateEmailToken } from '../utils/jwt';
import type { CreateUserData, AuthenticateUserData, UserRepository, UserWithPassword, UpdateUserData } from "~/types/backend/userRepo";
import type { UserBase, UserResponseCounts, UserBaseMinimal } from '~/types/shared';
import type { IEmailService } from "./EmailService";
import { Role } from '~/types/shared';



class UserService {

  constructor(
    private userRepository: UserRepository,
    private emailService?: IEmailService
  ) { }

  async registerUser(data: CreateUserData) {

    const { name, email, password } = data;

    const userExist = await this.userRepository.findByEmailWithPassword(email);

    if (userExist) {
      // Если пользователь есть и не подтвердил email более 48 часов, можно его удалить и сделать новую запись
      const emailPending = !userExist.isEmailConfirmed && userExist.createdAt.getTime() + 48 * 60 * 60 * 1000 < Date.now();
      if (!emailPending) {
        throw createError({ statusCode: 409, message: "Пользователь с таким email уже существует" });
      } else {
        await this.userRepository.deleteById(userExist.id);
      }
    }

    const hashedPassword = await argon2.hash(password);
    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = await this.userRepository.create(userData);
    const emailUser = newUser.email;
    const userId = newUser.id;

    if (this.emailService) {
      const ACTIVATION_LINK = useRuntimeConfig().activationLink;

      try {
        const tokenActivateEmail = createActivateEmailToken({ userId });
        const activationLink = `${ACTIVATION_LINK}?token=${tokenActivateEmail}`;
        await this.emailService.sendActivateEmail(emailUser, activationLink);
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
        throw createError({
          statusCode: 500,
          message: "Не удалось отправить письмо для активации аккаунта. Попробуйте позже."
        });
      }
    }

    return newUser;
  }

  async loginUser(data: AuthenticateUserData) {
    const { email, password } = data;
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw createError({
        statusCode: 404,
        message: "Пользователь с таким email не найден"
      });
    }
    const passwordIsValid = await argon2.verify(user.password!, password);
    if (!passwordIsValid) {
      throw createError({
        statusCode: 401,
        message: "Неверный пароль"
      });
    }
    return user;
  }
  
  async findByIdWithCounts(id: string): Promise<UserResponseCounts> {
    const user = await this.userRepository.findByIdWithCounts(id);
    if (!user) {
      throw createError({ statusCode: 404, message: 'Пользователь не найден' });
    }
    return user;
  }

  async findByIdBasic(id: string): Promise<UserBase> {
    const user = await this.userRepository.findByIdBasic(id);
    if (!user) {
      throw createError({ statusCode: 404, message: 'Пользователь не найден' });
    }
    return user;
  }

  async findUsers(roles?: string[]): Promise<UserResponseCounts[]> {
    const users = await this.userRepository.findUsers(roles);
    return users;
  }

  async updateProfile(id:string, data:UpdateUserData):Promise<UserBase>{
    const updateUser = await this.userRepository.update(id, data);
    return updateUser;
  }

  async blockUser(id: string): Promise<UserBase> {
    const blockUser = await this.userRepository.update(id, { isBlocked: true });

    return blockUser;
  }

  async unblockUser(id: string): Promise<UserBase> {
    const unblockedUser = await this.userRepository.update(id, {
      isBlocked: false,
    });
    return unblockedUser;
  }

  async deleteUser(id: string): Promise<UserBaseMinimal> {
    const user = await this.userRepository.deleteById(id);
    return user;
  }

  async activateEmail(token: string): Promise<UserBase> {

    const payload = verifyActivateEmailToken(token);

    if (!payload || typeof payload === 'string') throw new Error("Invalid or expired token");
    const user: UserBase | null = await this.userRepository.findByIdBasic(payload.sub);
    if (!user) {
      throw createError({
        statusCode: 404,
        message: "Пользователь не найден"
      });
    };

    if (user.isEmailConfirmed) {
      throw createError({
        statusCode: 409,
        message: "Пользователь уже активирован"
      });
    }

    const result: UserBase = await this.userRepository.update(user.id, { isEmailConfirmed: true });

    return result;
  }

  async changeRole(id: string, role: Role): Promise<UserBase> {
    return this.userRepository.update(id, { role });
  }

  async findUserByEmail(email: string, role?: Role): Promise<UserBase> {
    const user = await this.userRepository.findByEmailWithPassword(email);
  
    if (!user) {
      throw createError({ statusCode: 404, message: "Пользователь с таким email не найден" });
    }
  
    if (role && user.role !== role) {
      throw createError({ statusCode: 404, message: `Пользователь с ролью ${role} не найден` });
    }
  
    // Возвращаем без пароля
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findUsersByCondition(query: {
    email?: string;
    name?: string;
    isBlocked?: boolean;
    role: Role | Role[];
  }): Promise<UserBase[]> {
    const where: any = {};

    if (Array.isArray(query.role)) {
      where.role = { in: query.role }; // Prisma синтаксис для массива
    } else {
      where.role = query.role; // Одна роль
    }
  
    if (query.email) where.email = query.email;
    if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
    if (query.isBlocked !== undefined) where.isBlocked = query.isBlocked;
  
    const users = await this.userRepository.findUsersByCondition(where);
    return users;
  }

  async updatePassword(id:string, oldPassword:string ,newPassword:string ){


    const passwordUser = await this.userRepository.getPasswordUserById(id);
    if(!passwordUser) throw createError({
      statusCode: 404,
      message: "Ошибка запроса"
    });

    const passwordIsValid = await argon2.verify(passwordUser.password, oldPassword);
    if (!passwordIsValid) {
      throw createError({
        statusCode: 401,
        message: "Неверный пароль"
      });
    }

    const isSamePassword = await argon2.verify(passwordUser.password, newPassword);
  if (isSamePassword) {
    throw createError({
      statusCode: 400,
      message: "Новый пароль не должен совпадать со старым"
    });
  }

    const hashedNewPassword = await argon2.hash(newPassword);

    await this.userRepository.update(id, { password:hashedNewPassword });
  }

  mapUserBase(user: UserWithPassword | UserResponseCounts): UserBase {
    const { id, email, name, avatar, role, isEmailConfirmed, isBlocked, createdAt, updatedAt } = user;
    return { id, email, name, avatar, role, isEmailConfirmed, isBlocked, createdAt, updatedAt };
  }

}


export default UserService;