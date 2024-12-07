import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProfessorCourses() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [surveyName, setSurveyName] = useState('');

    useEffect(() => {
        async function fetchCourses() {
            try {
                const response = await fetch('http://localhost:5000/api/enrolled-courses', {
                    method: 'GET',
                    credentials: 'include',
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
    
                const data = await response.json();
                if (data.success) {
                    setCourses(data.courses); 
                } else {
                    console.error('Failed to fetch courses:', data.message);
                }
            } catch (error) {
                console.error('Error in fetching courses:', error);
            }
        }
    
        fetchCourses();
    }, []);

    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    const handleSurveyNameChange = (event) => {
        setSurveyName(event.target.value);
    };

    const createSurvey = async () => {
        if (!selectedCourse || !surveyName) {
            alert('Please select a course and enter a survey name!');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/api/create-survey', {
                course_num: selectedCourse,
                survey_name: surveyName
            }, { withCredentials: true });
    
            if (response.data.success) {
                alert('Survey created successfully!');
            } else {
                alert('Failed to create survey.');
            }
        } catch (error) {
            console.error('Error creating survey:', error);
        }
    };
    

    return (
        <div>
            <h2>Survey</h2>
            <label htmlFor="courseDropdown">Select a Course:</label>
            <select id="courseDropdown" value={selectedCourse} onChange={handleCourseChange}>
                <option value="" disabled>Select a course</option>
                {courses.map((course) => (
                    <option key={course.course_num} value={course.course_num}>
                        {course.course_name} ({course.course_term} {course.course_year})
                    </option>
                ))}
            </select>

            <label htmlFor="surveyName">Survey Name:</label>
            <input
                type="text"
                id="surveyName"
                value={surveyName}
                onChange={handleSurveyNameChange}
                placeholder="Enter survey name"
            />

            <button onClick={createSurvey}>Create Survey</button>
        </div>
    );
}

export default ProfessorCourses;
