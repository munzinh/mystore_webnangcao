import express from 'express';
import { trackEvent, getUserBehaviors } from '../controllers/behaviorController.js';
import authUser from '../middlewares/authUser.js';

const behaviorRouter = express.Router();

behaviorRouter.post('/track', authUser, trackEvent);
behaviorRouter.get('/me', authUser, getUserBehaviors);

export default behaviorRouter;
