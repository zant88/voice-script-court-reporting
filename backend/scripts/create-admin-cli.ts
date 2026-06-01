#!/usr/bin/env tsx
import { UserService } from "../services/user.service";
import { UserRole } from "../generated/prisma/client";
import dotenv from "dotenv";

dotenv.config();

const [name, email, password, location] = process.argv.slice(2);

if (!name || !email || !password || !location) {
  console.log('Usage: npm run create-admin -- <name> <email> <password> <location>');
  console.log('Example: npm run create-admin -- "John Doe" admin@example.com "securepass123" "New York"');
  process.exit(1);
}

const userService = new UserService();

const createAdmin = async () => {
  try {
    const user = await userService.createNewUser({
      name,
      email,
      password,
      location,
      role: UserRole.ADMIN
    });

    console.log('Admin user created successfully!');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
  } catch (error) {
    console.error('\nError creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();