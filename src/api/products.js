import api from './axios'

export const getProducts  = (params) => api.get('/products', { params })
export const getProduct   = (id)     => api.get(`/products/${id}`)
export const createProduct= (data)   => api.post('/products', data)
export const updateProduct= (id, d)  => api.put(`/products/${id}`, d)
export const deleteProduct= (id)     => api.delete(`/products/${id}`)
export const getCategories= ()       => api.get('/categories')
export const createCategory=(data)   => api.post('/categories', data)
export const updateCategory=(id, d)  => api.put(`/categories/${id}`, d)
export const deleteCategory=(id)     => api.delete(`/categories/${id}`)
