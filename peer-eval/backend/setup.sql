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
    course_num  VARCHAR(10) PRIMARY KEY,
    course_name VARCHAR(128),
    course_term term,
    course_year CHAR(4),
    prof_id     INT,
    FOREIGN KEY (prof_id) REFERENCES Professor (prof_id)
);

CREATE TABLE IF NOT EXISTS Default_Form (
    form_id SERIAL PRIMARY KEY,
    course_num  VARCHAR(10),
    survey_name VARCHAR(128),
    question1   VARCHAR(255) DEFAULT 'Rate how they contribute to Team Meetings.',
    question2   VARCHAR(255) DEFAULT 'Rate how they facilitate the Contributions of Team Members.',
    question3   VARCHAR(255) DEFAULT 'Rate how they make Individual Contributions outside of Team Meetings.',
    eval_par    VARCHAR(255) DEFAULT 'Add any additional comments about the team member.',
    FOREIGN KEY (course_num) REFERENCES Course (course_num)
);

CREATE TABLE IF NOT EXISTS Evaluation_Table (
    evaluator_id        INT,
    person_evaluated    INT,
    rating              INT,
    course_num          VARCHAR(10),
    eval_par            TEXT,
    PRIMARY KEY (evaluator_id, person_evaluated),
    FOREIGN KEY (evaluator_id) REFERENCES Student (stud_id),
    FOREIGN KEY (person_evaluated) REFERENCES Student (stud_id),
    FOREIGN KEY (course_num) REFERENCES Course (course_num),
);


CREATE TABLE IF NOT EXISTS Project (
    proj_id     INT PRIMARY KEY,
    course_num  VARCHAR(10),
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
    course_num  VARCHAR(10),
    stud_id     INT,
    grade       INT,
    PRIMARY KEY (prof_id, course_num, stud_id),
    FOREIGN KEY (prof_id) REFERENCES Professor (prof_id),
    FOREIGN KEY (course_num) REFERENCES Course (course_num),
    FOREIGN KEY (stud_id) REFERENCES Student (stud_id),
    CHECK (grade <= 100 AND grade >= 0)
);

CREATE TABLE IF NOT EXISTS Enrollment (
    course_num  VARCHAR(10),
    stud_id     INT,
    PRIMARY KEY (course_num, stud_id),
    FOREIGN KEY (course_num) REFERENCES Course (course_num),
    FOREIGN KEY (stud_id) REFERENCES Student (stud_id)
);

INSERT INTO Portal_User (username, pass, final_role) VALUES
('student1@drexel.edu', '$2a$10$4hD0WMAi1i7OMRClNJFHneLhVvMMvFW.TWwkNwSUJSF/G80w.60ES', 'student'),
('student2@drexel.edu', '$2a$10$4hD0WMAi1i7OMRClNJFHneLhVvMMvFW.TWwkNwSUJSF/G80w.60ES', 'student'),
('professor1@drexel.edu', '$2a$10$4hD0WMAi1i7OMRClNJFHneLhVvMMvFW.TWwkNwSUJSF/G80w.60ES', 'professor');


INSERT INTO Student (stud_id, first_name, last_name) VALUES
(1, 'John', 'Doe'),
(2, 'Jane', 'Smith');

INSERT INTO Professor (prof_id, first_name, last_name) VALUES
(1, 'Dr. Alan', 'Turing');

INSERT INTO Course (course_num, course_name, course_term, course_year, prof_id) VALUES
('CS101', 'Intro to Computer Science', 'Fall', '2024', 1),
('MATH101', 'Calculus I', 'Spring', '2024', 1);

INSERT INTO Default_Form (course_num, survey_name) VALUES
('CS101', 'CS101 Evaluation Form'),
('MATH101', 'MATH101 Evaluation Form');

INSERT INTO Evaluation_Table (evaluator_id, person_evaluated, rating, course_num, eval_par) VALUES
(1, 1, 6, 'CS101', 'Great team member, helped in group discussions.'),
(2, 2, 6, 'CS101', 'Collaborated well, but could improve in technical skills.');

INSERT INTO Project (proj_id, course_num, proj_name) VALUES
(1, 'CS101', 'Final Project'),
(2, 'MATH101', 'Project 1');

INSERT INTO Teammates (team_id, proj_id, stud_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 2, 2);

INSERT INTO Grades (prof_id, course_num, stud_id, grade) VALUES
(1, 'CS101', 1, 90),
(1, 'CS101', 2, 85),
(1, 'MATH101', 1, 95),
(1, 'MATH101', 2, 88);

INSERT INTO Enrollment (course_num, stud_id) VALUES
('CS101', 1),
('CS101', 2),
('MATH101', 1),
('MATH101', 2);
