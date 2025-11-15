import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import Protected from './components/Protected'
import AdminProtected from './components/AdminProtected'
import Home from './components/Home'
import Rent from './components/Rent'
import ShoppingCart from './components/ShoppingCart'
import Checkout from './components/Checkout'
import Favorite from './components/Favorite'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import EquipmentManagement from './components/admin/EquipmentManagement'
import BookingManagement from './components/admin/BookingManagement'
import SubscriptionPlansManagement from './components/admin/SubscriptionPlansManagement'
import CustomerManagement from './components/admin/CustomerManagement'
import PaymentRequestsManagement from './components/admin/PaymentRequestsManagement'
import UserDashboard from './components/UserDashboard'
import PortfolioGallery from './components/PortfolioGallery'
import UserSubscriptions from './components/UserSubscriptions'
import EquipmentBooking from './components/EquipmentBooking'
import EventBooking from './components/EventBooking'
import MyPaymentRequests from './components/MyPaymentRequests'
import MyRequests from './components/MyRequests'
import MyBookings from './components/MyBookings'
import AllRequestsManagement from './components/admin/AllRequestsManagement'
import PortfolioManagement from './components/admin/PortfolioManagement'
import ReportsManagement from './components/admin/ReportsManagement'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SignUp />}  />
          <Route path='/Login' element={<SignIn />} />
          {/* Customer Routes */}
          <Route path='/Home' element={<Protected Pro={Home}/>} />
          <Route path='/Rent' element={<Protected Pro={Rent}/>} />
          <Route path='/Cart' element={<Protected Pro={ShoppingCart}/>} />
          <Route path='/Checkout' element={<Protected Pro={Checkout}/>} />
          <Route path='/Favorite' element={<Protected Pro={Favorite}/>} />
          <Route path='/EquipmentBooking' element={<Protected Pro={EquipmentBooking}/>} />
          <Route path='/EventBooking' element={<Protected Pro={EventBooking}/>} />
          <Route path='/Packages' element={<Protected Pro={UserSubscriptions}/>}  />
          <Route path='/Dashboard' element={<Protected Pro={UserDashboard}/>}  />
          <Route path='/Portfolio' element={<PortfolioGallery />}  />
          <Route path='/PaymentRequests' element={<Protected Pro={MyPaymentRequests}/>}  />
          <Route path='/MyRequests' element={<Protected Pro={MyRequests}/>}  />
          <Route path='/MyBookings' element={<Protected Pro={MyBookings}/>}  />
          
          {/* Admin Routes - Protected with AdminProtected */}
          <Route path='/admin' element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path='equipment' element={<EquipmentManagement />} />
            <Route path='bookings' element={<BookingManagement />} />
            <Route path='customers' element={<CustomerManagement />} />
            <Route path='subscriptions' element={<SubscriptionPlansManagement />} />
            <Route path='payment-requests' element={<PaymentRequestsManagement />} />
            <Route path='portfolio' element={<PortfolioManagement />} />
            <Route path='all-requests' element={<AllRequestsManagement />} />
            <Route path='reports' element={<ReportsManagement />} />
            {/* Add more admin routes here as we create components */}
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3200}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App