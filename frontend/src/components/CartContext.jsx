import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const myContext = createContext();

export const useMyContext = () => {
    return useContext(myContext);
}

function CartContext({ children }) {
    // Initialize state from localStorage for both cart and favorites
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('PVFstudio_cart');
            const parsedCart = savedCart ? JSON.parse(savedCart) : [];
            // Ensure all cart items have consistent ID structure
            const normalizedCart = parsedCart.map(item => ({
                ...item,
                id: item.id || item._id, // Normalize ID field
                count: item.count || 1
            }));
            return normalizedCart;
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });
    
    // Favorites managed via localStorage
    const [fav, setFav] = useState(() => {
        try {
            const savedFav = localStorage.getItem('PVFstudio_favorites');
            return savedFav ? JSON.parse(savedFav) : [];
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
            return [];
        }
    });
    const [favLoading, setFavLoading] = useState(false);
    
    const [quantity, setQuantity] = useState(1);
    const [rec, setRec] = useState([]);
    
    // Save to localStorage whenever cart or favorites change
    useEffect(() => {
        try {
            localStorage.setItem('PVFstudio_cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart]);
    
    useEffect(() => {
        try {
            localStorage.setItem('PVFstudio_favorites', JSON.stringify(fav));
        } catch (error) {
            console.error('Error saving favorites to localStorage:', error);
        }
    }, [fav]);
    
    // Load favorites from localStorage (already handled in useState initializer)
    const loadFavoritesFromStorage = () => {
        try {
            const savedFav = localStorage.getItem('PVFstudio_favorites');
            const favorites = savedFav ? JSON.parse(savedFav) : [];
            setFav(favorites);
            return favorites;
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
            setFav([]);
            return [];
        }
    };
    
    // Cart functions
    const increase = (id) => {
        setCart((data) => 
            data.map((item) => 
                item.id === id && item.count < 10 
                    ? { ...item, count: item.count + 1 } 
                    : item
            )
        );
    };

    const decrease = (id) => {
        setCart((data) => 
            data.map((item) => 
                item.id === id && item.count > 1 
                    ? { ...item, count: item.count - 1 } 
                    : item
            )
        );
    };
    
    // Favorites functions - localStorage based
    const addToFavorites = (item) => {
        try {
            // Check if already in favorites
            const exists = fav.some(favItem => favItem.id === item._id);
            if (exists) {
                return false; // Already exists
            }
            
            const newFavorite = {
                id: item._id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                rating: item.rating,
                dateAdded: new Date().toISOString()
            };
            
            setFav(prev => [...prev, newFavorite]);
            return true; // Added successfully
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    };
    
    const removeFromFavorites = (itemId) => {
        try {
            setFav(prev => prev.filter(item => item.id !== itemId));
            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    };
    
    const isFavorite = (itemId) => {
        return fav.some(item => item.id === itemId);
    };
    
    const toggleFavorite = (item) => {
        try {
            const exists = fav.some(favItem => favItem.id === item._id);
            
            if (exists) {
                // Remove from favorites
                setFav(prev => prev.filter(favItem => favItem.id !== item._id));
                return false; // Removed
            } else {
                // Add to favorites
                const newFavorite = {
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    image_url: item.image_url,
                    rating: item.rating,
                    dateAdded: new Date().toISOString()
                };
                setFav(prev => [...prev, newFavorite]);
                return true; // Added
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return null;
        }
    };
    
    // Clear functions
    const clearCart = () => {
        setCart([]);
        // Also clear localStorage to ensure consistency
        localStorage.removeItem('PVFstudio_cart');
    };
    
    const clearFavorites = () => {
        try {
            setFav([]);
            return true;
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return false;
        }
    };
    
    // Get cart total
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.count), 0);
    };
    
    // Get cart item count
    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.count, 0);
    };
    
    const cobj = {
        // State
        cart,
        setCart,
        fav,
        setFav,
        favLoading,
        rec,
        setRec,
        quantity,
        setQuantity,
        
        // Cart functions
        increase,
        decrease,
        clearCart,
        getCartTotal,
        getCartItemCount,
        
        // Favorites functions - localStorage based
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        clearFavorites,
        loadFavoritesFromStorage
    };
    
    return (
        <myContext.Provider value={cobj}>
            {children}
        </myContext.Provider>
    );
}

export default CartContext;