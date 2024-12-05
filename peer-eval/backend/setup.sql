CREATE TYPE role as ENUM ('student', 'professor');

CREATE TABLE IF NOT EXISTS Portal_User (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(255) UNIQUE NOT NULL,
    pass        VARCHAR(255) NOT NULL,
    final_role  role
);

CREATE TABLE IF NOT EXISTS Student (
    stud_id     INT PRIMARY KEY,
    first_name  VARCHAR(32),
    last_name   VARCHAR(128),
    FOREIGN KEY (stud_id) REFERENCES Portal_User (id)
);

CREATE TABLE IF NOT EXISTS Professor (
    prof_id     INT PRIMARY KEY,
    first_name  VARCHAR(32),
    last_name   VARCHAR(128),
    FOREIGN KEY (prof_id) REFERENCES Portal_User (id)
);

CREATE TYPE term AS ENUM ('Fall', 'Winter', 'Spring', 'Summer');

CREATE TABLE IF NOT EXISTS Course (
    course_num  VARCHAR(5) PRIMARY KEY,
    course_name VARCHAR(128),
    course_term term,
    course_year CHAR(4),
    prof_id     INT,
    FOREIGN KEY (prof_id) REFERENCES Professor (prof_id)
);

CREATE TABLE IF NOT EXISTS Evaluation_Table (
    evaluator_id        INT,
    person_evaluated    INT,
    rating              INT,
    course_num          VARCHAR(5),
    eval_par            TEXT,
    PRIMARY KEY (evaluator_id, person_evaluated),
    FOREIGN KEY (evaluator_id) REFERENCES Student (stud_id),
    FOREIGN KEY (person_evaluated) REFERENCES Student (stud_id),
    FOREIGN KEY (course_num) REFERENCES Course (course_num),
    CHECK (rating < 5)
);

CREATE TABLE IF NOT EXISTS Project (
    proj_id     INT PRIMARY KEY,
    course_num  VARCHAR(5),
    proj_name   VARCHAR(32),
    FOREIGN KEY (course_num) REFERENCES Course (course_num)
);

CREATE TABLE IF NOT EXISTS Teammates (
    proj_id     INT,
    stud_id     INT,
    PRIMARY KEY (proj_id, stud_id),
    FOREIGN KEY (proj_id) REFERENCES Project (proj_id),
    FOREIGN KEY (stud_id) REFERENCES Student (stud_id)
);

CREATE TABLE IF NOT EXISTS Grades (
    prof_id     INT,
    course_num  VARCHAR(5),
    stud_id     INT,
    grade       INT,
    PRIMARY KEY (prof_id, course_num, stud_id),
    FOREIGN KEY (prof_id) REFERENCES Professor (prof_id),
    FOREIGN KEY (course_num) REFERENCES Course (course_num),
    FOREIGN KEY (stud_id) REFERENCES Student (stud_id),
    CHECK (grade <= 100 AND grade >= 0)
);

CREATE TABLE IF NOT EXISTS Enrollment (
    course_num  VARCHAR(5),
    stud_id     INT,
    PRIMARY KEY (course_num, stud_id),
    FOREIGN KEY (course_num) REFERENCES Course (course_num),
    FOREIGN KEY (stud_id) REFERENCES Student (stud_id)
);


DELETE FROM Teammates;
DELETE FROM Grades;
DELETE FROM Enrollment;
DELETE FROM Evaluation_Table;
DELETE FROM Project;


DELETE FROM Student;
DELETE FROM Professor;
DELETE FROM Portal_User;
