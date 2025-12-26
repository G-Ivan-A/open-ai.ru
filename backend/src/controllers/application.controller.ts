import { Response, NextFunction } from 'express';
import applicationService from '../services/application.service';
import emailService from '../services/email.service';
import { AuthRequest, CreateApplicationDto, UpdateApplicationDto } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationController {
  // Create new application
  async createApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const data: CreateApplicationDto = req.body;
      const application = await applicationService.createApplication(userId, data);

      // Send email notification to admin (async, don't wait)
      emailService.sendNewApplicationNotification(
        application.id,
        application.contactName,
        application.companyName,
        application.industry
      ).catch(console.error);

      res.status(201).json({
        success: true,
        data: application,
        message: 'Application submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get application by ID
  async getApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const application = await applicationService.getApplicationById(id, userId, isAdmin);

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user's applications
  async getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await applicationService.getUserApplications(userId, page, limit);

      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all applications (admin only)
  async getAllApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as ApplicationStatus | undefined;

      const result = await applicationService.getAllApplications(page, limit, status);

      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update application status (admin only)
  async updateApplicationStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateApplicationDto = req.body;

      const application = await applicationService.updateApplicationStatus(id, data);

      // Send status update email to user (async, don't wait)
      if (data.status && application.user) {
        emailService.sendApplicationStatusUpdate(
          application.user.email,
          application.user.name,
          application.id,
          data.status
        ).catch(console.error);
      }

      res.json({
        success: true,
        data: application,
        message: 'Application updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete application
  async deleteApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const result = await applicationService.deleteApplication(id, userId, isAdmin);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get application statistics (admin only)
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await applicationService.getStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ApplicationController();
