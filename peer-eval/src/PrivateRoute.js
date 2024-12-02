import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, allowedRoles, user }) => {
    if (!user) {
        // If no user, redirect to login
        return <Navigate to="/" />;
    }

    if (!allowedRoles.includes(user.role)) {
        // If user role is not allowed, redirect
        return <Navigate to="/" />;
    }

    return <Component />;  // Render the component if allowed
};

export default ProtectedRoute;
