import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NAME_MESSAGE } from '../utils/message';
import {
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  singleUploadMiddleware,
  validationRequest,
} from '@share-package/common';
import { ProductControllers } from '../controllers/product.controllers';
const router = express.Router();
router.post(
  '/products/manage/new',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage(`Product ${NAME_MESSAGE}`),
    body('categoryId').isMongoId().withMessage('Category Id must be valid'),
    body('suplierId').isMongoId().withMessage('Suplier Id must be valid'),
    body('expire').isISO8601().toDate().withMessage('Expire must be valid'),
    body('costPrice').isNumeric().withMessage('Cost price must be valid'),
    body('quantity').isNumeric().withMessage('Quanity must be valid'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductCreate]),
  ProductControllers.new
);
router.get('/products/', ProductControllers.readAll);
router.get(
  '/products/:id',
  // requireType([UserType.Manager, UserType.Employee]),
  // requirePermission(ListPermission.ProductRead),
  ProductControllers.readOne
);
router.patch(
  '/products/manage/:id',
  singleUploadMiddleware,
  [
    body('name').notEmpty().withMessage(`Product ${NAME_MESSAGE}`),
    body('categoryId').isMongoId().withMessage('Category Id must be valid'),
    body('suplierId').isMongoId().withMessage('Suplier Id must be valid'),
    body('expire').isISO8601().toDate().withMessage('Expire must be valid'),
    body('costPrice').isNumeric().withMessage('Cost price must be valid'),
    body('quantity').isNumeric().withMessage('Quanity must be valid'),
  ],
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductUpdate]),
  ProductControllers.update
);
router.patch(
  '/products/manage/disable/:id',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductUpdate]),
  ProductControllers.disable
);
router.get(
  '/products/sortBy/:id',
  requireAuth,
  // requireType([UserType.Manager]),
  // requirePermission(ListPermission.ProductRead),
  ProductControllers.sortByCategoryOrSuplier
);
router.get(
  '/products/find/name',
  validationRequest,
  ProductControllers.readAllByName
);
router.get(
  '/products/manage/unactive/',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.ProductRead]),
  ProductControllers.readAllProductUnactive
);
export { router as productRouter };
