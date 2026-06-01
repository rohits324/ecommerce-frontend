import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, addToCart, updateItem, removeItem } from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [cart, setCart]       = useState({ items: [], totalAmount: 0, totalItems: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setCart({ items: [], totalAmount: 0, totalItems: 0 }); return }
    try {
      setLoading(true)
      const res = await getCart()
      setCart(res.data.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [isLoggedIn])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = async (productId, quantity = 1) => {
    const res = await addToCart({ productId, quantity })
    setCart(res.data.data)
    return res.data.data
  }

  const updateQty = async (itemId, quantity) => {
    const res = await updateItem(itemId, { productId: 0, quantity })
    setCart(res.data.data)
  }

  const removeCartItem = async (itemId) => {
    const res = await removeItem(itemId)
    setCart(res.data.data)
  }

  const clearLocalCart = () => setCart({ items: [], totalAmount: 0, totalItems: 0 })

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItem, updateQty, removeCartItem, clearLocalCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
