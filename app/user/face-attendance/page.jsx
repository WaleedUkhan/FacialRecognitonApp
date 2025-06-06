'use client'
import Navbar from "@/components/Navbar";
import FaceAttendanceLayout from "@/components/FaceAttendanceLayout";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FaceAttendance() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyUserToken = async () => {
      try {
        const response = await fetch('/api/signIn', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + Cookies.get('token'),
          },
        });

        if (!response.ok) {
          console.error('Token verification failed');
          router.push("/auth/signIn");
          return;
        }

        const data = await response.json();
        if (data.error) {
          throw data.error;
        }
        
        if (data.role !== 'student') {
          router.push("/auth/signIn");
          return;
        }

        setUser(data);
      } catch (err) {
        console.error('An error occurred:', err.message);
        router.push("/auth/signIn");
      }
    };

    verifyUserToken();
  }, [router]);

  return (
    <div className='overflow-x-hidden'>
      <Navbar />
      <div className="lg:pl-[20vw] lg:pr-10 pt-28 lg:w-full mx-auto">
        {user && <FaceAttendanceLayout />}
      </div>
    </div>
  );
} 