import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pkg from "pg";
const { Pool } = pkg;

import { readFileSync } from 'fs';

const env = JSON.parse(readFileSync(new URL('../env.json', import.meta.url)));
// console.log(env);

const pool = new Pool(env);

pool.connect()
  .then(() => console.log(`Connected to database ${env.database}`))
  .catch(err => console.error('Error connecting to the database:', err.message));


const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const port = 5000;
const hostname = 'localhost';

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to peer evaluation application' });
});

app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
