import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css'; 
import { FaSignOutAlt } from 'react-icons/fa'; 

const Navbar = ({ onLogout }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')); 

    const handleLogout = () => {
        localStorage.removeItem('user'); 
        onLogout(); 
        navigate('/'); 
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-user">
                    <span className="username">{user?.firstName || "User"}</span>
                    <button className="logout-button" onClick={handleLogout} title="Logout">
                        <FaSignOutAlt />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
