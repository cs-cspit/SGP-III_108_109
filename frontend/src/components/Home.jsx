import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Camera, Star, Users, Award, Play, ArrowRight, Sparkles } from "lucide-react";
import DataPhoto from "../images/Sony3.jpeg";

function Home() {
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              {/* Badge */}
              <div className="inline-flex items-center bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2 text-gray-600" />
                Capture Your Happiness With One Click!
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Explore the 
                <span className="text-gray-600"> Colorful Memories</span>
                <br />of Yours with us
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Professional photography services that capture life's most precious moments. 
                From portraits to events, we create stunning visuals that tell your unique story.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => navigate('/Portfolio')}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Explore Memories
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                
                <button 
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center shadow-sm hover:shadow-md"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Our Work
                </button>
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-2 transform hover:scale-105 transition-transform duration-500">
                <img
                  src={DataPhoto}
                  alt="Professional Photography"
                  className="w-full h-96 object-cover rounded-2xl"
                />
              </div>
              
              {/* Floating stats */}
              <div className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  <div>
                    <div className="font-bold text-gray-900">5.0</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-gray-600 mr-2" />
                  <div>
                    <div className="font-bold text-gray-900">1000+</div>
                    <div className="text-sm text-gray-600">Happy Clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Services Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Our Professional Services
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From intimate portraits to grand celebrations, we bring your vision to life
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Camera className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Portrait Photography</h3>
                <p className="text-gray-600 mb-6">
                  Professional headshots and personal portraits that capture your unique personality and style.
                </p>
                <div className="text-sm text-gray-500 font-medium">Starting from ₹2,000</div>
              </div>
              
              {/* Service 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Photography</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive event coverage including weddings, corporate events, and special celebrations.
                </p>
                <div className="text-sm text-gray-500 font-medium">Starting from ₹8,000</div>
              </div>
              
              {/* Service 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Commercial Shoots</h3>
                <p className="text-gray-600 mb-6">
                  Professional product photography and corporate branding shoots for businesses.
                </p>
                <div className="text-sm text-gray-500 font-medium">Starting from ₹12,000</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">1000+</div>
                  <div className="text-gray-600 font-medium">Happy Clients</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">5000+</div>
                  <div className="text-gray-600 font-medium">Photos Captured</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                  <div className="text-gray-600 font-medium">Events Covered</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">5.0</div>
                  <div className="text-gray-600 font-medium">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Capture Your Perfect Moment?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Let's work together to create stunning photographs that you'll treasure forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/EventBooking')}
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Book a Session
              </button>
              <button 
                onClick={() => navigate('/Portfolio')}
                className="bg-transparent hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border-2 border-white">
                View Portfolio
              </button>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
}

export default Home;
