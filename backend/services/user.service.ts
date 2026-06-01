import 'dotenv/config';
import { PrismaClient, UserRole } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from 'argon2';


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

interface CreateUserData {
  name: string,
  email: string,
  password: string,
  location: string,
  role: UserRole
}

interface ChangePassword {
  userId: string,
  oldPassword: string, 
  newPassword: string
}

export class UserService {
  async createNewUser(data: CreateUserData) {
    const hashedPassword = await argon2.hash(data.password);

    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        location: data.location,
        role: data.role
      }
    })
  }

  async login(email: string, password: string) {
    const userFound = await prisma.user.findUnique({
      where: { email: email }
    });
    if (!userFound) throw new Error('Invalid email or password');

    const isPasswordCorrect = argon2.verify(userFound.password, password);
    if (!isPasswordCorrect) throw new Error('Invalid email or password.');
    
    const { password: _, ...userWithoutPassword } = userFound;
    return userWithoutPassword;
  }

  async changePassword(data: ChangePassword) {
    const userFound = await prisma.user.findUnique({where: { id: data.userId}});
    if (!userFound) throw new Error('User not found.');
    
    const isPasswordCorrect = await argon2.verify(userFound.password, data.oldPassword);
    if (!isPasswordCorrect) throw new Error('Old password is not correct.');

    const hashedPassword = await argon2.hash(data.newPassword);

    return await prisma.user.update({
      where: {id: data.userId},
      data: {
        password: hashedPassword
      }
    })
  } 

  async deActivate(userId: string) {
    const  userFound = await prisma.user.findUnique({where: { id: userId}});
    if (!userFound) throw new Error('User not found.');

    return await prisma.user.update({
      where: {id: userId},
      data: {
        isAvailable: false
      }
    });
  }

  async getUsers() {
    return await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, location: true, isAvailable: true, createdAt: true }
    })
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, location: true, isAvailable: true, createdAt: true }
    })
    if (!user) throw new Error('User not found.')
    return user
  }

  async updateUser(id: string, data: Partial<{ name: string; email: string; role: UserRole; location: string }>) {
    const userFound = await prisma.user.findUnique({ where: { id } })
    if (!userFound) throw new Error('User not found.')

    return await prisma.user.update({
      where: { id },
      data
    })
  }

  async deleteUser(id: string) {
    const userFound = await prisma.user.findUnique({ where: { id } })
    if (!userFound) throw new Error('User not found.')

    return await prisma.user.delete({ where: { id } })
  }

  async toggleAvailability(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    return await prisma.user.update({
      where: { id: userId },
      data: { isAvailable: !user.isAvailable }
    });
  }

  async activate(userId: string) {
    const userFound = await prisma.user.findUnique({where: { id: userId}});
    if (!userFound) throw new Error('User  not found');

    return await prisma.user.update({
      where: {id: userId},
      data: {
        isAvailable: true
      }
    });
  }

}