import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { UserCreatedListener } from './events/listeners/users/user-created-listener';
import { UserUpdatedListener } from './events/listeners/users/user-updated-listener';
import { UserDeletedListener } from './events/listeners/users/user-deleted-listener';
import { CategoryCreatedListener } from './events/listeners/categories/category-created-listener';
import { CategoryUpdatedListener } from './events/listeners/categories/category-updated-listener';
import { CategoryDeletedListener } from './events/listeners/categories/category-deleted-listener';
import { SuplierCreatedListener } from './events/listeners/supliers/suplier-created-listener';
import { SuplierUpdatedListener } from './events/listeners/supliers/suplier-updated-listener';
import { SuplierDeletedListener } from './events/listeners/supliers/suplier-deleted-listener';
import { ProductCreatedListener } from './events/listeners/products/product-created-listener';
import { ProductUpdatedListener } from './events/listeners/products/product-updated-listener';
import { ProductDeletedListener } from './events/listeners/products/product-deleted-listener';
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS client must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS cluster id must be defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('Nats connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client!.close());
    process.on('SIGTERM', () => natsWrapper.client!.close());
    new UserCreatedListener(natsWrapper.client).listen();
    new UserUpdatedListener(natsWrapper.client).listen();
    new UserDeletedListener(natsWrapper.client).listen();

    // declare listenr
    new CategoryCreatedListener(natsWrapper.client).listen();
    new CategoryUpdatedListener(natsWrapper.client).listen();
    new CategoryDeletedListener(natsWrapper.client).listen();
    // ------------------suplier --------------------------
    new SuplierCreatedListener(natsWrapper.client).listen();
    new SuplierUpdatedListener(natsWrapper.client).listen();
    new SuplierDeletedListener(natsWrapper.client).listen();
    // ------------------product --------------------------
    new ProductCreatedListener(natsWrapper.client).listen();
    new ProductUpdatedListener(natsWrapper.client).listen();
    new ProductDeletedListener(natsWrapper.client).listen();
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecting mongo!!');
  } catch (error) {
    console.log(error);
  }
};

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
// start db mongo
start();