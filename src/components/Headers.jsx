import React, { useEffect } from 'react'
import { testSecureFunction } from '../function/test-Secure-Function';
function Header() {

//  const baseUrl = import.meta.env.VITE_BASE_URL;
// const baseUrl = import.meta.env.VITE_LOCAL_URL;

//  const testSecureFunction = async () => {
//   const url = `${baseUrl}/testSecureFunction`;
  
//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email: "test@example.com",
//       role: "admin",
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   const text = await response.text();
//   console.log("text", text);
  
// };


//   useEffect(()=>{
//     testSecureFunction()
//   },[])

  return (
        <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[80px] py-3">
            <div className="flex items-center space-x-4 md:space-x-6">
              <img 
                src="/attached_assets/CDC Logo_1753482679929.png"
                alt="CDC Logo" 
                className="h-12 md:h-16 w-auto flex-shrink-0" 
              />
              <div className="text-center">
                <div className="hidden md:block">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                    CDC Home Inspections
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    by Darrell Penn
                  </div>
                </div>
                <div className="md:hidden">
                  <div className="text-base font-bold text-gray-900 leading-tight">
                    CDC Home Inspections
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    by Darrell Penn
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      </>
  )
}

export default Header