import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();
const userController = new UserController();

router.patch('/me/availability', authenticate, (req, res, next) => userController.toggleMyAvailability(req, res, next));
router.get('/', authenticate, (req, res, next) => userController.getUsers(req, res, next));
router.get('/:id', authenticate, (req, res, next) => userController.getUserById(req, res, next));
router.post('/', authenticate, (req, res, next) => userController.createUser(req, res, next));
router.post('/login', (req, res, next) => userController.login(req, res, next));
router.patch('/:id', authenticate, (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', authenticate, (req, res, next) => userController.deleteUser(req, res, next));
router.patch('/:id/activate', authenticate, (req, res, next) => userController.activate(req, res, next));
router.patch('/:id/deactivate', authenticate, (req, res, next) => userController.deActivate(req, res, next));

export default router;