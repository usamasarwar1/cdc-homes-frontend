import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/Button";

function Header({ isOpen, setIsOpen }) {
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
            <div className="hidden md:block">
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#FF0000] text-white font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-[#FF0000]/80 transition-all duration-300"
              >
                Submit Request
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
