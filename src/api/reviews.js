import api from './axios'

export const getReviews = (productId, params) => api.get(`/products/${productId}/reviews`, { params })
export const addReview  = (productId, data)   => api.post(`/products/${productId}/reviews`, data)
export const deleteReview=(productId, reviewId)=> api.delete(`/products/${productId}/reviews/${reviewId}`)
