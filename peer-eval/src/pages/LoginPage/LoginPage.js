import React, { useState } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../images/dragon3.png';

function LoginPage() {
    const [loginFormActive, setLoginFormActive] = useState(false);

    const toggleLoginForm = () => {
        setLoginFormActive(true);
    }

    const goBack = () => {
        setLoginFormActive(false);
    }

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSignUp = () => {
        navigate("/signup")
    }
    return (

        <div className="loginContainer">
            <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"></link>

            <div className="title">CCI Feedback</div>
            <img src={logo} alt="logo" className="logo" />
            <div className="button-group" id="button-group">
                <a className={`button signup ${loginFormActive ? 'hidden' : ''}`}
                    onClick={onSignUp}
                >
                    Sign up
                </a>
                <a
                    className={`button login ${loginFormActive ? 'hidden' : ''}`}
                    id="initialLogin"
                    onClick={toggleLoginForm}
                >
                    Login
                </a>
            </div>
        </div>
    )
}

export default LoginPage;