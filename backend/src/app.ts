import express from 'express';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { logger } from './shared/logger/logger.js';

const app = express();
app.use(express.json());

app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`)
    next();
})

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.use(errorHandler);
export default app;
