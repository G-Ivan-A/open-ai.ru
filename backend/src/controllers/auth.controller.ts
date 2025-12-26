import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import emailService from '../services/email.service';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterUserDto, LoginDto } from '../types';
import { ApiError } from '../middleware/errorHandler';

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterUserDto = req.body;

      const user = await userService.createUser(data);

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Send welcome email (async, don't wait)
      emailService.sendWelcomeEmail(user.email, user.name).catch(console.error);

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
        },
        message: 'User registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: LoginDto = req.body;

      // Get user with password hash
      const user = await userService.getUserByEmail(data.email);

      // Verify password
      const isPasswordValid = await comparePassword(data.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Account is deactivated');
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
