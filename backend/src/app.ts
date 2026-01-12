import express from 'express';
import { errorHandler } from './shared/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.use(errorHandler);
export default app;
