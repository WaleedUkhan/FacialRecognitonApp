'use client'
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/AdminSidebar";
import ManualAttendanceForm from "@/components/ManualAttendanceForm";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ManualAttendance() {
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
    <>
      <Sidebar/>
      <Navbar/>
      <div className="pl-[20vw] pr-10 pt-28 w-full mx-auto">
        <ManualAttendanceForm/>
      </div>
    </>
  );
} 