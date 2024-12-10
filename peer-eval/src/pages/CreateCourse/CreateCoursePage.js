import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateCourse() {
    const [professors, setProfessors] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [courseNumber, setCourseNumber] = useState('');
    const [courseTerm, setCourseTerm] = useState('');
    const [courseYear, setCourseYear] = useState('');
    const [selectedProfessor, setSelectedProfessor] = useState('');

    useEffect(() => {
        async function fetchProfessors() {
            try {
                const response = await fetch('http://localhost:5000/api/professors', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch professors');
                }

                const data = await response.json();
                if (data.success) {
                    setProfessors(data.professors);
                } else {
                    console.error('Failed to fetch professors:', data.message);
                }
            } catch (error) {
                console.error('Error fetching professors:', error);
            }
        }

        fetchProfessors();
    }, []);

    const handleCreateCourse = async () => {
        if (!courseName || !courseNumber || !courseTerm || !courseYear || !selectedProfessor) {
            alert('Please fill in all fields!');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/create-course',
                {
                    course_name: courseName,
                    course_num: courseNumber,
                    course_term: courseTerm,
                    course_year: courseYear,
                    prof_id: selectedProfessor,
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                alert('Course created successfully!');
            } else {
                alert('Failed to create course.');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <h2>Create Course</h2>

            <label htmlFor="courseName">Course Name:</label>
            <input
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
            />

            <label htmlFor="courseNumber">Course Number:</label>
            <input
                type="text"
                id="courseNumber"
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
                placeholder="Enter course number"
            />

            <label htmlFor="courseTerm">Course Term:</label>
            <select
                id="courseTerm"
                value={courseTerm}
                onChange={(e) => setCourseTerm(e.target.value)}
            >
                <option value="" disabled>
                    Select a term
                </option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
            </select>

            <label htmlFor="courseYear">Course Year:</label>
            <input
                type="text"
                id="courseYear"
                value={courseYear}
                onChange={(e) => setCourseYear(e.target.value)}
                placeholder="Enter course year (e.g., 2024)"
            />

            <label htmlFor="professorDropdown">Select a Professor:</label>
            <select
                id="professorDropdown"
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
            >
                <option value="" disabled>
                    Select a professor
                </option>
                {professors.map((professor) => (
                    <option key={professor.prof_id} value={professor.prof_id}>
                        {professor.first_name} {professor.last_name}
                    </option>
                ))}
            </select>

            <button onClick={handleCreateCourse}>Create Course</button>
        </div>
    );
}

export default CreateCourse;
