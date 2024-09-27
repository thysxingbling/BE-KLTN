import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user';
import {
  BadRequestError,
  UserType,
  validationRequest,
  getOtp,
  templatePassword,
  requireAuth,
  requireType,
  requirePermission,
  ListPermission,
} from '@share-package/common';
import { Mail } from '../../services/send-mail';
import { Account } from '../../models/account';

const router = express.Router();
const OTP_TIME = 5;
const PASSWORD_ERR =
  'Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-16 characters long.';
router.post(
  '/accounts/new/employee',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('fullName').not().isEmpty().withMessage('Full name must be provided'),
    body('gender').not().isEmpty().withMessage('Gender must be provided'),
    body('phoneNumber')
      .isMobilePhone('vi-VN')
      .withMessage('Phone number must be 10 number'),
    body('address').not().isEmpty().withMessage('Address must be provided.'),
  ],
  // middleware validationRequest
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission(ListPermission.EmployeeCreate),
  async (req: Request, res: Response) => {
    const { email, fullName, gender, phoneNumber, address } = req.body;
    try {
      const existAccount = await Account.findOne({ email: email });
      if (existAccount) throw new BadRequestError('Email is used');
      const existsUser = await User.findOne({ phoneNumber: phoneNumber });
      if (existsUser) {
        throw new BadRequestError('Phone number is used');
      }
      const password = getOtp(10, true, true, true, true);
      const account = Account.build({
        email: email,
        password: password,
        type: UserType.Employee,
      });
      await account.save();
      const user = User.build({
        fullName,
        gender,
        phoneNumber,
        address,
        account: account.id,
      });
      await user.save();
      const html = templatePassword.getOtpHtml(password);
      await Mail.send(
        email,
        password,
        html,
        `Chào mừng ${fullName} đến với Kim Beauty Spa`
      );
      res.status(201).send({ password: password });
    } catch (error) {
      console.log(error);
    }
    // new User({ email, password })
  }
);

export { router as newEmployeeRouter };
