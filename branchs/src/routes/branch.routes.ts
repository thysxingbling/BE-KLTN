import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BranchControllers } from '../controllers/branch.controller';
const router = express.Router();
const PHONE_MESSAGE = 'Phone number must be 10 number';
const ADDRESS_MESSAGE = 'Address must be provided.';
const EMAIL_MESSAGE = 'Email must be valid';
router.post(
  '/branchs/new',
  [
    body('name')
      .notEmpty()
      .isString()
      .withMessage('Branch name must be provided'),
    body('phoneNumber')
      .notEmpty()
      .isMobilePhone('vi-VN')
      .withMessage(PHONE_MESSAGE),
    body('address').not().isEmpty().withMessage(ADDRESS_MESSAGE),
    body('email').notEmpty().isEmail().withMessage(EMAIL_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.BranchCreate]),
  BranchControllers.newBranch
);
router.get('/branchs/', BranchControllers.getBranchs);
router.get('/branchs/:id', BranchControllers.getBranch);
router.patch(
  '/branchs/update/:id',
  [
    body('name')
      .notEmpty()
      .isString()
      .withMessage('Branch name must be provided'),
    body('phoneNumber')
      .notEmpty()
      .isMobilePhone('vi-VN')
      .withMessage(PHONE_MESSAGE),
    body('address').not().isEmpty().withMessage(ADDRESS_MESSAGE),
    body('email').notEmpty().isEmail().withMessage(EMAIL_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.BranchRead]),
  BranchControllers.updateBranch
);
router.patch(
  '/branchs/delete/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.BranchRead]),
  BranchControllers.deleteBranch
);
export { router as branchRouter };
