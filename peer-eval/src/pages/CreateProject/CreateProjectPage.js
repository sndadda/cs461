import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateProject() {
    const [formData, setFormData] = useState({
        courseNum: '',
        courseTerm: '',
        courseYear: ''
    });

    const [courseData, setCourseData] = useState({
        courseNum: []
    });

    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/professor-courses', {
            withCredentials: true
        })
        .then(response => {
            const { courses } = response.data;
            console.log("courses:", courses);

            let courseNum = [];

            courses.forEach(course => {
                if (!courseNum.includes(course.course_num)) {
                    courseNum.push(course.course_num);
                }
            });

            setCourseData({
                courseNum
            });
        })
        .catch(error => {
            console.error('Error fetching course data', error);
        });
    })

    const handleCreateProject = async () => {
        if (!projectName) {
            alert('Please fill in all fields!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/add-project',
                {
                    project_name: projectName,
                    course_num: course
                },
            );
        } catch (error) {
            console.error('Error creating project:', error);
            alert('An error occurred. Please try again.');
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div>
            <h2>Create Project</h2>

            <label htmlFor="projectName">Project Name:</label>
            <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
            />

            <select name="courseNum" value={courseData.course_num} onChange={handleChange}>
                <option value="">Select Course Number</option>
                {courseData.course_num.map((course, index) => (
                    <option key={index} value={course}>{course}</option>
                ))}
            </select>

            <button onClick={handleCreateProject}>Create Project</button>
        </div>
    )
}

export default CreateProject;