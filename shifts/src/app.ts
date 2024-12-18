import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import {
  BadRequestError,
  currentUser,
  errorHandler,
  NotFoundError,
} from '@share-package/common';
import { shiftRouter } from './routes/shift.routes';
import { userShiftRoutes } from './routes/user-shift.routes';

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
app.use(shiftRouter);
app.use(userShiftRoutes);

app.all('*', async (req, res) => {
  throw new BadRequestError('Route must be define');
});
app.use(errorHandler);
export { app };
