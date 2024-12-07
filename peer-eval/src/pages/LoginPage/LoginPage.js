import React, { useState } from 'react';
import './LoginPage.css';
import logo from '../../images/dragon3.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setUser }) {
    const [loginFormActive, setLoginFormActive] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const toggleLoginForm = () => {
        setLoginFormActive(true);
    };

    const goBack = () => {
        setLoginFormActive(false);
        setErrorMessage('');
    };

    const onSignUp = () => {
        navigate('/signup');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post(
                'http://localhost:5000/api/login',
                { email, password },
                { withCredentials: true }
            );
    
            if (response.data.success) {
                const user = response.data.user;
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user); // Update user state
                navigate(user.role === 'student' ? '/studentReport' : '/professorReport');
            } else {
                setErrorMessage(response.data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    };
    

    return (
        <div className="loginContainer">
            <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"></link>
            <div className="title">CCI Feedback</div>
            <img src={logo} alt="logo" className="logo" />
            {!loginFormActive ? (
                <div className="button-group" id="button-group">
                    <button className="button signup" onClick={onSignUp}>Sign up</button>
                    <button className="button login" id="initialLogin" onClick={toggleLoginForm}>Login</button>
                </div>
            ) : (
                <div className="loginForm">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className="loginbutton">Log In</button>
                        {errorMessage && <p className="error">{errorMessage}</p>}
                    </form>
                    <button className="backIcon" onClick={goBack}>&lt;</button>
                </div>
            )}
        </div>
    );
}

export default LoginPage;
