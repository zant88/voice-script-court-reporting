import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();
const jobController = new JobController();

router.use(authenticate);

router.get('/dashboard', (req, res, next) => jobController.getDashboard(req, res, next));
router.get('/', (req, res, next) => jobController.getAllJobs(req, res, next));
router.get('/:id', (req, res, next) => jobController.getJobById(req, res, next));
router.post('/', (req, res, next) => jobController.createJob(req, res, next));
router.patch('/:id', (req, res, next) => jobController.updateJob(req, res, next));
router.delete('/:id', (req, res, next) => jobController.deleteJob(req, res, next));
router.post('/:id/assign-reporter', (req, res, next) => jobController.assignReporter(req, res, next));
router.post('/:id/assign-editor', (req, res, next) => jobController.assignEditor(req, res, next));
router.post('/:id/transcribe', (req, res, next) => jobController.transcribeJob(req, res, next));
router.post('/:id/review', (req, res, next) => jobController.reviewJob(req, res, next));
router.post('/:id/complete', (req, res, next) => jobController.completeJob(req, res, next));

export default router;