import { Type } from 'lucide-react';
import React, { createContext, useContext, useReducer, useState } from 'react'
import { IoEllipseSharp } from 'react-icons/io5';



const myContext = createContext();

export const useMyContext = () =>{
    return useContext(myContext);
}
function CartContext({children}) {
  
  const [cart,setCart] = useState([]);
  const [fav,setFav] = useState([]);
  const [quantity,setQuantity] = useState(1);
  const [rec,setRec] = useState([]);
  
  const increase = (id) =>{
    console.log(id);
    
    setCart((data) => data.map((item) => item.id === id && item.count != 10 ?{...item,count:item.count+1}: item));
  }

  const decrease = (id) =>{
    setCart((data) => data.map((item) => item.id === id && item.count != 1?{...item,count:item.count-1}: item))
  }
  
  const cobj = {
    cart,
    setCart,
    fav,
    setFav,
    rec,
    setRec,
    increase,
    decrease,
    
  };
    return <myContext.Provider value={cobj}>{children}</myContext.Provider>
}

export default CartContext