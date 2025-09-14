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
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import EquipmentManagement from './components/admin/EquipmentManagement'
import SubscriptionPlansManagement from './components/admin/SubscriptionPlansManagement'
import CustomerManagement from './components/admin/CustomerManagement'
import PaymentManagement from './components/admin/PaymentManagement'
import UserDashboard from './components/UserDashboard'
import PortfolioGallery from './components/PortfolioGallery'
import UserSubscriptions from './components/UserSubscriptions'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SignUp />}  />
          <Route path='/Login' element={<SignIn />} />
          {/* Customer Routes */}
          <Route path='/Home' element={<Protected Pro={Home}/>} />
          <Route path='/Rent' element={<Protected Pro={Product}/>} />
          <Route path='/Cart' element={<Protected Pro={ShoppingCart}/>} />
          <Route path='/Favorite' element={<Protected Pro={Favorite}/>} />
          <Route path='/BookDay' element={<Protected Pro={Booking}/>}  />
          <Route path='/Subscriptions' element={<Protected Pro={UserSubscriptions}/>}  />
          <Route path='/Dashboard' element={<Protected Pro={UserDashboard}/>}  />
          <Route path='/Portfolio' element={<PortfolioGallery />}  />
          
          {/* Admin Routes */}
          <Route path='/admin' element={<Protected Pro={AdminLayout}/>}>
            <Route index element={<AdminDashboard />} />
            <Route path='equipment' element={<EquipmentManagement />} />
            <Route path='subscriptions' element={<SubscriptionPlansManagement />} />
            <Route path='customers' element={<CustomerManagement />} />
            <Route path='payments' element={<PaymentManagement />} />
            {/* Add more admin routes here as we create components */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
