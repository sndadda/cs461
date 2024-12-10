import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs, { appendFile } from 'fs';
import bcrypt from 'bcrypt';
import pkg from 'pg';
import cookieParser from 'cookie-parser';
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

pool
  .connect()
  .then((client) => {
    console.log('Database connected');
    client.release();
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error.message);
  });

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

const port = 5000;
const hostname = 'localhost';

const verifyAuthentication = async (req, res, next) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized access.' });
  }

  try {
    const userQuery = `
          SELECT id, username, final_role
          FROM Portal_User
          WHERE id = $1
      `;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rowCount === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid user session.' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Error verifying authentication:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

app.get('/api/protected', verifyAuthentication, (req, res) => {
  res.json({ success: true, message: `Welcome, ${req.user.username}` });
});

app.get('/api/enrolled-courses', verifyAuthentication, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.final_role;

  try {
    let query;
    let params;

    if (role === 'student') {
      query = `
        SELECT c.course_num, c.course_name, c.course_term, c.course_year
        FROM Enrollment e
        JOIN Course c ON e.course_num = c.course_num
        WHERE e.stud_id = $1
      `;
      params = [userId];
    } else if (role === 'professor') {
      query = `
        SELECT c.course_num, c.course_name, c.course_term, c.course_year
        FROM Course c
        WHERE c.prof_id = $1
      `;
      params = [userId];
    } else {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized role' });
    }

    const result = await pool.query(query, params);
    res.json({ success: true, courses: result.rows });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Error fetching courses.' });
  }
});

app.get('/api/surveys/:course_num', verifyAuthentication, async (req, res) => {
  const { course_num } = req.params;

  try {
    const query = `
          SELECT form_id, survey_name
          FROM Default_Form
          WHERE course_num = $1
      `;
    const result = await pool.query(query, [course_num]);

    res.json({ success: true, surveys: result.rows });
  } catch (error) {
    console.error('Error fetching surveys:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Error fetching surveys.' });
  }
});

app.get(
  '/api/survey-questions/:survey_id',
  verifyAuthentication,
  async (req, res) => {
    const { survey_id } = req.params;

    try {
      const query = `
      SELECT survey_name, question1, question2, question3, eval_par
      FROM Default_Form
      WHERE form_id = $1
    `;
      const result = await pool.query(query, [survey_id]);

      if (result.rowCount > 0) {
        const survey = result.rows[0];
        res.json({
          success: true,
          survey: {
            survey_name: survey.survey_name,
            questions: [survey.question1, survey.question2, survey.question3],
            eval_par: survey.eval_par,
          },
        });
      } else {
        res.status(404).json({ success: false, message: 'Survey not found.' });
      }
    } catch (error) {
      console.error('Error fetching survey questions:', error.message);
      res
        .status(500)
        .json({ success: false, message: 'Error fetching survey questions.' });
    }
  }
);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to peer evaluation application' });
});

