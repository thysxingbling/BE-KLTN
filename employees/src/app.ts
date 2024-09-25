import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import {
  NotFoundError,
  currentUser,
  errorHandler,
} from '@share-package/common';

const app = express();
app.use(json());
app.set('trust proxy', true);
// config cookie session
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != 'test',
  })
);

app.use(cors());
app.use(currentUser);

app.all('*', async (req, res) => {
  throw new NotFoundError('Route');
});
app.use(errorHandler);
export { app };
