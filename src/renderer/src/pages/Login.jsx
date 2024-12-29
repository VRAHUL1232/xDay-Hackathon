/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify({}));
    }
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const toggleForm = () => {
    setError('');
    setSuccess('');
    setIsLogin(!isLogin);
    setLoginData({ email: '', password: '' });
    setSignupData({ email: '', password: '', confirmPassword: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('email', loginData.email);
      formData.append('password', loginData.password);
      
      const signInResponseTrigger = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type header when using FormData
          'Accept': 'application/json',
        },
      });
      
      if (!signInResponseTrigger.ok) {
        throw new Error('Network response was not ok');
      }
  
      const signInResponse = await signInResponseTrigger.json();
      
      if (signInResponse.status === 'Failed') {
        setError(signInResponse.error);
        return;
      }
  
      // Store the JWT token in localStorage
      localStorage.setItem('token', signInResponse.token);
      
      // Store user info
      const userData = {
        id: signInResponse.id,
        email: signInResponse.email
      };
      localStorage.setItem('users', JSON.stringify(userData));
      
      setError('');
      setSuccess('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    }
  };
  
  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('email', signupData.email);
      formData.append('password', signupData.password);
      formData.append('confirm', signupData.confirmPassword);
      
      const signUpResponseTrigger = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type header when using FormData
          'Accept': 'application/json',
        },
      });
      
      if (!signUpResponseTrigger.ok) {
        throw new Error('Network response was not ok');
      }
  
      const signUpResponse = await signUpResponseTrigger.json();
  
      if (signUpResponse.status === 'Failed') {
        setError(signUpResponse.error);
        return;
      }
  
      // Store the JWT token in localStorage
      localStorage.setItem('token', signUpResponse.token);
      
      // Store user info
      const userData = {
        id: signUpResponse.id,
        email: signUpResponse.email
      };
      localStorage.setItem('users', JSON.stringify(userData));
      
      setError('');
      setSuccess('Account created successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      setError('An error occurred during registration. Please try again.');
      console.error('Registration error:', error);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-sky-500">HADAP</h1>
        <p className="text-center text-gray-600 mt-2">
          {isLogin ? 'Login to access your dashboard' : 'Sign up to get started'}
        </p>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="mt-6">
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={isLogin ? loginData.email : signupData.email}
              onChange={(e) =>
                isLogin
                  ? setLoginData({ ...loginData, email: e.target.value })
                  : setSignupData({ ...signupData, email: e.target.value })
              }
              required
              className="w-full mt-1 p-2 border rounded-md focus:border--500 focus:ring focus:ring-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={isLogin ? loginData.password : signupData.password}
              onChange={(e) =>
                isLogin
                  ? setLoginData({ ...loginData, password: e.target.value })
                  : setSignupData({ ...signupData, password: e.target.value })
              }
              required
              className="w-full mt-1 p-2 border rounded-md focus:border-sky-500 focus:ring focus:ring-gray-200"
            />
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                className="w-full mt-1 p-2 border rounded-md focus:border-sky-500 focus:ring focus:ring-gray-200"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && !error && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={toggleForm} className="text-sky-500 hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
