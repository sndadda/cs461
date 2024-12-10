import React, { useEffect, useState } from 'react';
import './StudentSurveyPage.css';

function StudentSurvey() {
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [surveyDetails, setSurveyDetails] = useState(null);
  const [selectedTeammate, setSelectedTeammate] = useState('');
  const [teammates, setTeammates] = useState([]);
  const [nextClicked, setNextClicked] = useState(false);
  const [evalText, setEvalText] = useState('');
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(
          'http://localhost:5000/api/enrolled-courses',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

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

  const fetchTeammates = async (project) => {
    try {
      const teammateResponse = await fetch(
        `http://localhost:5000/api/teammates/${project}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (teammateResponse.ok) {
        const teammateData = await teammateResponse.json();
        setTeammates(teammateData.teammates || []);
      } else {
        console.error('Failed to fetch teammates for the selected project.');
      }
    } catch (error) {
      console.error('Error in fetching group members:', error);
    }
  };

  const handleCourseChange = async (event) => {
    const course = event.target.value;
    setSelectedCourse(course);
    setNextClicked(false);
    setSelectedSurvey('');
    setSurveyDetails(null);

    try {
      const projectResponse = await fetch(
        `http://localhost:5000/api/projects/${course}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProjects(projectData.projects || []);
      } else {
        console.error('Failed to fetch projects for the selected course.');
      }

      const surveyResponse = await fetch(
        `http://localhost:5000/api/surveys/${course}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (surveyResponse.ok) {
        const surveyData = await surveyResponse.json();
        setSurveys(surveyData.surveys || []);
      } else {
        console.error('Failed to fetch surveys for the selected course.');
      }
    } catch (error) {
      console.error('Error in fetching surveys, etc:', error);
    }
  };

  const handleSurveyChange = (event) => {
    setSelectedSurvey(event.target.value);
  };

  const handleProjectChange = async (event) => {
    const project = event.target.value;
    setSelectedProject(project);
    setNextClicked(false);
    setSelectedTeammate('');
    setTeammates(null);

    await fetchTeammates(project);
  };

  const handleMateChange = async (event) => {
    const selectedMate = JSON.parse(event.target.value);
    setSelectedTeammate(selectedMate);
  };

  const handleNext = async () => {
    if (!selectedSurvey) {
      alert('Please select a survey!');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/survey-questions/${selectedSurvey}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        const modifiedSurvey = {
          ...data.survey,
          questions: data.survey.questions.map((question) =>
            selectedTeammate
              ? question.replace('{member}', selectedTeammate.first_name)
              : question
          ),
        };
        setSurveyDetails(modifiedSurvey);
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

  const handleRadioChange = (index, value) => {
    const newRatings = [...ratings];
    newRatings[index] = Number(value);
    setRatings(newRatings);
  };

  const saveEvaluation = async (event) => {
    event.preventDefault();

    const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);

    const evaluationData = {
      person_evaluated: selectedTeammate.stud_id,
      rating: totalRating,
      course_num: selectedCourse,
      eval_par: evalText,
    };

    try {
      const response = await fetch(
        'http://localhost:5000/api/submit-evaluation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(evaluationData),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('Evaluation submitted successfully!');
        setNextClicked(false);
        setSurveyDetails(null);
        setSelectedSurvey('');
        setSelectedTeammate('');
        setRatings([]);
        setEvalText('');
        setTeammates([]);
        await fetchTeammates(selectedProject);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="survey-container">
      <h2>Student Survey</h2>

      {!nextClicked && (
        <>
          <div className="dropdown-container">
            <label htmlFor="courseDropdown">Select a Course:</label>
            <select
              id="courseDropdown"
              value={selectedCourse}
              onChange={handleCourseChange}
            >
              <option value="" disabled>
                Select a course
              </option>
              {(courses || []).map((course) => (
                <option key={course.course_num} value={course.course_num}>
                  {course.course_name} ({course.course_term}{' '}
                  {course.course_year})
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-container">
            <label htmlFor="projectDropdown">Select Class Project:</label>
            <select
              id="projectDropdown"
              value={selectedProject}
              onChange={handleProjectChange}
            >
              <option value="" disabled>
                Select class project
              </option>
              {(projects || []).map((project) => (
                <option key={project.proj_id} value={project.proj_id}>
                  {project.proj_name}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <>
              <div className="dropdown-container">
                <label htmlFor="surveyDropdown">Select a Survey:</label>
                <select
                  id="surveyDropdown"
                  value={selectedSurvey}
                  onChange={handleSurveyChange}
                >
                  <option value="" disabled>
                    Select a survey
                  </option>
                  {(surveys || []).map((survey) => (
                    <option key={survey.form_id} value={survey.form_id}>
                      {survey.survey_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dropdown-container">
                <label htmlFor="teammateDropdown">
                  Choose a teammate to evaluate:
                </label>
                <select
                  id="teammateDropdown"
                  value={
                    selectedTeammate ? JSON.stringify(selectedTeammate) : ''
                  }
                  onChange={handleMateChange}
                >
                  <option value="" disabled>
                    Select a teammate
                  </option>
                  {(teammates || []).map((teammate) => (
                    <option
                      key={teammate.stud_id}
                      value={JSON.stringify({
                        stud_id: teammate.stud_id,
                        first_name: teammate.first_name,
                        last_name: teammate.last_name,
                      })}
                    >
                      {teammate.first_name} {teammate.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="button-container">
            <button onClick={handleNext}>Next</button>
          </div>

          <div>
            <p>
              {' '}
              Students are required to complete the survey for all team members
              and themselves. Your grade may be impacted by your survey,
              including whether you complete it or not by the deadline.<br></br>
            </p>
            <p>
              {' '}
              This survey is to evaluate yourself and your teammates. Your
              responses may be shared with faculty involved with your team.
              <br></br>
            </p>
            <p>
              {' '}
              This evaluation may influence individual grades, including your
              own. The following questions are based on the Teamwork Value
              Rubric below, the rating scale is out of 4.<br></br>
            </p>
          </div>
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
                        onChange={(e) =>
                          handleRadioChange(index, e.target.value)
                        }
                      />{' '}
                      <span>{value}</span>
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
            <div className="button-container">
              <button onClick={saveEvaluation}>Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudentSurvey;
