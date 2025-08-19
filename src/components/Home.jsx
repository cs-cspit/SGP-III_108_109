import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import DataPhoto from "../images/Sony3.jpeg"

function Home() {
  // console.log(props.name);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <>
      <div className="flex h-vh bg-[url('./images/SonyBackground.jpg')] bg-cover bg-no-repeat bg-fixed">
        
        <div className="flex-1">
          <div className="sticky top-0">
            <Navbar />
          </div>
          <div className="flex justify-center">
            <p className="tracking-widest text-gray-500 md:text-lg dark:text-gray-400">
              This is a Website of PVF
            </p>
          </div>
          <div class="mx-auto mt-25 max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
              <div class="md:flex">
                <div class="md:shrink-0">
                  <img
                    class="h-48 w-full object-cover md:h-full md:w-48"
                    src={DataPhoto}
                    alt="Modern building architecture"
                  />
                  
                </div>

              </div>
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

export default Home;
