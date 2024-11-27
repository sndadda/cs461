import React, { useState, useEffect } from 'react';
import './Sidebar.css'
import {
    FaBars,
    FaHouseUser,
    FaRocketchat,
    FaUserAlt
} from "react-icons/fa"
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItem = [
        {
            path: "/studentreport",
            name: "Grade Report",
            icon: <FaHouseUser />
        },
        {
            path: "/survey",
            name: "Surveys",
        },
        {
            path: "/user-profile",
            name: "Profile",
            icon: <FaUserAlt />
        },
    ]

    return (
        <div className="sidebarContainer">
            
        </div>
    );
};

export default Sidebar;