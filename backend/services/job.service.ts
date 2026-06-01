import 'dotenv/config';
import { PrismaClient, Prisma } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface CreateJobData {
  caseName: string;
  durationMinutes: number;
  assignmentType: 'PHYSICAL' | 'REMOTE';
  location: string;
  reporterRatePerMinute: number;
  editorFlatRate: number;
  createdBy: string;
}

export class JobService {
  async createNewJob(data: CreateJobData) {
    return await prisma.job.create({
      data: {
        caseName: data.caseName,
        durationMinutes: data.durationMinutes,
        assignmentType: data.assignmentType,
        location: data.location,
        reporterRatePerMinute: data.reporterRatePerMinute,
        editorFlatRate: data.editorFlatRate,
        createdBy: data.createdBy,
      }
    });
  }

  async getJobById(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        reporter: true,
        editor: true,
        creator: true,
        payments: true,
        transcriptionVersions: {
          include: { submittedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!job) throw new Error('Job not found.');
    return job;
  }

  async updateJob(jobId: string, data: Partial<Omit<CreateJobData, 'createdBy'>>) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');

    return await prisma.job.update({
      where: { id: jobId },
      data,
    });
  }

  async deleteJob(jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');

    return await prisma.job.delete({ where: { id: jobId } });
  }

  async assignEditorToJob(jobId: string, editorId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const editor = await prisma.user.findUnique({ where: { id: editorId } });

    if (!job || !editor) throw new Error('Job or Editor not found.');
    if (editor.role !== 'EDITOR') throw new Error('User is not an Editor.');

    return await prisma.job.update({
      where: { id: jobId },
      data: {
        editorId,
        status: job.status === 'NEW' ? 'ASSIGNED' : job.status,
      }
    });
  }

  async assignReporterToJob(jobId: string, reporterId: string) {
    const job = await prisma.job.findUnique({where: {id: jobId }});
    const reporter = await prisma.user.findUnique({ where: { id: reporterId } });

    if (!job || !reporter) throw new Error('Job or Reporter record not found.');
    if (!reporter.isAvailable || reporter.role != 'REPORTER') throw new Error('Reporter is unavailable or invalid.');

    if (job.assignmentType === 'PHYSICAL' && reporter.location !== job.location) {
      throw new Error(`Assigning should be at the location ${job.location}`);
    }

    return await prisma.job.update({
      where: { id: jobId },
      data: {
        reporterId,
        status: 'ASSIGNED'
      }
    })
  }

  async finalizeAndCompleteJob(jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Target job context missing.');

    const reporterEarnings = job.durationMinutes * job.reporterRatePerMinute;
    const editorEarnings = job.editorFlatRate;
    const totalPayout = reporterEarnings + editorEarnings;

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const paymentRecord = await tx.payment.create({
        data: { 
          jobId, 
          reporterEarnings, 
          editorEarnings, 
          totalPayout,
          reporterId: job.reporterId || '',
          editorId: job.editorId || ''
        }
      });

      const updatedJob = await tx.job.update({
        where: { id: jobId},
        data: { status: 'COMPLETED'}
      });

      return { paymentRecord, updatedJob };
    })
  }

  async fetchJobList(userId?: string, role?: string) {
    const where: any = {};
    if (role === 'REPORTER') where.reporterId = userId;
    if (role === 'EDITOR') where.editorId = userId;

    return await prisma.job.findMany({
      where,
      include: {
        reporter: true,
        editor: true,
        payments: true,
        transcriptionVersions: {
          include: { submittedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async transcribeJob(jobId: string, userId: string, content: string, userRole: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');
    if (job.reporterId !== userId) throw new Error('You are not the assigned reporter.');
    if (job.status !== 'ASSIGNED') throw new Error('Job must be in ASSIGNED status to transcribe.');

    const [version] = await prisma.$transaction([
      prisma.transcriptionVersion.create({
        data: { jobId, content, submittedById: userId, role: userRole }
      }),
      prisma.job.update({
        where: { id: jobId },
        data: { transcriptionResult: content, status: 'TRANSCRIBED', reportedAt: new Date() }
      })
    ]);

    return prisma.job.findUnique({
      where: { id: jobId },
      include: {
        reporter: true, editor: true, creator: true, payments: true,
        transcriptionVersions: {
          include: { submittedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async getDashboard() {
    const totalPayments = await prisma.payment.aggregate({
      _sum: { totalPayout: true, reporterEarnings: true, editorEarnings: true },
      _count: { id: true }
    });

    const reporterLeaderboard = await prisma.payment.groupBy({
      by: ['reporterId'],
      _sum: { reporterEarnings: true },
      _count: { id: true },
      orderBy: { _sum: { reporterEarnings: 'desc' } },
      take: 5
    });

    const reporterIds = reporterLeaderboard.map((r) => r.reporterId);
    const reporterUsers = await prisma.user.findMany({
      where: { id: { in: reporterIds } },
      select: { id: true, name: true }
    });
    const reporterMap = new Map(reporterUsers.map((u) => [u.id, u.name]));

    const editorLeaderboard = await prisma.payment.groupBy({
      by: ['editorId'],
      _sum: { editorEarnings: true },
      _count: { id: true },
      orderBy: { _sum: { editorEarnings: 'desc' } },
      take: 5
    });

    const editorIds = editorLeaderboard.map((r) => r.editorId);
    const editorUsers = await prisma.user.findMany({
      where: { id: { in: editorIds } },
      select: { id: true, name: true }
    });
    const editorMap = new Map(editorUsers.map((u) => [u.id, u.name]));

    const recentJobs = await prisma.job.findMany({
      where: { status: 'COMPLETED' },
      include: {
        reporter: { select: { name: true } },
        editor: { select: { name: true } },
        payments: { select: { totalPayout: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      totalPayout: totalPayments._sum.totalPayout || 0,
      totalReporterEarnings: totalPayments._sum.reporterEarnings || 0,
      totalEditorEarnings: totalPayments._sum.editorEarnings || 0,
      totalJobsCompleted: totalPayments._count.id,
      reporterLeaderboard: reporterLeaderboard.map((r) => ({
        id: r.reporterId,
        name: reporterMap.get(r.reporterId) || 'Unknown',
        totalEarnings: r._sum.reporterEarnings || 0,
        jobCount: r._count.id
      })),
      editorLeaderboard: editorLeaderboard.map((r) => ({
        id: r.editorId,
        name: editorMap.get(r.editorId) || 'Unknown',
        totalEarnings: r._sum.editorEarnings || 0,
        jobCount: r._count.id
      })),
      recentJobs: recentJobs.map((j) => ({
        id: j.id,
        caseName: j.caseName,
        reporterName: j.reporter?.name || null,
        editorName: j.editor?.name || null,
        totalPayout: j.payments[0]?.totalPayout || 0,
        createdAt: j.createdAt
      }))
    };
  }

  async reviewJob(jobId: string, userId: string, content: string, userRole: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');
    if (job.editorId !== userId) throw new Error('You are not the assigned editor.');
    if (job.status !== 'TRANSCRIBED') throw new Error('Job must be in TRANSCRIBED status for review.');

    await prisma.$transaction([
      prisma.transcriptionVersion.create({
        data: { jobId, content, submittedById: userId, role: userRole }
      }),
      prisma.job.update({
        where: { id: jobId },
        data: { transcriptionResult: content, status: 'REVIEWED', editedAt: new Date() }
      })
    ]);

    return prisma.job.findUnique({
      where: { id: jobId },
      include: {
        reporter: true, editor: true, creator: true, payments: true,
        transcriptionVersions: {
          include: { submittedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }
}
