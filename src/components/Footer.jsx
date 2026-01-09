import React from 'react';
import { Phone, Mail, Clock } from "lucide-react";


export default function Footer() {
    return (
         <footer className="bg-gray-900 text-white py-2 mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">CDC Inspections</h4>
              <p className="text-gray-400 text-base">Professional property inspection services you can trust.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-base text-gray-400">
                <li><a href="#" className="hover:text-white">Standard Inspection</a></li>
                <li><a href="#pool-spa" className="hover:text-white" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pool-spa')?.scrollIntoView({ behavior: 'smooth' });
                }}>Pool/Spa Inspection</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-base text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href="tel:+18002984250" className="hover:text-red-600 transition-colors">
                    (800) 298-4250
                  </a>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:cdchomeinspections@gmail.com" className="hover:text-red-600 transition-colors">
                    cdchomeinspections@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Mon-Fri 8AM-6PM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-base text-gray-400 text-center">
            <p>&copy; 2025 CDC Home Inspections by Darrell Penn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
}