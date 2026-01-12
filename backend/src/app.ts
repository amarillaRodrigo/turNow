import express from 'express';
import cors from 'cors';
import { env } from './shared/config/env.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { logger } from './shared/logger/logger.js';


const app = express();


app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (env.ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());

app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`)
    next();
})

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.use(errorHandler);
export default app;
