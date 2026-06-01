import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['http://localhost:3001', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api', apiRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Court Reporting Workflow API Running on http://localhost:${PORT}`);
});

export default app;