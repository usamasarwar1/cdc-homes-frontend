import { useState } from 'react'
import { SidebarTrigger } from './ui/sidebar'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
const Headers2 = () => {

const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(false);

    const handleLogOut = async () => {
        try{
            setIsLoading(true);
            sessionStorage.removeItem("userData");  
            sessionStorage.removeItem("confirmedProperty");
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out", error);
        }finally{
            setIsLoading(false);
            navigate("/");
        }
        
    }
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-20">
                    <div className="flex items-center space-x-6 w-full">
                        <div className="md:hidden flex-shrink-0">
                            <SidebarTrigger 
                                className="mr-2"
                                aria-label="Toggle navigation menu"
                            />
                        </div>

                        <div className="flex items-center space-x-6 flex-1 justify-center md:justify-start">
                            <img 
                                src="/attached_assets/CDC Logo_1753482679929.png" 
                                alt="CDC Logo" 
                                className="h-12 w-auto" 
                            />
                            <div className="text-center md:text-left">
                                <div className="hidden md:block">
                                    <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                        CDC Home Inspections
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Protecting Arizona Homeowners Since 2013
                                    </div>
                                </div>
                                <div className="md:hidden">
                                    <div className="text-xl font-bold text-gray-900">
                                        CDC Home Inspections
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div 
                        onClick={handleLogOut}
                        className="bg-red-600 disabled:opacity-50 cursor-pointer hover:bg-red-700 text-white px-4 py-1 rounded-sm font-semibold transition-colors"
                         >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Out"}
                      </div>
                    </div>
                    
                </div>
            </div>
        </header>
    )
}

export default Headers2