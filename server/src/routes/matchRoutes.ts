import { Router } from 'express';
import {
  addMatch,
  deleteMatch,
  getAllMatches,
  getMatchById,
  updateMatch,
} from '../controllers/matchesController';
import { adminAuth } from '../middleware/adminAuth';
import { validate } from '../middleware/validate';
import { matchSchema } from '../schemas/matchSchema';

const router: Router = Router();

router.get('/', getAllMatches);
router.post('/', adminAuth, validate(matchSchema), addMatch);
router.get('/:id', getMatchById);
router.put('/:id', adminAuth, validate(matchSchema), updateMatch);
router.delete('/:id', adminAuth, deleteMatch);

export default router;
