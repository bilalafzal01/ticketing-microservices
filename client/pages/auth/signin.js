import { useState } from 'react'
import Router from 'next/router'

import useRequest from '../../hooks/use-request'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { errors, doRequest } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push(`/`),
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    await doRequest()
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label htmlFor="signin-email">Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="signin-email"
          type="email"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="signin-password">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="signin-password"
          type="password"
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign in</button>
    </form>
  )
}

export default SignIn
