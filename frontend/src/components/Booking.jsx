import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Booking() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to equipment booking since general booking is not implemented
    navigate('/EquipmentBooking');
  }, [navigate]);
  
  return (
    <>
      <div className="flex h-vh bg-[url('./images/HomePage.jpg')] bg-cover bg-no-repeat bg-fixed">
        <div className="flex-1">
          <div className="sticky top-0">
            <Navbar />
          </div>
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <p className="tracking-widest text-gray-500 md:text-lg dark:text-black">
                Redirecting to Equipment Booking...
              </p>
            </div>
          </div>
          <br></br>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

export default Booking;