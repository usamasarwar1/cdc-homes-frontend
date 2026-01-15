import React from 'react'
import { Link } from 'react-router-dom'
import { SidebarTrigger } from './sidebar'

/**
 * TopNav Component
 * 
 * Responsive header component that:
 * - Always remains visible on all screen sizes
 * - Includes hamburger menu button on mobile to toggle sidebar
 * - Shows logo and app title
 * - Follows accessibility best practices
 */
const TopNav = () => {

    return (
        <header 
            className="w-full min-h-18 md:h-16 border-b bg-background/95 backdrop-blur-md flex items-center justify-between px-3 md:px-6 py-2 md:py-0 flex-shrink-0 sticky top-0 z-40"
            role="banner"
        >
            <div className="flex items-center gap-2 md:gap-3">
                {/* Hamburger menu button - visible on mobile, hidden on desktop */}
                <div className="md:hidden">
                    <SidebarTrigger 
                        className="mr-1"
                        aria-label="Toggle navigation menu"
                    />
                </div>
                
                {/* <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-lg overflow-hidden flex-shrink-0">
                    <Link 
                        to="/"
                        aria-label="Navigate to home"
                    >
                        <img
                            src="/attached_assets/CDC Logo_1753482679929.png"
                            alt="CDC Logo"
                            className="h-full w-full object-cover"
                            data-testid="img-robot-logo"
                        />
                    </Link>
                </div> */}
                {/* <div>
                    <h1 
                        className="text-base md:text-lg font-semibold" 
                        data-testid="text-app-title"
                    >
                        CDC Home Inspections
                    </h1>
                    <p className="hidden sm:block text-xs text-muted-foreground">
                        by Darrell Penn
                    </p>
                </div> */}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
                <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2">
                    <div className="flex gap-1 md:gap-2 flex-wrap items-center">
                        {/* Additional header actions can be added here */}
                    </div>
                </div>
                {/* New buttons can be added here */}
            </div>
        </header>
    )
}

export default TopNav