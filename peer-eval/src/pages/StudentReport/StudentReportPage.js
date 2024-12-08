import React, { useEffect, useState } from 'react';
import './StudentReportPage.css';
import axios from 'axios';
import rubric from '../../images/rubric_image.png';

function StudentReport() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch student report data when the component mounts
        axios.get('http://localhost:5000/api/student-report', {
            withCredentials: true
        })
            .then((response) => {
                setReportData(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching student report:', err.response ? err.response.data : err.message);
                setError(err.response ? err.response.data.message : 'Failed to fetch student report.');
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="student-report-container">
            <h1>Student Report</h1>
            <img src={rubric} alt="rubric" className="rubric" />
            {reportData ? (
                <div>
                    <h2>Report Details</h2>
                    <p><strong>Name:</strong> {reportData.name}</p>
                    <p><strong>Course:</strong> {reportData.course}</p>
                    <p><strong>Average Rating:</strong> {Math.round(reportData.avg_rating * 100) / 100}</p>
                    <p><strong>Total Evaluations:</strong> {reportData.total_evaluations}</p>
                </div>
            ) : (
                <p>No report data available.</p>
            )}
        </div>
    );
}

export default StudentReport;