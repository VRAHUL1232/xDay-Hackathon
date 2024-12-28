/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { Link } from 'lucide-react'
import React, { useState } from 'react'
import dashboard from './Dashboard'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Initialize localStorage if empty
  React.useEffect(() => {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify({}))
    }
  }, [])

  const toggleForm = () => {
    setError('')
    setSuccess('')
    setIsLogin(!isLogin)
    setLoginData({ email: '', password: '' })
    setSignupData({ email: '', password: '', confirmPassword: '' })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('email', loginData.email)
      formData.append('password', loginData.password)
      const signInResponseTrigger = await fetch('http://192.168.56.1:5002/login', {
        method: 'POST',
        body: formData
      })
      const signInResponse = await signInResponseTrigger.json()
      if (signInResponse['status'] === 'Failed') {
        setError(signInResponse['error'])
        throw new Error(signInResponse['error'])
      }
      console.log('Login details:', signInResponse)
      const users = JSON.parse(localStorage.getItem('users'))
      users['id'] = signInResponse['id']
      users['email'] = signInResponse['email']
      console.log("login cred", users)
      setError('')
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => {
        // Redirect to another page
        navigate('/dashboard')
      }, 500)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      const formData = new FormData()
      formData.append('email', signupData.email)
      formData.append('password', signupData.password)
      formData.append('confirm', signupData.confirmPassword)
      const signUpResponseTrigger = await fetch('http://192.168.56.1:5002/register', {
        method: 'POST',
        body: formData
      })
      const signUpResponse = await signUpResponseTrigger.json()

      console.log('Register details:', signUpResponse)
      if (signUpResponse['status'] === 'Failed') {
        setError(signUpResponse['error'])
        throw new Error(signUpResponse['error'])
      }

      // Store the current id and email in local storage
      const users = JSON.parse(localStorage.getItem('users'))
      users['id'] = signUpResponse['id']
      users['email'] = signUpResponse['email']
      console.log("login cred", users)
      setError('')
      setSuccess('Account created successfully!')
      setTimeout(() => {
        // Redirect to another page
        navigate('/dashboard')
      }, 500)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-purple-600">HADAP</h1>
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
              className="w-full mt-1 p-2 border rounded-md focus:border-purple-600 focus:ring focus:ring-purple-200"
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
              className="w-full mt-1 p-2 border rounded-md focus:border-purple-600 focus:ring focus:ring-purple-200"
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
                className="w-full mt-1 p-2 border rounded-md focus:border-purple-600 focus:ring focus:ring-purple-200"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && !error && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={toggleForm} className="text-purple-600 hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
