'use client'
import Navbar from '@/components/Navbar'
import AdminSidebar from '@/components/AdminSidebar'
import React, { useEffect } from 'react'
import AdminViewRecords from '@/components/AdminViewRecords'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AttendanceReportsPage() {
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
      <AdminSidebar/>
      <Navbar/>
      <div className="pl-[20vw] pr-10 pt-24 w-full mx-auto">
        <h1 className='text-xl font-bold ml-2 mb-4'>Attendance Reports</h1>
        <AdminViewRecords/>
      </div>
    </div>
  )
}