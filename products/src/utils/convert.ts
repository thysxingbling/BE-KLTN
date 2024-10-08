import { ProductDoc } from '../models/product';

interface ConvertProduct {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  suplierId?: string;
  suplierName?: string;
  imageUrl: string;
  expire: Date;
  costPrice?: number;
  featured: boolean;
  salePrice: number;
  quantity: number;
  active: boolean;
  version: number;
}
export class Convert {
  static product(productDoc: ProductDoc) {
    const convertProduct: ConvertProduct = {
      id: productDoc.id,
      name: productDoc.name,
      description: productDoc.description,
      categoryId: productDoc.category?.id,
      categoryName: productDoc.category?.name,
      suplierId: productDoc.suplier?.id,
      suplierName: productDoc.suplier?.name,
      imageUrl: productDoc.imageUrl,
      expire: productDoc.expire,
      costPrice: productDoc.costPrice,
      salePrice: productDoc.salePrice!,
      quantity: productDoc.quantity,
      active: productDoc.active!,
      version: productDoc.version,
      featured: productDoc.featured!,
    };
    return convertProduct;
  }
  static products(productDocs: ProductDoc[]) {
    const convertProducts = [];
    for (const product of productDocs) {
      const convertProduct = this.product(product);
      convertProducts.push(convertProduct);
    }
    return convertProducts;
  }
}
