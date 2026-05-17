import { Router } from 'express';
import { getPointsTable } from '../controllers/pointsTableController';

const router: Router = Router();

router.get('/', getPointsTable);

export default router;
