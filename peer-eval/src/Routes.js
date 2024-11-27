import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import SignUp from './pages/SignUpPage/SignUpPage';
import Sidebar from './components/Sidebar/Sidebar';
import axios from 'axios';

export const AppRoutes = () => {
    const [userData, setUserData] = useState(null);
    const [loadingUserData, setLoadingUserData] = useState(true);

    useEffect(() => {

    })

    return (
        <div>
            <Router>
   
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUp />} />
                    </Routes>

            </Router>
        </div>
    )
}