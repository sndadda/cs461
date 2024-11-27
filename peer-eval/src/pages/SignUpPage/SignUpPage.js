import React, { useState } from 'react';
import './SignUpPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    
    const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password
    };


    return (
        <div className="signUpContainer">
            <h2> Sign Up</h2>

        </div>
    )
}
export default SignUp;