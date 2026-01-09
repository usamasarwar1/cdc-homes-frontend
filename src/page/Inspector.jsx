import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Phone, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function InspectorPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/attached_assets/Roof_1753590920217.jpg';
    (link).fetchPriority = 'high';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center space-x-6">
              <img src="/attached_assets/CDC Logo_1753482679929.png" alt="CDC Logo" className="h-16 w-auto" />
              <div className="text-center">
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
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <img
                    src="/attached_assets/Roof_1753590920217.jpg"
                    alt="Darrell Penn Jr. - Your Inspector"
                    className="w-80 mx-auto mb-4 object-cover shadow-lg rounded-lg"
                    loading="eager"
                    decoding="sync"
                    {...({ fetchPriority: "high" })}
                    style={{
                      imageRendering: 'crisp-edges',
                      transform: 'translateZ(0)',
                      willChange: 'auto'
                    }}
                    onLoad={(e) => {
                      const img = e.target;
                      img.style.opacity = '1';
                    }}
                  />
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Darrell Penn Jr.</h2>
                  <p className="text-lg text-gray-600 text-center">Certified Home Inspector</p>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Meet Our Inspector</h3>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Office Number</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-blue-800">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href="tel:+18002984250" className="hover:text-blue-900 transition-colors">
                        (800) 298-4250
                      </a>
                    </div>
                    <div className="flex items-center text-blue-800">
                      <Mail className="w-4 h-4 mr-2" />
                      <a href="mailto:cdchomeinspections@gmail.com" className="hover:text-blue-900 transition-colors">
                        cdchomeinspections@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Licensing and Credentials</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start">• GC KB-1 or KB-2 (ROC 332240)</div>
                      <div className="flex items-start">• HVAC License (ROC 349316)</div>
                      <div className="flex items-start">• Plumbing License (ROC 349089)</div>
                      <div className="flex items-start">• Electrical License (ROC 347444)</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start">• Home Inspector License 63295</div>
                      <div className="flex items-start">• Adjuster License NIPR 17107555</div>
                      <div className="flex items-start">• IICRC 700173848 – WRT/ASD</div>
                      <div className="flex items-start">• Realtor - SA680237000</div>
                    </div>
                  </div>


                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-gray-700 leading-relaxed">
                    I am not perfect, I am human, striving each day to make a meaningful difference. I love God, Jesus, and I genuinely care for people from all walks of life. One scripture that guides me is Habakkuk 2:2 — "Write the vision and make it plain."
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Every inspection I perform is done with love, care, and the same attention I would give if I were inspecting for my own wife and children. Protecting your dream of homeownership is more than how I provide for my family, it is my purpose and a way I give back.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Whether you are a first time homebuyer or an experienced one, I will walk with you through the inspection process with clarity, confidence, and care. I have dedicated myself to studying nearly every aspect of the industry — from inspections, construction, and real estate to insurance and water, fire, and mold restoration — so I can better protect your vision of owning a home.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    I take pride in being honest, even when the truth is uncomfortable. If I cannot be completely upfront with you, then we are probably not a good fit, and I am at peace with that. I will always wish you the best.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Above all, I am here to ensure your family and your investment are protected, nothing more and nothing less.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Your Inspection</h2>
                
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">Why Choose CDC Home Inspections?</h3>
                  <ul className="space-y-2 text-green-800">
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>You will receive the same care as if you were my own family.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Your report will never influenced by Realtors or sales pressure</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>You'll get the honest truth, even if it means you may walk away from a deal.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Your results are photo documented with full explanations and recommendations.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Same-day reports are available so you're not left waiting.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>Proudly serving Maricopa and Pinal Counties.</span>
                    </li>
                  </ul>
                  <p className="text-green-800 mt-4 font-medium text-center">
                    I'm so confident that you won't find another inspector like me that I've created a 50% Off Challenge. View pricing for more details.
                  </p>
                </div>

                <div className="mt-12 text-center space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/pricing" 
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      View Pricing
                    </Link>
                    <Link 
                      to="/what's-included" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      What's Included
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}