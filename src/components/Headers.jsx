import React from 'react'
import { Button } from './ui/Button';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Header({setIsModalOpen, userData, setModalType, isAuthenticated, setIsAuthenticated}) {



const handleLogOut = async () => {
  try {
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("confirmedProperty");
    await signOut(auth);
    setIsAuthenticated(false);
    
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

const handleLogIn = () => {
  setIsModalOpen(true);
  setModalType('login');
}


  return (
        <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[80px] py-3">
            <div className="flex items-center justify-start space-x-4 md:space-x-6">
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
                {isAuthenticated && userData ? (
                <Button
                onClick={handleLogOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-sm font-semibold transition-colors"
                 >
                Log Out
              </Button>
              ) : (
                <Button onClick={handleLogIn} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-sm font-semibold transition-colors">
                  Log In
                </Button>
              )}
          </div>
            
        </div>
      </header>
      </>
  )
}

export default Header