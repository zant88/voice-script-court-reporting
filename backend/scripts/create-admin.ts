#!/usr/bin/env tsx
import { UserService } from "../services/user.service";
import { UserRole } from "../generated/prisma/client";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const userService = new UserService();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
};

const createAdmin = async () => {
  console.log('=== Create Admin User ===\n');

  const name = await prompt('Name: ');
  const email = await prompt('Email: ');
  const password = await prompt('Password: ');
  const location = await prompt('Location (City Name): ');

  try {
    const user = await userService.createNewUser({
      name,
      email,
      password,
      location,
      role: UserRole.ADMIN
    });

    console.log('\nAdmin user created successfully!');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
  } catch (error) {
    console.error('\nError creating admin user:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
};

createAdmin();