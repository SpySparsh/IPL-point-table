import express, { Application } from 'express';
import cors from 'cors';
import teamRoutes from './routes/teamRoutes';
import matchRoutes from './routes/matchRoutes';
import pointsTableRoutes from './routes/pointsTableRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Update this section!
app.use(cors({
  origin: [
    'http://localhost:5173', // Your local Vite server
    'https://sportsfan360-client.vercel.app' // Replace this with your actual Vercel URL
  ],
  credentials: true // This is the magic word that allows Firebase Auth headers through!
}));
app.use(express.json());

app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/points-table', pointsTableRoutes);

app.use(errorHandler);

export default app;
