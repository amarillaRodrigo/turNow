import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { logger } from './shared/logger/logger.js';


const app = express();

// CORS config
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
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
