import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage.js';
import SignUp from './pages/SignUpPage/SignUpPage.js';
import StudentReport from './pages/StudentReport/StudentReportPage.js';
import ProfessorReport from './pages/ProfessorGradeReport/ProfessorReportPage.js';
import ProtectedRoute from './PrivateRoute.js';
import ProfessorCourses from './pages/ProfessorCourses/ProfessorCoursesPage.js';
import Navbar from './components/Sidebar/Navbar.js';
import StudentSurvey from './pages/StudentSurvey/StudentSurveyPage.js';
import CreateCourse from './pages/CreateCourse/CreateCoursePage.js';
import CreateTeam from './pages/CreateTeam/CreateTeamPage.js';
import CreateProject from './pages/CreateProject/CreateProjectPage.js';

export const AppRoutes = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser)); 
        }
        setLoading(false); 
    }, []);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <Router>
            {user && <Navbar user={user} onLogout={handleLogout} />}
            <Routes>
                {!user && (
                <>
                    <Route path="/" element={<LoginPage setUser={setUser} />} />
                    <Route path="/signup" element={<SignUp setUser={setUser} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </>
                )}
                {user && (
                <>
                    <Route
                        path="/studentReport"
                        element={
                            <ProtectedRoute
                                component={StudentReport}
                                allowedRoles={['student']}
                                user={user}
                            />
                        }
                    />
                    <Route
                        path="/studentSurvey"
                        element={
                            <ProtectedRoute
                                component={StudentSurvey}
                                allowedRoles={['student']}
                                user={user}
                            />
                        }
                    />
                    <Route
                        path="/professorCourses"
                        element={
                            <ProtectedRoute
                                component={ProfessorCourses}
                                allowedRoles={['professor']}
                                user={user}
                            />
                        }
                    />
                    <Route
                        path="/professorReport"
                        element={
                            <ProtectedRoute
                                component={ProfessorReport}
                                allowedRoles={['professor']}
                                user={user}
                            />
                        }
                    />
                    <Route
                        path="/createProject"
                        element={
                            <ProtectedRoute
                                component={CreateProject}
                                allowedRoles={['professor']}
                                user={user}
                            />
                        }
                    />
                    <Route
                        path="/createCourse"
                        element={
                            <ProtectedRoute
                                component={CreateCourse}
                                allowedRoles={['professor']}
                                user={user}
                            />
                        }
                    />
                    <Route
                        path="/createTeam"
                        element={
                            <ProtectedRoute
                                component={CreateTeam}
                                allowedRoles={['professor']}
                                user={user}
                            />
                        }
                    />
                    <Route
                        path="*"
                        element={<Navigate to={user.role === 'student' ? '/studentReport' : '/professorReport'} />}
                    />
                </>
            )}
            </Routes>
        </Router>
    );
};
