import api from './axios'

export const getAddresses  = ()       => api.get('/addresses')
export const addAddress    = (data)   => api.post('/addresses', data)
export const updateAddress = (id, d)  => api.put(`/addresses/${id}`, d)
export const deleteAddress = (id)     => api.delete(`/addresses/${id}`)
