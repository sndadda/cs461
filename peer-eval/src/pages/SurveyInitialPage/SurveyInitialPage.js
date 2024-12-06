import React, { useState } from 'react';
import './SurveyInitialPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SurveyInitial({ user }) {
  const [courses, setCourses] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeammate, setSelectedTeammate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/courses`, { params: { userId: user.id } })
      .then((response) => {
        console.log(response.data);
        setCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
      });

    axios
      .get('/api/teammates')
      .then((response) => {
        setTeammates(response.data);
      })
      .catch((error) => {
        console.error('Error fetching teammates:', error);
      });
  }, []);

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleTeammateChange = (event) => {
    setSelectedTeammate(event.target.value);
  };

  return (
    <div className="surveyInitialContainer">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
        rel="stylesheet"
      ></link>

      <div>Choose your course:</div>
      {courses.length > 0 ? (
        <select
          id="courseDropdown"
          value={selectedCourse}
          onChange={handleCourseChange}
        >
          {courses.map((course) => (
            <option key={course.course_id} value={course.course_id}>
              {course.course_name} ({course.course_code})
            </option>
          ))}
        </select>
      ) : (
        <p>You are not enrolled in any courses yet.</p>
      )}
      <div>Choose a team mate to evaluate:</div>
      <p>
        Students are required to complete the survey for all team members and
        themselves. Your grade may be impacted by your survey, including whether
        you complete it or not by the deadline. This survey is to evaluate
        yourself and your teammates. Your responses may be shared with faculty
        involved with your team. This evaluation may influence individual
        grades, including your own. The following questions are based on the
        Teamwork Value Rubric below, the rating scale is out of 5.
      </p>
    </div>
  );
}

export default SurveyInitial;
