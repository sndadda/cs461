import React, { useEffect, useState } from 'react';
import './StudentReportPage.css';
import axios from 'axios';
import rubric from '../../images/rubric_image.png';

function StudentReport() {
  const [evaluations, setEvaluations] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/student-report', {
        withCredentials: true,
      })
      .then((response) => {
        const { evaluations, averageScore, feedback } = response.data;

        // Update state with the received data
        setEvaluations(evaluations);
        setAverageScore(averageScore);
        setTotalEvaluations(evaluations.length);
        setFeedback(feedback);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching evaluations data:', err.message);
        setError('Failed to load evaluations data.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="student-report-page">
      <h1>Student Report</h1>

            <p>
                A total of {totalEvaluations} evaluations were submitted for you.
            </p>
            <p>
                Your <strong>average</strong> score was <strong>{Math.round(averageScore * 100) / 100}</strong>.
            </p>
      <img src={rubric} alt="rubric" className="rubric" />

      {feedback.length > 0 ? (
        <div>
          <h3>Anonymous Written Feedback:</h3>
          <ul>
            {feedback.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No feedback.</p>
      )}
    </div>
  );
}

export default StudentReport;
