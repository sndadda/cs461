import React, { useEffect, useState } from 'react';
import './StudentSurveyPage.css';

function StudentSurvey() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState('');
    const [surveyDetails, setSurveyDetails] = useState(null);
    const [nextClicked, setNextClicked] = useState(false);
    const [evalText, setEvalText] = useState(''); 

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

    const handleCourseChange = async (event) => {
        const course = event.target.value;
        setSelectedCourse(course);
        setNextClicked(false); 
        setSelectedSurvey(''); 
        setSurveyDetails(null); 

        try {
            const response = await fetch(`http://localhost:5000/api/surveys/${course}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setSurveys(data.surveys || []);
            } else {
                console.error('Failed to fetch surveys for the selected course.');
            }
        } catch (error) {
            console.error('Error in fetching surveys:', error);
        }
    };

    const handleSurveyChange = (event) => {
        setSelectedSurvey(event.target.value);
    };

    const handleNext = async () => {
        if (!selectedSurvey) {
            alert('Please select a survey!');
            return;
        }

        // Fetch survey questions
        try {
            const response = await fetch(`http://localhost:5000/api/survey-questions/${selectedSurvey}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setSurveyDetails(data.survey);
                setNextClicked(true);
            } else {
                console.error('Failed to fetch survey details.');
            }
        } catch (error) {
            console.error('Error fetching survey questions:', error);
        }
    };

    const handleEvalTextChange = (event) => {
        setEvalText(event.target.value); 
    };

    return (
        <div className="survey-container">
            <h2>Student Survey</h2>

            {!nextClicked && (
                <>
                    <div className="dropdown-container">
                        <label htmlFor="courseDropdown">Select a Course:</label>
                        <select id="courseDropdown" value={selectedCourse} onChange={handleCourseChange}>
                            <option value="" disabled>Select a course</option>
                            {courses.map((course) => (
                                <option key={course.course_num} value={course.course_num}>
                                    {course.course_name} ({course.course_term} {course.course_year})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCourse && (
                        <div className="dropdown-container">
                            <label htmlFor="surveyDropdown">Select a Survey:</label>
                            <select id="surveyDropdown" value={selectedSurvey} onChange={handleSurveyChange}>
                                <option value="" disabled>Select a survey</option>
                                {surveys.map((survey) => (
                                    <option key={survey.form_id} value={survey.form_id}>
                                        {survey.survey_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button onClick={handleNext}>Next</button>
                </>
            )}

            {nextClicked && surveyDetails && (
                <div className="survey-form-container">
                    <h3>{surveyDetails.survey_name}</h3>
                    <form>
                        {surveyDetails.questions.map((question, index) => (
                        <div key={index} className="question-container">
                            <label>{question}</label>
                            <div className="radio-buttons">
                                {[0, 1, 2, 3, 4].map((value) => (
                                    <label key={value}>
                                        <input
                                            type="radio"
                                            name={`question${index}`}
                                            value={value}
                                        /> {value}
                                    </label>
                                ))}
                            </div>
                        </div>
                        ))}

                        <div className="question-container">
                            <label>{surveyDetails.eval_par}</label> 
                            <textarea
                                value={evalText}
                                onChange={handleEvalTextChange}
                                placeholder="Write your evaluation here..."
                                rows="4"
                            />
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}

export default StudentSurvey;
