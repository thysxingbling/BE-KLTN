import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { AccountCreatedListenr } from './events/listeners/account-created-listener';

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
    // declare listenr
    new AccountCreatedListenr(natsWrapper.client).listen();
    // new PaymentCreatedListener(natsWrapper.client).listen();
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