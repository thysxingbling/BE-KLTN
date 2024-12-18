import mongoose, { mongo } from 'mongoose';
import { OrderDoc } from './order';
import { ServiceDoc } from './service';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserDoc } from './user';
export interface UsageLog {
  date: Date;
  status: boolean;
}
interface OrderServiceAttrs {
  order: OrderDoc;
  service: ServiceDoc;
  quantity: number;
  totalPrice: number;
  usageLogs?: UsageLog[];
  execEmployee?: UserDoc;
}
export interface OrderServiceDoc extends mongoose.Document {
  order: OrderDoc;
  service: ServiceDoc;
  quantity: number;
  totalPrice: number;
  usageLogs?: UsageLog[];
  execEmployee?: UserDoc;
  isDeleted: boolean;
  version: number;
}
interface OrderServiceModel extends mongoose.Model<OrderServiceDoc> {
  build(attrs: OrderServiceAttrs): OrderServiceDoc;
  findByOrderId(orderId: string): Promise<OrderServiceDoc[] | null>;
}

const orderServiceSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    service: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Service',
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    usageLogs: [
      {
        date: {
          type: Date,
        },
        status: {
          type: Boolean,
        },
      },
    ],
    execEmployee: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderServiceSchema.set('versionKey', 'version');
orderServiceSchema.plugin(updateIfCurrentPlugin);

orderServiceSchema.statics.build = (
  attrs: OrderServiceAttrs
): OrderServiceDoc => {
  return new OrderServiceM(attrs);
};
orderServiceSchema.statics.findByOrderId = async (
  orderId: string
): Promise<OrderServiceDoc[] | null> => {
  const orderServices = await OrderServiceM.find({
    order: orderId,
    isDeleted: false,
  });
  return orderServices;
};

const OrderServiceM = mongoose.model<OrderServiceDoc, OrderServiceModel>(
  'OrderService',
  orderServiceSchema
);
export { OrderServiceM };
