import { BadRequestError, ListPermission } from '@share-package/common';
import { ProductPublisher } from '../services/product.publisher.service';
import { ProductService } from '../services/products.service';
import { Request, Response } from 'express';
import { Convert } from '../utils/convert';
import { String } from 'aws-sdk/clients/apigateway';
import { Check } from '../utils/check-type';
export class ProductControllers {
  static async new(req: Request, res: Response) {
    const {
      name,
      description,
      categoryId,
      suplierId,
      expire,
      costPrice,
      quantity,
      code,
    } = req.body!;
    const { file } = req;
    const { type } = req.currentUser!;
    if (!file) throw new BadRequestError('Image must be provided');
    const product = await ProductService.new({
      name: name!,
      description: description!,
      categoryId: categoryId,
      suplierId: suplierId,
      file: file,
      expire: expire,
      costPrice: costPrice,
      quantity: quantity,
      code: code,
    });
    ProductPublisher.new(product!);
    const convertProduct = Convert.product(product!);
    res.status(201).send({
      message: 'POST: product create successfully',
      convertProduct,
    });
  }
  static async readAll(req: Request, res: Response) {
    const {
      pages = 1,
      category,
      suplier,
      quantity,
      expire,
      name,
      discount,
      price,
      priceRange,
      discountRange,
      featured,
    } = req.query;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
    }
    try {
      const { products, totalItems } = await ProductService.readAll(
        pages as string,
        isManager,
        category as string,
        suplier as string,
        quantity as string,
        expire as string,
        name as string,
        price as string,
        discount as string,
        priceRange as string,
        discountRange as string,
        featured as string
      );
      const convertProducts = Convert.products(products);
      res.status(200).send({
        message: 'GET: Products successfully',
        products: convertProducts,
        totalItems,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
    }
    const product = await ProductService.readOne(id, isManager);
    res.status(200).send({
      message: 'GET: product information successfully',
      product,
    });
  }
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const {
      name,
      description,
      categoryId,
      suplierId,
      expire,
      costPrice,
      quantity,
      featured,
      discount,
      code,
    } = req.body;
    const { type } = req.currentUser!;
    const { file } = req;
    const isFeatured = featured === 'true' ? true : false;
    // const isActive = active === 'true' ? true : false;
    const updateProduct = await ProductService.update(
      id,
      {
        name: name,
        description: description,
        categoryId: categoryId,
        suplierId: suplierId,
        expire: expire,
        costPrice: costPrice,
        quantity: quantity,
        code: code,
      },
      isFeatured,
      parseInt(discount as string)
    );
    ProductPublisher.update(updateProduct);
    const convertProduct = Convert.product(updateProduct);
    res.status(200).send({
      message: 'PATCH: update product successfully',
      product: convertProduct,
    });
  }
  static async disable(req: Request, res: Response) {
    const { id } = req.params;
    const product = await ProductService.disable(id);
    ProductPublisher.delete(product);
    res.status(200).send({ message: 'PATCH: Disable product successfully' });
  }
  static async sortByCategoryOrSuplier(req: Request, res: Response) {
    const { id } = req.params;
    const { pages, name, featured } = req.query;
    const { type, permissions } = req.currentUser!;
    const isManager = Check.isManager(type, permissions, [
      ListPermission.ProductRead,
    ]);
    const { products, totalItems } =
      await ProductService.sortByCategoryOrSuplier(
        id,
        pages as string,
        isManager,
        name as string,
        featured as string
      );
    const convertProducts = Convert.products(products);
    res.status(200).send({
      message: 'GET: Sort by successfully',
      products: convertProducts,
      totalItems,
    });
  }
  static async readAllByName(req: Request, res: Response) {
    try {
      const { pages = 1, sortBy, name } = req.query;
      const { type, permissions } = req.currentUser!;
      const isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
      const { products, totalItems } = await ProductService.readAllByName(
        name as string,
        sortBy as string,
        pages as string,
        isManager
      );
      res.status(200).json({
        message: 'GET: product by name successfully',
        products,
        totalItems,
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async readAllProductUnactive(req: Request, res: Response) {
    const { type } = req.currentUser!;
    const { pages = 1, sortBy } = req.query;
    const { products, totalItems } =
      await ProductService.readAllProductUnactive(
        parseInt(pages as string),
        sortBy as String
      );
    const convertProducts = Convert.products(products);
    res.status(200).send({
      message: 'GET: List product unactive successfully',
      products: convertProducts,
      totalItems,
    });
  }
  static async exportData(req: Request, res: Response) {
    const { type } = req.query;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="products.xlsx"`,
    });
    try {
      if (type === 'suplier') {
        const workbook = await ProductService.exportProductBySuplier();
        return workbook.xlsx.write(res);
      }
      if (type === 'category') {
        const workbook = await ProductService.exportProductByCategory();
        return workbook.xlsx.write(res);
      }
      const workbook = await ProductService.exportProducts();
      workbook.xlsx.write(res);
      // res.status(200).send({ message: 'Export successfully' });
    } catch (error) {
      console.log(error);
    }
  }
  static async importData(req: Request, res: Response) {
    try {
      const file = req.file;
      const { products, existProducts } = await ProductService.importData(
        file!
      );
      res
        .status(201)
        .send({ message: 'import data successfully', products, existProducts });
    } catch (error) {
      console.log(error);
    }
  }
  static async addQuantity(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity, costPrice, salePrice } = req.body;
    const product = await ProductService.addQuantity(
      id,
      quantity,
      costPrice,
      salePrice
    );
    res
      .status(200)
      .send({ message: 'PATCH: Add quantit successfully', product });
  }
}
