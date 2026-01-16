import React from 'react'
import { Button } from './ui/Button';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { User, LogOut, LogIn } from 'lucide-react';


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

const handleLogIn = (params) => {
  setIsModalOpen(true);
  setModalType(params);
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
                                   <div className="flex items-center gap-2 text-sm text-gray-600">
                                   {userData?.photoURL ? (
                                     <img 
                                       src={userData.photoURL} 
                                       alt="Profile" 
                                       className="w-8 h-8 rounded-full object-cover"
                                     />
                                   ) : (
                                     <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                       <User className="w-4 h-4 text-red-600" />
                                     </div>
                                   )}
                                   <span className="hidden md:inline font-medium">{userData?.name || 'User'}</span>
                            
               <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogOut}
                    className="hidden md:flex text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Log Out</span>
                  </Button>
                                 </div>
              
              ) : (
            
                <div className="flex items-center gap-2 text-sm text-gray-600">
              <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLogIn('login')}
              className="text-gray-600 hover:text-red-600"
            >
              <LogIn className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Log In</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleLogIn('signup')}
              className="hidden md:flex bg-red-700 hover:bg-red-800 text-white"
            >
              <span className="hidden md:inline">Sign Up</span>
              <span className="md:hidden">Sign Up</span>
            </Button>
            </div>
              )}
          </div>
            
        </div>
      </header>
      </>
  )
}

export default Header