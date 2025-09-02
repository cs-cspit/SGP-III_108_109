import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import Protected from './components/Protected'
import Home from './components/Home'
import Product from './components/Product'
import ShoppingCart from './components/ShoppingCart'
import Favorite from './components/Favorite'
import Booking from './components/Booking'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SignUp />}  />
          <Route path='/Login' element={<SignIn />} />
          {/* <Route path="/Home" element={<Protected Pro={Home}/>} /> */}
          <Route path='/Home' element={<Protected Pro={Home}/>} />
          <Route path='/Products' element={<Protected Pro={Product}/>} />
          <Route path='/Cart' element={<Protected Pro={ShoppingCart}/>} />
          <Route path='/Favorite' element={<Protected Pro={Favorite}/>} />
          <Route path='/BookDay' element={<Protected Pro={Booking}/>}  />
          {/* <Route path='/Products' element={<Protected Pro={Product}/>} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
