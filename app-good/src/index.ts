import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import router from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || [] }));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

app.use('/api', router);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Task Tracker API running on port ${port}`);
});
