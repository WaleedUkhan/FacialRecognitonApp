'use client'
import Navbar from '@/components/Navbar'
import AdminSidebar from '@/components/AdminSidebar'
import React, { useEffect } from 'react'
import LeaveRequestApproval from '@/components/LeaveRequestApproval'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LeaveApproveDashboard() {
  const router = useRouter();
  
  useEffect(() => {
   
    const verifyUserToken = async () => {
      try {
        
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


    verifyUserToken();
  }, []);
  return (
    <div>
      <AdminSidebar />
      <Navbar />
      <div className='ml-[20vw] pt-24'>
        <h1 className='text-xl font-bold ml-2 mb-4'>Leave Request Approval</h1>
        <LeaveRequestApproval />
      </div>
    </div>
  )
}

