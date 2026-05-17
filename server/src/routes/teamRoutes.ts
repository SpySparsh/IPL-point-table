import { Router } from 'express';
import { getAllTeams } from '../controllers/teamsController';

const router: Router = Router();

router.get('/', getAllTeams);

export default router;
