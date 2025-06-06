'use client'
import Navbar from '@/components/Navbar'
import AdminSidebar from '@/components/AdminSidebar'
import React, { useEffect, useState } from 'react'
import PendingConfirmations from '@/components/PendingConfirmations'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Dashboard() {
  const router = useRouter();
  
  useEffect(() => {
    // Function to fetch and verify the token
    const verifyUserToken = async () => {
      try {
        // Fetch request to verify the token, URL ka khas khiyal rakhna. 
        const response = await fetch('/api/signIn', {
          method: 'GET',
          headers:{
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + Cookies.get('token'),
          }, 
        });
        if (!response.ok) {
          console.error('Token verification failed');
          router.push("/auth/signIn")
        }

        const data = await response.json();
        if(data.role === 'student')
          router.push("/auth/signIn");
        

        
        if (data.error) {
          throw data.error
        } 

      } catch (err) {
        console.log('An error occurred: ' + err.message);
      }
    };

    // Call the function to verify the token when the component mounts(run hona, chaapna)
    verifyUserToken();
  }, []);

  return (
    <div>
      <AdminSidebar/>
      <Navbar/>
      <div className='ml-[20vw] pt-24'>
        <h1 className='text-xl font-bold ml-2 mb-4'>Attendance Confirmations</h1>
        <PendingConfirmations/>
      </div>
    </div>
  )
}
