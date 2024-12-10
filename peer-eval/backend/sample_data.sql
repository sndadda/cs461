--all passwords are 'password123'
INSERT INTO Portal_User (id,username, pass, final_role) VALUES
(1,'professor1@drexel.edu', '$2a$10$4hD0WMAi1i7OMRClNJFHneLhVvMMvFW.TWwkNwSUJSF/G80w.60ES', 'professor'),
(2,'student1@drexel.edu', '$2a$10$4hD0WMAi1i7OMRClNJFHneLhVvMMvFW.TWwkNwSUJSF/G80w.60ES', 'student'),
(3,'student2@drexel.edu', '$2a$10$4hD0WMAi1i7OMRClNJFHneLhVvMMvFW.TWwkNwSUJSF/G80w.60ES', 'student'),
(4,'student3@drexel.edu', '$2a$10$4hD0WMAi1i7OMRClNJFHneLhVvMMvFW.TWwkNwSUJSF/G80w.60ES', 'student');


INSERT INTO Student (stud_id, first_name, last_name) VALUES
(2, 'John', 'Doe'),
(3, 'Jane', 'Smith'),
(4, 'Carol', 'Gyan');

INSERT INTO Professor (prof_id, first_name, last_name) VALUES
(1, 'Dr. Alan', 'Turing');

INSERT INTO Course (course_num, course_name, course_term, course_year, prof_id) VALUES
('CS101', 'Intro to Computer Science', 'Fall', '2024', 1),
('MATH101', 'Calculus I', 'Spring', '2024', 1);

INSERT INTO Default_Form (course_num, survey_name) VALUES
('CS101', 'CS101 Evaluation Form'),
('MATH101', 'MATH101 Evaluation Form');

INSERT INTO Evaluation_Table (evaluator_id, person_evaluated, rating, course_num, eval_par) VALUES
(2, 2, 3, 'CS101', 'Great team member, helped in group discussions.'),
(2, 3, 3, 'CS101', 'Great team member, helped in group discussions.'),
(2, 4, 3, 'CS101', 'Great team member, helped in group discussions.'),
(3, 3, 4, 'CS101', 'Collaborated well, but could improve in technical skills.');

INSERT INTO Project (proj_id, course_num, proj_name) VALUES
(1, 'CS101', 'Final Project'),
(2, 'MATH101', 'Project 1');

INSERT INTO Teammates (proj_id, stud_id) VALUES
(1, 2),
(1, 3),
(2, 3),
(2, 2);

INSERT INTO Grades (prof_id, course_num, stud_id, grade) VALUES
(1, 'CS101', 2, 90),
(1, 'CS101', 3, 85),
(1, 'MATH101', 2, 95),
(1, 'MATH101', 3, 88);

INSERT INTO Enrollment (course_num, stud_id) VALUES
('CS101', 2),
('CS101', 3),
('CS101', 4),
('MATH101', 2),
('MATH101', 3);

