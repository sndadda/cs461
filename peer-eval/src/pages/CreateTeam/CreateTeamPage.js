import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateTeam() {
    const [projects, setProjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [teamName, setTeamName] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch('http://localhost:5000/api/projects', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }

                const data = await response.json();
                if (data.success) {
                    setProjects(data.projects);
                } else {
                    console.error('Failed to fetch projects:', data.message);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        }

        fetchProjects();
    }, []);

    useEffect(() => {
        if (!selectedProject) return;
        
        async function fetchStudents(courseNum) {
            if (!courseNum) return;
        
            console.log('Fetching students for course:', courseNum);

            try {
                const response = await fetch(`http://localhost:5000/api/students/${courseNum}`, {
                    method: 'GET',
                    credentials: 'include',
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
    
                const data = await response.json();
                if (data.success) {
                    setStudents(data.students);
                } else {
                    console.error('Failed to fetch students:', data.message);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        }
    
        const selectedProjectData = projects.find((proj) => proj.proj_id === parseInt(selectedProject));
        if (selectedProjectData) {
            fetchStudents(selectedProjectData.course_num);
        }
    }, [selectedProject, projects]);

    const handleCreateTeam = async () => {
  if (!selectedProject || selectedStudents.length === 0) {
    alert('Please select a project and at least one student!');
    return;
  }

  try {
    const response = await axios.post(
      'http://localhost:5000/api/create-team',
      {
        proj_id: selectedProject,
        members: selectedStudents,
      },
      { withCredentials: true }
    );

    if (response.data.success) {
      alert('Team created successfully!');
    } else {
      alert('Failed to create team.');
    }
  } catch (error) {
    console.error('Error creating team:', error);
    alert('An error occurred. Please try again.');
  }
};

    const handleStudentSelection = (event) => {
        const studentId = parseInt(event.target.value);
        setSelectedStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    return (
        <div>
            <h2>Create Team</h2>

            <label htmlFor="projectDropdown">Select a Project:</label>
            <select
                id="projectDropdown"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
            >
                <option value="" disabled>Select a project</option>
                {projects.map((project) => (
                    <option key={project.proj_id} value={project.proj_id}>
                        {project.proj_name} ({project.course_num})
                    </option>
                ))}
            </select>

            <label htmlFor="teamName">Team Name:</label>
            <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
            />

            <label htmlFor="studentSelection">Select Students:</label>
                        <div id="studentSelection">
                            {students.map((student) => (
                                <div key={student.stud_id}>
                                    <input
                                        type="checkbox"
                                        id={`student-${student.stud_id}`}
                                        value={student.stud_id}
                                        checked={selectedStudents.includes(student.stud_id)}
                                        onChange={handleStudentSelection}
                                    />
                                    <label htmlFor={`student-${student.stud_id}`}>
                                        {student.first_name} {student.last_name}
                                    </label>
                                </div>
                            ))}
                        </div>

            <button onClick={handleCreateTeam}>Create Team</button>
        </div>
    );
}

export default CreateTeam;
