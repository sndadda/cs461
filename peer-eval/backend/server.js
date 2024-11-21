import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

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
