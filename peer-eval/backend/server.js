import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import bcrypt from 'bcrypt';
import pkg from 'pg'; 
const { Pool } = pkg; 


let config;
try {
  const rawConfig = fs.readFileSync('env.json', 'utf8');
  config = JSON.parse(rawConfig);
} catch (error) {
  console.error('Error reading env.json:', error.message);
  process.exit(1); 
}


const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
});

pool.connect()
    .then(client => {
        console.log('Database connected');
        client.release();
    })
    .catch(error => {
        console.error('Error connecting to the database:', error.message);
    });


const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, 
}));
app.use(bodyParser.json());



const port = 5000;
const hostname = 'localhost';

const isAuthenticated = (req, res, next) => {
  const user = req.body.user; 
  if (!user) {
      return res.status(401).json({ success: false, message: 'You must log in first.' });
  }
  req.user = user; 
  next();
};

const authorizeRole = (allowedRoles) => (req, res, next) => {
  const user = req.user;
  if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  next();
};


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to peer evaluation application' });
});



app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    try {
        if (!['student', 'professor'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role selected.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userInsertQuery = `
            INSERT INTO Portal_User (username, pass, final_role)
            VALUES ($1, $2, $3)
            RETURNING id, username, final_role
        `;
        const userResult = await pool.query(userInsertQuery, [email, hashedPassword, role]);
        const user = userResult.rows[0];

        const roleTable = role === 'student' ? 'Student' : 'Professor';
        const detailsInsertQuery = `
            INSERT INTO ${roleTable} (${role === 'student' ? 'stud_id' : 'prof_id'}, first_name, last_name)
            VALUES ($1, $2, $3)
        `;
        await pool.query(detailsInsertQuery, [user.id, firstName, lastName]);

        res.json({
            success: true,
            message: 'User registered successfully.',
            user: {
                id: user.id,
                username: user.username,
                role: user.final_role,
                firstName,
                lastName,
            },
        });
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ success: false, message: 'Error signing up user.' });
    }
});



app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const userQuery = `
          SELECT PU.id, PU.username, PU.pass, PU.final_role,
                 COALESCE(S.first_name, P.first_name) AS first_name
          FROM Portal_User PU
          LEFT JOIN Student S ON PU.id = S.stud_id
          LEFT JOIN Professor P ON PU.id = P.prof_id
          WHERE PU.username = $1
      `;
      const userResult = await pool.query(userQuery, [email]);

      if (userResult.rowCount === 0) {
          return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const user = userResult.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.pass);

      if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      res.json({
          success: true,
          message: 'Login successful',
          user: { 
              id: user.id, 
              username: user.username, 
              role: user.final_role,
              firstName: user.first_name, 
          },
      });
  } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});





app.post('/api/logout', (req, res) => {
  res.clearCookie('userId'); 
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/professorReport/:courseNum', async (req, res) => {
  const { courseNum } = req.params;

  try {
    const result = await pool.query(
      'SELECT course_num, course_term, course_year FROM COURSE WHERE course_num = $1',
      [courseNum]
    );

    if (result.rows.length === 0) {
      console.log("No courses found");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching course information", error.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
