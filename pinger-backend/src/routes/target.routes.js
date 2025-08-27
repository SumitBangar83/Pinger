// src/routes/target.routes.js
import { Router } from 'express';
import {
  createTarget,
  getTargetHistory,
  getAllTargets,
  updateTarget, // import karo
  deleteTarget, // import karo
} from '../controllers/target.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(verifyJWT);

// POST /api/v1/targets and GET /api/v1/targets
router.route('/').post(createTarget).get(getAllTargets);

// PUT /api/v1/targets/:id and DELETE /api/v1/targets/:id
router.route('/:id').put(updateTarget).delete(deleteTarget); 

// GET /api/v1/targets/:id/history
router.route('/:id/history').get(getTargetHistory);
export default router;