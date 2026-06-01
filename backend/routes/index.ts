import { Router } from 'express';
import jobRoutes from './job.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/jobs', jobRoutes);
router.use('/user', userRoutes);

export default router;