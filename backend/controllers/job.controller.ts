import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { caseName, durationMinutes, assignmentType, location, reporterRatePerMinute, editorFlatRate } = req.body;
      const userId = (req as any).user.id;

      const newJob = await this.jobService.createNewJob({
        caseName,
        durationMinutes,
        assignmentType,
        location,
        reporterRatePerMinute,
        editorFlatRate,
        createdBy: userId,
      });

      return res.status(201).json(newJob);
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.id as string;
      const job = await this.jobService.getJobById(jobId);
      return res.status(200).json(job);
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = (req as any).user;
      const jobs = await this.jobService.fetchJobList(userId, role);
      return res.status(200).json(jobs);
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await this.jobService.getDashboard();
      return res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { caseName, durationMinutes, assignmentType, location, reporterRatePerMinute, editorFlatRate } = req.body;
      const jobId = req.params.id as string;
      const updated = await this.jobService.updateJob(jobId, {
        caseName, durationMinutes, assignmentType, location, reporterRatePerMinute, editorFlatRate,
      });
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.id as string;
      await this.jobService.deleteJob(jobId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async assignReporter(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reporterId } = req.body;

      const updatedJob = await this.jobService.assignReporterToJob(id, reporterId);
      return res.status(200).json(updatedJob);
    } catch (error) {
      next(error);
    }
  }

  async assignEditor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { editorId } = req.body;

      const updatedJob = await this.jobService.assignEditorToJob(id, editorId);
      return res.status(200).json(updatedJob);
    } catch (error) {
      next(error);
    }
  }

  async transcribeJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { id: userId, role } = (req as any).user;
      const { transcriptionResult } = req.body;

      const updatedJob = await this.jobService.transcribeJob(id, userId, transcriptionResult, role);
      return res.status(200).json(updatedJob);
    } catch (error) {
      next(error);
    }
  }

  async reviewJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { id: userId, role } = (req as any).user;
      const { transcriptionResult } = req.body;

      const updatedJob = await this.jobService.reviewJob(id, userId, transcriptionResult, role);
      return res.status(200).json(updatedJob);
    } catch (error) {
      next(error);
    }
  }

  async completeJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const finishedJobAndPayment = await this.jobService.finalizeAndCompleteJob(id);
      return res.status(200).json(finishedJobAndPayment);
    } catch (error) {
      next(error);
    }
  }
}