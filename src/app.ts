import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
import AppDataSource from './data-source';
import cors from 'cors';
const PORT = process?.env?.PORT || 3000;

// Create Express app
let app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

// Require router
app.use('/api', routes);

// For File Upload
app.use('/uploads', express.static('uploads'));

// Middleware for handling 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: https://localhost:${PORT}`);
});

export default app;
