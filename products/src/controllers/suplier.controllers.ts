import { Request, Response } from 'express';
import { BadRequestError, ListPermission } from '@share-package/common';
import { SuplierServices } from '../services/suplier.service';
import { SuplierPublisher } from '../services/suplier.publiser.service';
import { Check } from '../utils/check-type';

export class SuplierControllers {
  static async new(req: Request, res: Response) {
    const { name, description } = req.body;
    const category = await SuplierServices.create(name, description);
    SuplierPublisher.new(category);
    res
      .status(201)
      .send({ message: 'POST: create suplier successfully', category });
  }
  static async readAll(req: Request, res: Response) {
    const { pages = 1, sortBy, name } = req.query;
    const { supliers, totalItems } = await SuplierServices.readAll(
      pages as string,
      sortBy as string
    );
    res.status(200).send({
      message: 'GET: List supliers successfully',
      supliers,
      totalItems,
    });
  }
  static async readOne(req: Request, res: Response) {
    const { id } = req.params;
    const { pages = 1, sortBy } = req.query;
    let isManager = false;
    if (req.currentUser) {
      const { type, permissions } = req.currentUser!;
      isManager = Check.isManager(type, permissions, [
        ListPermission.ProductRead,
      ]);
    }
    const suplier = await SuplierServices.readOne(
      id,
      isManager,
      pages as string,
      sortBy as string
    );
    res.status(200).send({ message: 'GET: Suplier successfully', suplier });
  }
  static async findByName(req: Request, res: Response) {
    const { pages = 1, sortBy, name } = req.query;
    const suplier = await SuplierServices.findByName(
      name as string,
      pages as string,
      sortBy as string
    );
    res
      .status(200)
      .send({ message: 'GET: suplier by name successfully', suplier });
  }
  static async update(req: Request, res: Response) {
    const { name, description } = req.body;
    const { id } = req.params;
    const existSuplier = await SuplierServices.update(id, name, description);
    SuplierPublisher.update(existSuplier);
    res.status(200).send({
      message: 'PATCH: update suplier successfully',
      existSuplier,
    });
  }
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const suplier = await SuplierServices.delete(id);
    SuplierPublisher.delete(suplier);
    res.status(200).send({ message: 'PATCH: delete suplier successfully' });
  }
}
