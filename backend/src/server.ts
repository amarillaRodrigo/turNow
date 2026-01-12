import app from './app.js';
import dotenv from 'dotenv';
import { logger } from './shared/logger/logger.js';

dotenv.config();


const PORT = process.env.PORT;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
