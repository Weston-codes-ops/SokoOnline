/*
 * axios.js — Configured Axios instance for API calls
 *
 * Instead of importing axios directly everywhere and repeating
 * the base URL, we create ONE configured instance here and
 * import it across the app.
 *
 * What this does:
 * - Sets the base URL to our Spring Boot backend
 * - Automatically attaches the JWT token to every request
 *   via a "request interceptor"
 * - If no token exists, the request goes out without one
 *   (public endpoints like /products work without a token)
 */

import axios from 'axios'

const api = axios.create({
  // All requests will be prefixed with this URL
  // e.g. api.get('/products') → GET http://localhost:8080/api/products
  baseURL: 'http://localhost:8080/api',
})

/*
 * Request Interceptor
 * Runs before every request is sent.
 * We read the JWT token from localStorage and attach it
 * to the Authorization header in the Bearer token format.
 *
 * Spring Security reads this header to identify and
 * authenticate the user on the backend.
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api