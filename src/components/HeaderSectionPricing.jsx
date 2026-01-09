import React from 'react'
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import cdcLogoPath from '@assets/CDC Logo_1753482679929.png';
import { Button } from '../components/ui/Button';

const HeaderSectionPricing = () => {
  return (
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/">
              <div className="flex items-center space-x-4 cursor-pointer">
                <img src={cdcLogoPath} alt="CDC Logo" className="h-16 w-auto" />
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    CDC Home Inspections
                  </div>
                  <div className="text-sm text-gray-600">
                    Complete Pricing Schedule
                  </div>
                </div>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Button onClick={generatePDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Link href="/">
                <Button variant="default" size="sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
  )
}

export default HeaderSectionPricing