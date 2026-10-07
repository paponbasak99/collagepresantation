import express from 'express';
import { streamQueue, getLiveQueueSnapshot } from '../controllers/queueController.js';

const router = express.Router();

// SSE live stream
router.get('/stream', streamQueue);

// Live queue snapshot
router.get('/live', getLiveQueueSnapshot);

export default router;
