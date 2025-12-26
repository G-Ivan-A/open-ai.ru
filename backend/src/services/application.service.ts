import prisma from '../utils/database';
import { CreateApplicationDto, UpdateApplicationDto } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationService {
  // Create new application
  async createApplication(userId: string, data: CreateApplicationDto) {
    const application = await prisma.application.create({
      data: {
        userId,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        businessDescription: data.businessDescription,
        companyName: data.companyName || null,
        industry: data.industry,
        automationGoal: data.automationGoal,
        targetProcess: data.targetProcess,
        expectedResults: data.expectedResults || null,
        budget: data.budget || null,
        timeline: data.timeline || null,
        urgency: data.urgency || 'MEDIUM',
        additionalComments: data.additionalComments || null,
        attachments: data.attachments || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return application;
  }

  // Get application by ID
  async getApplicationById(id: string, userId?: string, isAdmin = false) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    // Check permissions: owner or admin can view
    if (!isAdmin && userId !== application.userId) {
      throw new ApiError(403, 'Forbidden: You can only view your own applications');
    }

    return application;
  }

  // Get user's applications
  async getUserApplications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.count({
        where: { userId },
      }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get all applications (admin only)
  async getAllApplications(
    page = 1,
    limit = 20,
    status?: ApplicationStatus
  ) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update application status (admin only)
  async updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationDto
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        assignedTo: data.assignedTo,
        adminNotes: data.adminNotes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updatedApplication;
  }

  // Delete application
  async deleteApplication(applicationId: string, userId: string, isAdmin = false) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    // Check permissions: owner or admin can delete
    if (!isAdmin && userId !== application.userId) {
      throw new ApiError(403, 'Forbidden: You can only delete your own applications');
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    return { message: 'Application deleted successfully' };
  }

  // Get applications statistics (admin only)
  async getStatistics() {
    const [
      totalApplications,
      newApplications,
      inProgressApplications,
      completedApplications,
      applicationsByIndustry,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'NEW' } }),
      prisma.application.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.application.count({ where: { status: 'COMPLETED' } }),
      prisma.application.groupBy({
        by: ['industry'],
        _count: true,
        orderBy: {
          _count: {
            industry: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalApplications,
      newApplications,
      inProgressApplications,
      completedApplications,
      topIndustries: applicationsByIndustry.map((item) => ({
        industry: item.industry,
        count: item._count,
      })),
    };
  }
}

export default new ApplicationService();
