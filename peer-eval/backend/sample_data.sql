INSERT INTO Portal_User (username, pass, final_role) VALUES
('student1', 'password123', 'student'),
('student2', 'password123', 'student'),
('professor1', 'password123', 'professor');

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

INSERT INTO Evaluation_Table (evaluator_id, person_evaluated, form_id, rating1, rating2, rating3, course_num, eval_par) VALUES
(1, 1, 1, 3, 2, 1, 'CS101', 'Great team member, helped in group discussions.'),
(2, 2, 1, 3, 2, 1, 'CS101', 'Collaborated well, but could improve in technical skills.');

INSERT INTO Project (proj_id, course_num, proj_name) VALUES
(1, 'CS101', 'Final Project'),
(2, 'MATH101', 'Project 1');

INSERT INTO Teammates (proj_id, stud_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2);

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
