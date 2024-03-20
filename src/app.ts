import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';
// import routes from './routes';
import { AppDataSource } from './data-source';
// const AppDataSource = require('./data-source');
const PORT = process?.env?.PORT || 3000;

// Create Express app
let app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

// Routes
app.use('/api', routes);

// For File Upload
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: https://localhost:${PORT}`);
});

export default app;