app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    if (!['student', 'professor'].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid role selected.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userInsertQuery = `
            INSERT INTO Portal_User (username, pass, final_role)
            VALUES ($1, $2, $3)
            RETURNING id, username, final_role
        `;
    const userResult = await pool.query(userInsertQuery, [
      email,
      hashedPassword,
      role,
    ]);
    const user = userResult.rows[0];

    const roleTable = role === 'student' ? 'Student' : 'Professor';
    const detailsInsertQuery = `
            INSERT INTO ${roleTable} (${
      role === 'student' ? 'stud_id' : 'prof_id'
    }, first_name, last_name)
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
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.pass);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password.' });
    }

    res.cookie('userId', user.id, { httpOnly: true, sameSite: 'strict' });

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
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('userId');
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/create-survey', verifyAuthentication, async (req, res) => {
  const { course_num, survey_name } = req.body;

  if (!course_num || !survey_name) {
    return res.status(400).json({
      success: false,
      message: 'Course number and survey name are required.',
    });
  }

  try {
    const query =
      'INSERT INTO Default_Form (course_num, survey_name) VALUES ($1, $2) RETURNING form_id';
    const values = [course_num, survey_name];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.json({ success: true, form_id: result.rows[0].form_id });
    } else {
      res
        .status(500)
        .json({ success: false, message: 'Failed to create survey.' });
    }
  } catch (error) {
    console.error('Error creating survey:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error while creating survey.' });
  }
});

app.get('/api/professor-courses', verifyAuthentication, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM COURSE WHERE prof_id = $1', [
      userId,
    ]);

    if (result.rows.length === 0) {
      console.log('No courses found');
    }

    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Error fetching course information', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

app.get('/api/students-in-course', async (req, res) => {
  const { course_num, course_term, course_year } = req.query;

  console.log('query:', course_num, course_term, course_year);

  try {
    const result = await pool.query(
      `SELECT s.stud_id, s.first_name, s.last_name
      FROM Student s
      JOIN Enrollment e ON s.stud_id = e.stud_id
      JOIN Course c ON e.course_num = c.course_num
      WHERE c.course_num = $1
      AND c.course_term = $2
      AND c.course_year = $3`,
      [course_num, course_term, course_year]
    );

    console.log('result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No students found');
    }

    res.json({ students: result.rows });
  } catch (error) {
    console.error('Error fetching student information', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

app.get('/api/student-evaluations', async (req, res) => {
  const { course_num, course_term, course_year } = req.query;

  try {
    const result = await pool.query(
      `SELECT 
      evaluator_id, 
      COUNT(*) AS total_evaluations,
      SUM(CASE WHEN evaluator_id = person_evaluated THEN 1 ELSE 0 END) AS self_evaluations,
      AVG(rating) AS avg_rating
      FROM Evaluation_Table e
      JOIN Course c ON e.course_num = c.course_num
      WHERE c.course_num = $1
      AND c.course_term = $2
      AND c.course_year = $3
      GROUP BY evaluator_id`,
      [course_num, course_term, course_year]
    );

    console.log('result:', result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching evaluation data', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

app.get('/api/team-size', async (req, res) => {
  const { course_num, course_term, course_year } = req.query;

  try {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT t.stud_id) AS team_size
      FROM Teammates t
      JOIN Project p ON t.proj_id = p.proj_id
      JOIN Course c ON p.course_num = c.course_num
      WHERE c.course_num = $1
      AND c.course_term = $2
      AND c.course_year = $3`,
      [course_num, course_term, course_year]
    );

    res.json({ team_size: result.rows[0].team_size });
  } catch (error) {
    console.error('Error fetching team size', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

app.get('/api/projects/:course_num', verifyAuthentication, async (req, res) => {
  const { course_num } = req.params;

  try {
    const query = `
      SELECT proj_id, proj_name
      FROM Project
      WHERE course_num = $1
      `;
    const result = await pool.query(query, [course_num]);
    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Error fetching class projects:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch class projects.' });
  }
});

app.get('/api/teammates/:proj_id', verifyAuthentication, async (req, res) => {
  const userId = req.user.id;
  const { proj_id } = req.params;

  try {
    const query = `
    SELECT S.stud_id, S.first_name, S.last_name
    FROM Teammates G
    JOIN Student S ON G.stud_id = S.stud_id
    WHERE G.proj_id = $1
      AND G.stud_id != $2
      AND NOT EXISTS (
        SELECT 1
        FROM Evaluation_Table E
        WHERE E.evaluator_id = $2
          AND E.person_evaluated = G.stud_id
      );
    `;
    const result = await pool.query(query, [proj_id, userId]);
    res.json({ success: true, teammates: result.rows });
  } catch (error) {
    console.error('Error fetching teammates:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch teammates.' });
  }
});

app.post('/api/submit-evaluation', verifyAuthentication, async (req, res) => {
  const userId = req.user.id;
  const { person_evaluated, rating, course_num, eval_par } = req.body;

  if (!person_evaluated || !rating || !course_num || !eval_par) {
    return res.status(400).json({
      success: false,
      message: 'Invalid evaluation.',
    });
  }

  try {
    const query =
      'INSERT INTO Evaluation_Table (evaluator_id, person_evaluated, rating, course_num, eval_par) VALUES ($1, $2, $3, $4, $5) RETURNING evaluator_id, person_evaluated';
    const values = [userId, person_evaluated, rating, course_num, eval_par];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.json({
        success: true,
        evaluator_id: result.rows[0].evaluator_id,
        person_evaluated: result.rows[0].person_evaluated,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: 'Failed to save evaluation.' });
    }
  } catch (error) {
    console.error('Error saving evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting evaluation.',
    });
  }
});

app.get('/api/student-report', verifyAuthentication, async (req, res) => {
  try {
    const detailedQuery = `
          SELECT rating, eval_par
          FROM Evaluation_Table
          WHERE person_evaluated = $1
      `;
    const detailedResult = await pool.query(detailedQuery, [req.user.id]);

    const aggregateQuery = `
          SELECT AVG(rating) AS avg_score,
                 ARRAY_AGG(eval_par) AS feedbacks
          FROM Evaluation_Table
          WHERE person_evaluated = $1
      `;
    const aggregateResult = await pool.query(aggregateQuery, [req.user.id]);

    const evaluations = detailedResult.rows || [];
    const avgScore = aggregateResult.rows[0]?.avg_score || 0.0;
    const feedbacks = aggregateResult.rows[0]?.feedbacks || [];

    res.json({
      evaluations,
      averageScore: avgScore,
      feedback: feedbacks,
    });
  } catch (error) {
    console.error('Error fetching student report:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Error fetching student report.' });
  }
});

app.get('/api/professors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Professor');

    console.log("results: ", result.rows);
    
    res.json({ success: true, professors: result.rows });
  } catch (error) {
    console.error('Error fetching professors:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/create-course', verifyAuthentication, async (req, res) => {
  const { course_name, course_num, course_term, course_year, prof_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Course (course_name, course_num, course_term, course_year, prof_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [course_name, course_num, course_term, course_year, prof_id]
    );
  
    console.log("results: ", result.rows[0]);
  
    res.json({ success: true, course: result.rows[0] });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Project');

    console.log("results: ", result.rows);
    
    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/create-team', async (req, res) => {
  const { proj_id, members } = req.body;

  try {
    for (let i = 0; i < members.length; i++) {
      const memberId = members[i];

      await pool.query(
        'INSERT INTO Teammates (proj_id, stud_id) VALUES ($1, $2)',
        [proj_id, memberId]
      );
    }

    console.log("Team created successfully for project:", proj_id);
    res.json({ success: true, message: 'Team created successfully!' });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/students/:courseNum', async (req, res) => {
  const { courseNum } = req.params;

  if (!courseNum) {
      return res.status(400).json({ success: false, message: 'Course number is required' });
  }

  try {
      const query = `
          SELECT s.stud_id, s.first_name, s.last_name
          FROM Student s
          JOIN Enrollment e ON s.stud_id = e.stud_id
          WHERE e.course_num = $1
      `;
      const result = await pool.query(query, [courseNum]);

      console.log('Fetched students:', result.rows);

      res.status(200).json({ success: true, students: result.rows });
  } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/add-project', async (req, res) => {
  const { course_num, proj_name } = req.body;
  try {
    const result = await pool.query(`INSERT INTO Project (course_num, proj_name) VALUES ($1, $2)`,
      [course_num, proj_name]
    );
    
    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
