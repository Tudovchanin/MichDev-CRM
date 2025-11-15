
import argon2 from 'argon2';

import { createActivateEmailToken, verifyActivateEmailToken } from '../utils/jwt';

import type { CreateUserData,AuthenticateUserData, UserRepository } from "~/types/backend/userRepo";


import type { IEmailService } from "./EmailService";
const ACTIVATION_LINK = useRuntimeConfig().activationLink;

class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService?: IEmailService
  ) {}

  async registerUser(data: CreateUserData) {

    const { name, email, password } = data;
    
    const userExist = await this.userRepository.findByEmail(email);
    if (userExist) {
         throw createError({ statusCode: 409, message: "Пользователь с таким email уже существует" });
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

    if(this.emailService) {
     
    try {
      const tokenActivateEmail = createActivateEmailToken({userId});
      const activationLink = `${ACTIVATION_LINK}?token=${tokenActivateEmail}`;
      await this.emailService.sendActivateEmail(emailUser, activationLink);
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
    }
    }

    return newUser;
  }

  async loginUser(data:AuthenticateUserData) {
    const { email, password } = data;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User with such email does not exist");
    }
    const passwordIsValid = await argon2.verify(user.password!, password);
    if (!passwordIsValid) {
      throw new Error("Password incorrect");
    }
    return user;
  }

  async userIsActive(id: string) {
    return this.userRepository.findActiveById(id);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    return user;
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return users;
  }

  async blockUser(id: string) {
    const blockUser = await this.userRepository.update(id, { isActive: false });

    return blockUser;
  }

  async unblockUser(id: string) {
    const unblockedUser = await this.userRepository.update(id, {
      isActive: true,
    });
    return unblockedUser;
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.deleteUserById(id);
    return user;
  }

  async activateEmail(token: string){
    console.log(token, 'TOKENeMAIL');
    
    const payload = verifyActivateEmailToken(token);
    console.log(payload, 'PAYLOAD');
    
    if (!payload || typeof payload === 'string' ) throw new Error("Invalid or expired token");
    const user = await this.userRepository.findById(payload.userId);
    if (!user) throw new Error("User not found");

    if (user.isEmailConfirmed) {
      throw new Error("User already activated");
    }

    const result = await this.userRepository.update(user.id, { isEmailConfirmed: true});

    return result;
  }
}

export default UserService;