import {
  BadRequestError,
  NotFoundError,
  UserType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { getValue, redisClient } from '../services/redis';
import { body } from 'express-validator';
import { UserRole } from '../models/user-role';
import { UserURMapping } from '../models/user-ur-mapping';
import { User } from '../models/user';
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
router.post(
  '/users/verify',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Otp is invalid'),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    // const client = await createClient()
    //   .on('error', (err) => console.log('Redis Client Error', err))
    //   .connect();

    const user = await User.findOne({ email: email });
    if (!user) throw new NotFoundError('User');

    const storeOtp = await getValue(email);
    if (storeOtp === null) {
      throw new BadRequestError('Otp has expires');
    }
    if (otp !== storeOtp) {
      throw new BadRequestError('Invalid OTP');
    }
    await redisClient.del(email);
    const userURMExist = await UserURMapping.findOne({ user: user.id });
    if (!userURMExist) {
      new UserCreatedPublisher(natsWrapper.client).publish({
        id: user.id,
        fullName: user.fullName,
        gender: user.gender,
        version: user.version,
        type: UserType.Customer,
      });
      return res.status(201).json({ 'verify-create': 'success' });
    }
    res.status(200).json({ verify: true });
  }
);

export { router as verifyRouter };
