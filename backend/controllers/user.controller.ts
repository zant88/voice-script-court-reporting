import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import type ms from 'ms';
import { UserService } from "../services/user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, location } = req.body;

      const newUser = await this.userService.createNewUser({
        name, 
        email, 
        password,
        role,
        location
      });

      return res.status(201).json(newUser);
    }catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password} = req.body;

      const user = await this.userService.login(email, password);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as ms.StringValue }
      )

      return res.status(200).json({ token, user});
    }catch (error) {
      next(error)
    }
  }

  async deActivate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
    
      const updatedUser = await this.userService.deActivate(userId);

      return res.status(200).json(updatedUser);
    }catch (errror) {
      next(errror)
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getUsers();
      
      return res.status(200).json(users);
    } catch (error) {
      next(error)
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      const user = await this.userService.getUserById(userId);

      return res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role, location } = req.body;
      const userId = req.params.id as string;
      const updated = await this.userService.updateUser(userId, { name, email, role, location });

      return res.status(200).json(updated)
    } catch (error) {
      next(error)
    }
  }

  async toggleMyAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const updated = await this.userService.toggleAvailability(userId);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      await this.userService.deleteUser(userId);

      return res.status(204).send();
    } catch (error) {
      next(error)
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      const updatedUser = await this.userService.activate(userId);

      return res.status(200).json(updatedUser);
    }catch (errror) {
      next(errror)
    }
  }
}