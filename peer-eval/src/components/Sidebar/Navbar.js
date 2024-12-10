import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-links">
                {user?.role === 'student' && (
                    <>
                        <Link to="/studentReport" className="nav-item">Report</Link>
                        <Link to="/studentSurvey" className="nav-item">Survey</Link>
                    </>
                )}
                {user?.role === 'professor' && (
                    <>
                        <Link to="/professorReport" className="nav-item">Report</Link>
                        <Link to="/professorCourses" className="nav-item">Survey Creation</Link>
                        <Link to="/createCourse" className="nav-item">Create Course</Link>
                        <Link to="/createTeam" className="nav-item">Create Team</Link>
                    </>
                )}
            </div>
            <div className="navbar-user">
                <span className="username">{user?.firstName || 'User'}</span>
                <button className="logout-button" onClick={onLogout} title="Logout">
                    <FaSignOutAlt />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
