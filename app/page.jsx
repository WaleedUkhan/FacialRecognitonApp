"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { QrCode, Users, Clock, Shield } from 'lucide-react';


export default function Home() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prevCount => (prevCount < 100 ? prevCount + 1 : 100));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-600 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 mx-40 my-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
               Attendance Made Simple
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Streamline your attendance tracking with our QR code-based solution. Fast, reliable, and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">

             <Link 
                href="/auth/signUp" 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                  Get Started
              </Link>
              
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <QrCode size={100} className="text-blue-400" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="text-blue-400 font-bold text-4xl">{count}%</div>
                <div className="text-sm text-gray-400">Faster Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose <span className="text-blue-400">OAMS</span>?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition duration-300">
              <div className="flex justify-center mb-4">
                <QrCode size={48} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">QR Scanning</h3>
              <p className="text-gray-300 text-center">Quick and reliable scanning technology for hassle-free attendance.</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition duration-300">
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">User Management</h3>
              <p className="text-gray-300 text-center">Easily manage students Attendance in  one platform.</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition duration-300">
              <div className="flex justify-center mb-4">
                <Clock size={48} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Real-time Tracking</h3>
              <p className="text-gray-300 text-center">Monitor attendance in real-time with instant reporting.</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition duration-300">
              <div className="flex justify-center mb-4">
                <Shield size={48} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Secure Data</h3>
              <p className="text-gray-300 text-center">Advanced security measures to protect your attendance data.</p>
            </div>
          </div>
        </div>
      </div>
      
      
      
      {/* Footer */}
      <footer className="bg-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-white">
            &copy; {new Date().getFullYear()} OAMS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}