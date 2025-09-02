import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import DataPhoto from "../images/Sony3.jpeg"

function Home() {
  // console.log(props.name);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <>
      <div className="flex h-vh bg-[url('./images/HomePage.jpg')] bg-cover bg-no-repeat bg-fixed">
        
        <div className="flex-1">
          <div className="sticky top-0">
            <Navbar />
          </div>
          {/* <div className="flex justify-center">
            <p className="tracking-widest text-gray-500 md:text-lg dark:text-gray-400">
              This is a Website of PVF
            </p>
          </div> */}
             <div>
  
  <div class="max-w-7xl mx-auto relative">
    <div class="relative py-16 flex justify-center px-4 sm:px-0">
      <div class="max-w-3xl text-center">
        <div class="pb-4">
          <span class="inline-flex items-center rounded-2xl bg-lime-100 px-4 py-1.5 text-xs sm:text-sm font-serif font-medium text-black">Capture Your Happiness With One Click!</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-semibold text-gray-900 xl:text-6xl font-serif !leading-tight">
          Explore the Colorful Memories of Yours with us
        </h1>
        {/* <p class="mt-4 text-lg sm:text-xl leading-8 text-gray-800 sm:px-16" style="white-space: pre-line;">Empower your classroom with cutting-edge AI technology. Whether it's lesson planning or creating interactive learning materials, our AI service has got you covered.</p> */}
        <div class="mt-8 flex w-full space-x-8 justify-center"><a
            href="/exercises"><button class="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none ring-2 ring-offset-2 ring-transparent ring-offset-transparent disabled:bg-gray-400 appearance-none text-white bg-lime-600 hover:bg-lime-700 focus:ring-lime-500 focus:ring-offset-white !px-12 !shadow-lg !rounded-full !text-base"><p>Explore Memories</p></button></a>
        </div>
      </div>
    </div>
  </div>
</div>  
          {/* <div class="mx-auto mt-25 max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
              <div class="md:flex">
                <div class="md:shrink-0">
                  <img
                    class="h-48 w-full object-cover md:h-full md:w-48"
                    src={DataPhoto}
                    alt="Modern building architecture"
                  />
                  
                </div>

              </div>
            </div> */}
            
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
