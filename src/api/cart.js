import api from './axios'

export const getCart    = ()           => api.get('/cart')
export const addToCart  = (data)       => api.post('/cart/items', data)
export const updateItem = (id, data)   => api.put(`/cart/items/${id}`, data)
export const removeItem = (id)         => api.delete(`/cart/items/${id}`)
