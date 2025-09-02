import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import DataPhoto from "../images/Sony3.jpeg"

function Booking() {
  
  return (
    <>
      <div className="flex h-vh bg-[url('./images/HomePage.jpg')] bg-cover bg-no-repeat bg-fixed">
        
        <div className="flex-1">
          <div className="sticky top-0">
            <Navbar />
          </div>
          <div className="flex justify-center">
            <p className="tracking-widest text-gray-500 md:text-lg dark:text-black">
              Work in Progress
            </p>
          </div>
             
            
          <br></br>
           <div className="flex flex-col min-h-screen">
           <main className="flex-1">
              {/* <h1>Welcome</h1> */}
           </main>
           <Footer />
         </div>
        </div>
      </div>
    </>
  );
}

export default Booking;
