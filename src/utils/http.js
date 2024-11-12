/**
 * Utility functions for making HTTP requests
 */

/**
 * 
 * Throw an error on non 2xx HTTP status codes,
 * to be used in a promise chain
 * 
 * @param {*} response 
 */
export const raiseOnHttpError = response => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    let error = new Error(response.statusText)
    error.response = response
    throw error
  }
}