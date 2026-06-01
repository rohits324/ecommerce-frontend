import api from './axios'

export const getOrders       = (params) => api.get('/orders', { params })
export const getAllOrders     = (params) => api.get('/orders/all', { params })
export const getOrder        = (id)     => api.get(`/orders/${id}`)
export const placeOrder      = (data)   => api.post('/orders', data)
export const cancelOrder     = (id)     => api.put(`/orders/${id}/cancel`)
export const updateOrderStatus=(id, d)  => api.put(`/orders/${id}/status`, d)
