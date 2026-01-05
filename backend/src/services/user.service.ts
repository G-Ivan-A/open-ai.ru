import prisma from '../utils/database';
import { hashPassword } from '../utils/password';
import { RegisterUserDto, UpdateProfileDto } from '../types';
import { ApiError } from '../middleware/errorHandler';

export class UserService {
  // Create new user
  async createUser(data: RegisterUserDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        expertise: data.expertise || [],
        contactInfo: data.contactInfo || null,
        bio: data.bio || null,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get user by ID
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        cases: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reputationHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get user by email
  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  // Update user profile
  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Separate user fields from profile fields
    const userFields = {
      name: data.name,
      bio: data.bio,
      expertise: data.expertise,
      contactInfo: data.contactInfo,
      avatar: data.avatar,
    };

    const profileFields = {
      companyName: data.companyName,
      companySize: data.companySize,
      foundedYear: data.foundedYear,
      website: data.website,
      yearsExperience: data.yearsExperience,
      certifications: data.certifications,
      portfolio: data.portfolio,
      businessType: data.businessType,
      industry: data.industry,
      employeeCount: data.employeeCount,
    };

    // Filter out undefined values
    const filteredUserFields = Object.fromEntries(
      Object.entries(userFields).filter(([_, v]) => v !== undefined)
    );
    const filteredProfileFields = Object.fromEntries(
      Object.entries(profileFields).filter(([_, v]) => v !== undefined)
    );

    // Update user and profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...filteredUserFields,
        profile: {
          update: filteredProfileFields,
        },
      },
      include: {
        profile: true,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // Get users by role
  async getUsersByRole(role: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: role as any, isActive: true },
        skip,
        take: limit,
        include: {
          profile: true,
        },
        orderBy: { reputationPoints: 'desc' },
      }),
      prisma.user.count({
        where: { role: role as any, isActive: true },
      }),
    ]);

    const usersWithoutPasswords = users.map(({ passwordHash: _, ...user }) => user);

    return {
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Delete user (soft delete)
  async deleteUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'User deleted successfully' };
  }
}

export default new UserService();
