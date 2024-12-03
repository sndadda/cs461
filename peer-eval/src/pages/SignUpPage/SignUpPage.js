import React, { useState } from 'react';
import './SignUpPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = ({ setUser }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student',
    });

    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const signupResponse = await axios.post('http://localhost:5000/api/signup', formData);
            if (signupResponse.data.success) {
                const user = signupResponse.data.user; 

                localStorage.setItem('user', JSON.stringify(user)); 
                setUser(user); // set user state immediately to make them logged in


                if (user.role === 'student') {
                    navigate('/studentReport'); 
                } else if (user.role === 'professor') {
                    navigate('/professorReport'); 
                }
            } else {
                setErrorMessage(signupResponse.data.message || 'Signup failed.');
            }
        } catch (err) {
            console.error('Error during signup:', err);
            setErrorMessage("Error during signup. Please try again.");
        }
    };

    return (
        <div className="signUpContainer">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    First Name:
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Last Name:
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Role:
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="student">Student</option>
                        <option value="professor">Professor</option>
                    </select>
                </label>
                <button type="submit">Sign Up</button>
            </form>
            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
    );
};

export default SignUp;
