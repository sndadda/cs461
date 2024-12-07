import React, { useState, useEffect } from 'react';
import './ProfessorReportPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function ProfessorReport() {
    const [formData, setFormData] = useState({
        courseNum: '',
        courseTerm: '',
        courseYear: ''
    });

    const [courseData, setCourseData] = useState({
        courseNum: [],
        courseTerm: [],
        courseYear: []
    });

    const [studentData, setStudentData] = useState([]);
    const [evalData, setEvalData] = useState([]);
    const [teamSize, setTeamSize] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        axios.get('http://localhost:5000/api/courses')
        .then(response => {
            const { courses } = response.data;

            if (courses.length === 0) {
                console.log("No courses found");
                return;
            }

            console.log('Courses:', courses);

            let courseNum = [];
            let courseTerm = [];
            let courseYear = [];

            courses.forEach(course => {
                if (!courseNum.includes(course.course_num)) {
                    courseNum.push(course.course_num);
                }

                if (!courseTerm.includes(course.course_term)) {
                    courseTerm.push(course.course_term);
                }

                if (!courseYear.includes(course.course_year)) {
                    courseYear.push(course.course_year);
                }
            })

            console.log('Course Data:', { courseNum, courseTerm, courseYear });

            setCourseData({
                courseNum,
                courseTerm,
                courseYear
            });
        })
        .catch(error => {
            console.error('Error fetching course data', error);
        });
    }, []);

    useEffect(() => {
        if (formData.courseNum && formData.courseTerm && formData.courseYear) {
            axios.get('http://localhost:5000/api/students-in-course', {
                params: {
                    course_num: formData.courseNum,
                    course_term: formData.courseTerm,
                    course_year: formData.courseYear
                }
            })
            .then(response => {
                setStudentData(response.data.students);
            })
            .catch(error => {
                console.error('Error fetching student data', error);
            });

            axios.get('http://localhost:5000/api/student-evaluations', {
                params: {
                    course_num: formData.courseNum,
                    course_term: formData.courseTerm,
                    course_year: formData.courseYear
                }
            })
            .then(response => {
                setEvalData(response.data);
            })
            .catch(error => {
                console.error('Error fetching evaluation data', error);
            });

            axios.get('http://localhost:5000/api/team-size', {
                params: {
                    course_num: formData.courseNum,
                    course_term: formData.courseTerm,
                    course_year: formData.courseYear
                }
            })
            .then(response => {
                setTeamSize(response.data.team_size);
            })
            .catch(error => {
                console.error('Error fetching team size', error);
            });
        }
    }, [formData.courseNum, formData.courseTerm, formData.courseYear]);

    return (
        <div>
            <div className="course">
                <h3>Select a Course:</h3>
                <select name="courseNum" value={formData.courseNum} onChange={handleChange}>
                    <option value="">Select Course Number</option>
                    {courseData.courseNum.map((course, index) => (
                        <option key={index} value={course}>{course}</option>
                    ))}
                </select>

                <select name="courseTerm" value={formData.courseTerm} onChange={handleChange}>
                    <option value="">Select Course Term</option>
                    {courseData.courseTerm.map((course, index) => (
                        <option key={index} value={course}>{course}</option>
                    ))}
                </select>

                <select name="courseYear" value={formData.courseYear} onChange={handleChange}>
                    <option value="">Select Course Year</option>
                    {courseData.courseYear.map((course, index) => (
                        <option key={index} value={course}>{course}</option>
                    ))}
                </select>
            </div>

            <div className="report">
                {studentData.length > 0 ? (
                    <div>
                        <h3>Students in {formData.courseNum} ({formData.courseTerm} {formData.courseYear}):</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Total Evaluations</th>
                                    <th>Self Evaluations</th>
                                    <th>Average Rating</th>
                                    <th>Feedback</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentData.map((student, index) => {
                                    const studentEvalData = evalData.find(evaluation => evaluation.evaluator_id === student.stud_id);

                                    const totalEvaluations = studentEvalData ? studentEvalData.total_evaluations : 0;
                                    const selfEvaluations = studentEvalData ? studentEvalData.self_evaluations : 0;
                                    const avgRating = studentEvalData ? studentEvalData.avg_rating : 0;
                                    const formattedRating = (Math.round(avgRating * 100) / 100);

                                    console.log("self eval: ", selfEvaluations);
                                    console.log("total: ", totalEvaluations)
                                    console.log("avg: ", formattedRating);
                                    
                                    return (
                                        <tr key={index}>
                                            <td>{student.first_name} {student.last_name} (ID: {student.stud_id})</td>
                                            <td>{totalEvaluations}</td>
                                            <td>{selfEvaluations}</td>
                                            <td>{avgRating !== 'N/A' ? formattedRating : 'N/A'}</td>
                                            <td>{teamSize ? `You submitted ${totalEvaluations} out of ${teamSize} total evaluations. 
                                                ${selfEvaluations > 0 ? 'You did evaluate yourself.' : 'You did not evaluate yourself.'}` : 'N/A'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No students found for the selected course, term, and year.</p>
                )}
            </div>
        </div>
    )
}
export default ProfessorReport;