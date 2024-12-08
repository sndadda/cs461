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
      console.error('Error in fetching group members, etc:', error);
    }
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

    // Fetch survey questions
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
              ? question.replace('they', selectedTeammate.first_name)
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

  const saveEvaluation = async () => {
    let totalRating = 0;
    const responses = surveyDetails.questions.map((_, index) => {
      const selectedOption = document.querySelector(
        `input[name="question${index}"]:checked`
      );
      if (!selectedOption) {
        return null;
      }
      totalRating += parseInt(selectedOption.value, 10);
      return parseInt(selectedOption.value, 10);
    });

    if (responses.includes(null)) {
      alert('Please answer all questions!');
      return;
    }

    const submissionData = {
      person_evaluated: selectedTeammate.stud_id,
      rating: totalRating,
      course_num: selectedCourse,
      eval_par: evalText,
    };

    if (submissionData.rating >= 5) {
      alert('The total rating must be less than 5.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/submit-evaluation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit evaluation');
      }

      const data = await response.json();
      if (data.success) {
        alert('Evaluation submitted successfully!');
        setNextClicked(false);
        setSurveyDetails(null);
        setSelectedSurvey('');
        setEvalText('');
      } else {
        console.error('Evaluation submission failed:', data.message);
        alert('Failed to submit the evaluation. Please try again.');
      }
    } catch (error) {
      console.error('Error during evaluation submission:', error);
      alert(
        'An error occurred while submitting the evaluation. Please try again.'
      );
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
              {courses.map((course) => (
                <option key={course.course_num} value={course.course_num}>
                  {course.course_name} ({course.course_term}{' '}
                  {course.course_year})
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-container">
            <label htmlFor="courseDropdown">Select Class Project:</label>
            <select
              id="courseDropdown"
              value={selectedProject}
              onChange={handleProjectChange}
            >
              <option value="" disabled>
                Select class project
              </option>
              {projects.map((project) => (
                <option key={project.proj_id} value={project.proj_id}>
                  {project.proj_name}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="dropdown-container">
              <label htmlFor="projectsDropdown">Select a Survey:</label>
              <select
                id="surveyDropdown"
                value={selectedSurvey}
                onChange={handleSurveyChange}
              >
                <option value="" disabled>
                  Select a survey
                </option>
                {surveys.map((survey) => (
                  <option key={survey.form_id} value={survey.form_id}>
                    {survey.survey_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSurvey && (
            <div className="dropdown-container">
              <label htmlFor="surveyDropdown">
                Choose a teammate to evaluate:
              </label>
              <select
                id="surveyDropdown"
                value={selectedTeammate}
                onChange={handleMateChange}
              >
                <option value="" disabled>
                  Select a teammate
                </option>
                {teammates.map((teammate) => (
                  <option
                    key={teammate.stud_id}
                    value={JSON.stringify({
                      stud_id: teammate.stud_id,
                      first_name: teammate.first_name,
                    })}
                  >
                    {teammate.first_name} {teammate.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button onClick={handleNext}>Next</button>

          <div>
            Students are required to complete the survey for all team members
            and themselves. Your grade may be impacted by your survey, including
            whether you complete it or not by the deadline. This survey is to
            evaluate yourself and your teammates. Your responses may be shared
            with faculty involved with your team. This evaluation may influence
            individual grades, including your own. The following questions are
            based on the Teamwork Value Rubric below, the rating scale is out of
            5.
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
                      />{' '}
                      {value}
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
            <button onClick={saveEvaluation}>Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudentSurvey;
