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
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SignUp />}  />
          <Route path='/Login' element={<SignIn />} />
          <Route path="/Home" element={<Protected Pro={Home}/>} />
          {/* <Route path='/Home' element={<Home />} />
          <Route path='/Products' element={<Product />} /> */}
          <Route path='/Products' element={<Protected Pro={Product}/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
