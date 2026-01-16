import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/Label';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useProgress } from '../components/gamification/ProgressProvider';
import { MiniProgressTracker } from '../components/gamification/MiniProgressTracker';
import { AchievementBadges } from '../components/gamification/AchievementBadges';
import { doc, setDoc, getDoc, query, where, serverTimestamp, collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const inspectorCredentials = [
  { label: "Home Inspector", value: "home_inspector" },
  { label: "GC KB-1 or KB-2", value: "gc_kb_license" },
  { label: "HVAC Licensed", value: "hvac_licensed" },
  { label: "Plumbing Licensed", value: "plumbing_licensed" },
  { label: "Electrical Licensed", value: "electrical_licensed" },
  { label: "Insurance Adjuster", value: "insurance_adjuster" },
  { label: "IICRC Certified", value: "iicrc_certified" },
  { label: "Realtor", value: "realtor" }
];

const customerCredentials = [
  { label: "Home Inspector", value: "home_inspector" },
  { label: "GC KB-1 or KB-2", value: "gc_kb_license" },
  { label: "HVAC Licensed", value: "hvac_licensed" },
  { label: "Plumbing Licensed", value: "plumbing_licensed" },
  { label: "Electrical Licensed", value: "electrical_licensed" },
  { label: "Insurance Adjuster", value: "insurance_adjuster" },
  { label: "IICRC Certified", value: "iicrc_certified" },
  { label: "Realtor", value: "realtor" }
];

export default function CredentialComparisonPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [inspectorDetails, setInspectorDetails] = useState({
    fullName: '',
    licenseNumbers: '',
    websiteUrl: ''
  });
  
  const { currentStep, completedSteps, completeStep, setStep } = useProgress();
  
  useEffect(() => {
    setStep('credentials');
        setSelectedCredentials([]);
        const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      if (window.pageYOffset !== 0) {
        window.pageYOffset = 0;
      }
    };
    
    scrollToTop();
    
    setTimeout(scrollToTop, 10);
  }, []);

  const handleCredentialChange = (credentialValue, checked) => {
    if (checked) {
      setSelectedCredentials(prev => [...prev, credentialValue]);
    } else {
      setSelectedCredentials(prev => prev.filter(c => c !== credentialValue));
    }
  };

  const capitalizeWords = (text) => {
    if (!text || typeof text !== 'string') return "";
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleInputChange = (field, value) => {
    let newValue = value;
    if(field === 'websiteUrl') {
      newValue = value.trim()
    } else {
      newValue = capitalizeWords(value);
    }
    setInspectorDetails(prev => ({ ...prev, [field]: newValue }));
  };

  const calculateMatch = () => {
    const normalizedSelected = selectedCredentials.map(cred => 
      cred === 'dual_kb_license' ? 'dual_kb2_license' : cred
    );
    
    const matches = inspectorCredentials.filter(cred => 
      normalizedSelected.includes(cred.value)
    ).length;
    
    return { matches, total: inspectorCredentials.length };
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    const { matches, total } = calculateMatch();
    
    if (matches === total) {
      completeStep('credentials');
    }
    
    const challengeAvailable = matches === 9 && total === 9;
    localStorage.setItem('challengeAvailable', JSON.stringify(challengeAvailable));
    
    if (matches === total) {
      setShowDetailForm(true);
    }
    
    setTimeout(() => {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
      completeStep('credentials');
      setStep('contact');
      const paymentMethod = sessionStorage.getItem('paymentMethod');
      const propertyData = JSON.parse(sessionStorage.getItem('confirmedProperty'));
      const userData = JSON.parse(sessionStorage.getItem('userData'));
  
  
      const data = {
        isDiscount: paymentMethod === 'challenge' ? true : false,
        property: propertyData,
        userId: userData.userId,
        inspector: inspectorDetails,
        status: 'pending_verification',
        updatedAt: serverTimestamp()
      };
  
      // const q = query(
      //   collection(db, "bookings"),
      //   where("userId", "==", userData.userId)
      // );
  
      // const snapshot = await getDocs(q);
  
      // if (snapshot.docs.length > 0) {
      //   // update data 
      //   const existingDocId = snapshot.docs[0].id;        
      //   await updateDoc(doc(db, 'bookings', existingDocId), data);
      // } else {
      //   // create new data
      //   const bookingsRef = collection(db, 'bookings');
      //   const newData = {
      //     ...data,
      //     createdAt: serverTimestamp()
      //   };
      //    await addDoc(bookingsRef, newData);
      // }

      const bookingsRef = collection(db, 'bookings');
        const newData = {
          ...data,
          createdAt: serverTimestamp()
        };
         await addDoc(bookingsRef, newData);
  
      alert("Thank you! We will verify the provided information within 2 hours. If the credentials are confirmed, we will honor the discounted price.");
      navigate("/");
    } catch (error) {
      console.error("Error saving data to database", error);
      alert(`Error: ${error.message || 'Failed to save booking. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const { matches, total } = calculateMatch();
  const matchPercentage = Math.round((matches / total) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <MiniProgressTracker 
          currentStep={currentStep}
          completedSteps={completedSteps}
          className="mb-4"
        />
      </div>
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="text-center mb-6 md:mb-8 px-2">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
            Who Would You Trust to Protect Your Family, Your Investment and Your Peace of Mind?
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-sm font-semibold">?</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Compare Credentials Challenge</h3>
            </div>
            <p className="text-blue-800 text-sm md:text-base text-center">
              Select the credentials that match your current inspector below. If you can find someone with the same qualifications as CDC Home Inspections, we'll honor a special discount. We're confident you won't find a match!
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="text-left p-2 md:p-4 font-semibold text-sm md:text-base">Credential</th>
                  <th className="text-center p-2 md:p-4 font-semibold text-sm md:text-base min-w-[100px] md:min-w-[200px]">Our Competitor</th>
                  <th className="text-center p-2 md:p-4 font-semibold text-sm md:text-base min-w-[100px] md:min-w-[200px]">CDC Home Inspections</th>
                </tr>
              </thead>
              <tbody>
                {inspectorCredentials.map((credential, index) => {
                  const isSelected = selectedCredentials.includes(credential.value === 'dual_kb2_license' ? 'dual_kb_license' : credential.value);
                  const isDisabled = hasSubmitted && !isSelected;
                  const rowOpacity = isDisabled ? 'opacity-40' : '';
                  

                  
                  return (
                    <tr key={credential.value} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${rowOpacity}`}>
                      <td className={`p-2 md:p-4 font-medium text-sm md:text-base ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {credential.label}
                      </td>
                      <td className="p-2 md:p-4 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            id={`competitor-${credential.value}`}
                            checked={isSelected}
                            disabled={hasSubmitted}
                            onCheckedChange={(checked) => {
                              if (!hasSubmitted) {
                                const targetValue = credential.value === 'dual_kb2_license' ? 'dual_kb_license' : credential.value;

                                handleCredentialChange(targetValue, checked);
                              }
                            }}
                            className={`w-5 h-5 min-w-[20px] min-h-[20px] cursor-pointer md:w-6 md:h-6 md:min-w-[24px] md:min-h-[24px] flex-shrink-0 ${isDisabled ? 'opacity-40 ' : ''}`}
                          />
                        </div>
                      </td>
                      <td className="p-2 md:p-4 text-center">
                        <Check className="w-4 h-4  md:w-6 md:h-6 text-green-600 mx-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-base md:text-lg font-semibold text-gray-900">
              Credential Match: {matches}/{total} ({matchPercentage}%)
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {!hasSubmitted && (
          <div className="mt-4 md:mt-6 text-center px-4 space-y-3">
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base w-full md:w-auto"
              disabled={selectedCredentials.length === 0}
            >
              Compare Credentials
            </Button>
            
            {/* <div>
              <Link to="/pricing">
                <Button 
                  variant="outline" 
                  className="bg-transparent cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-50 px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base w-full md:w-auto flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Pricing</span>
                </Button>
              </Link>
            </div> */}
            <div>
              <Link to="/property-confirmed">
                <Button 
                  variant="outline" 
                  className="bg-transparent cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-50 px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base w-full md:w-auto flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {hasSubmitted && !showDetailForm && (
          <div id="results-section" className="mt-6 space-y-6">
            <AchievementBadges 
              completedSteps={completedSteps}
              totalPoints={completedSteps.length * 15 + (hasSubmitted && matches === 9 ? 25 : 0)}
            />
            
            <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="text-center text-red-800">
                <div className="font-bold text-lg mb-3">
                  ❌ No Discount Available
                </div>
                <div className="font-semibold mb-2">
                  The inspector you selected is rated with a {matches}/{total} match ({matchPercentage}%) which does not qualify for 50% Off.
                </div>
                <div className="text-sm">
                  Only {matches} out of {total} qualifications matched — that's {matchPercentage}%. Trust your home inspection to a more qualified professional with key expertise.
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-center mb-2 text-gray-900">Book Now</h3>
              <p className="text-center text-gray-600 mb-6">Since credentials don't fully match, regular pricing is in effect</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className="p-6 border-2 border-green-300 rounded-lg text-center bg-green-50 cursor-pointer hover:bg-green-100 transition-colors" 
                  style={{ animation: 'gentle-pulse 2s ease-in-out infinite' }}
                  onClick={() => {
                    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
                    const urlParams = new URLSearchParams({
                      address: propertyData.address || '',
                      street: propertyData.street || '',
                      city: propertyData.city || '',
                      state: propertyData.state || '',
                      zip: propertyData.zip || '',
                      propertyType: propertyData.propertyType || '',
                      squareFootage: propertyData.squareFootage?.toString() || '',
                      paymentMethod: 'schedule_now'
                    });
                    window.location.href = `/contact-verification?${urlParams.toString()}`;
                  }}
                >
                  <div className="text-green-700 font-bold text-lg mb-3">📅 Schedule Now</div>
                  <div className="text-3xl font-bold text-green-800 mb-2">
                    ${(() => {
                      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
                      const sqft = propertyData.squareFootage || 0;
                      if (sqft <= 1200) return '575.00';
                      if (sqft <= 3000) return '650.00';
                      if (sqft <= 5000) return '725.00';
                      return '800.00';
                    })()}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Standard Rate</div>
                  <div className="text-xs text-green-500 mt-1">Click to schedule</div>
                </div>
                <div className={`p-6 border-2 rounded-lg text-center ${
                  matches === 9 && total === 9 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-gray-300 bg-gray-100 opacity-50'
                }`}>
                  <div className={`font-bold text-lg mb-3 ${
                    matches === 9 && total === 9 ? 'text-purple-700' : 'text-gray-500'
                  }`}>🎯 50% Challenge</div>
                  <div className={`text-3xl font-bold mb-2 ${
                    matches === 9 && total === 9 ? 'text-purple-800' : 'text-gray-400'
                  }`}>
                    ${(() => {
                      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
                      const sqft = propertyData.squareFootage || 0;
                      let fullPrice = 575;
                      if (sqft <= 1200) fullPrice = 575;
                      else if (sqft <= 3000) fullPrice = 650;
                      else if (sqft <= 5000) fullPrice = 725;
                      else fullPrice = 800;
                      return (fullPrice / 2).toFixed(2);
                    })()}
                  </div>
                  <div className={`text-sm font-medium ${
                    matches === 9 && total === 9 ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    {matches === 9 && total === 9 ? 'Match All Credentials' : 'Not Available - Incomplete Match'}
                  </div>
                  <div className={`text-xs mt-1 ${
                    matches === 9 && total === 9 ? 'text-purple-500' : 'text-gray-400'
                  }`}>
                    {matches === 9 && total === 9 ? 'Verify inspector qualifications' : 'Need 9/9 credential match'}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-center text-yellow-800 text-sm font-medium">
                  💡 Want the 50% discount? Find an inspector with all 9 matching credentials!
                </p>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => {
                    setHasSubmitted(false);
                    setShowDetailForm(false);
                    setSelectedCredentials([]);
                    setInspectorDetails({
                      fullName: '',
                      licenseNumbers: '',
                      websiteUrl: ''
                    });
                  }}
                  variant="outline"
                  className="px-6 py-2 border-2 border-gray-400 hover:bg-gray-50"
                >
                  Want To Try Another Competitor?
                </Button>
              </div>
            </div>
          </div>
        )}

        {showDetailForm && (
          <div id="results-section" className="mt-6 space-y-6">
            <AchievementBadges 
              completedSteps={completedSteps}
              totalPoints={completedSteps.length * 15 + 25}
            />
            
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-6">
              <div className="text-center text-green-800 mb-4">
                <div className="font-semibold mb-2">
                  Perfect Match! You qualify for 50% Off!
                </div>
                <div className="text-sm mb-4">
                  Please provide the inspector's license details for verification:
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-center">Matched Credentials</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {inspectorCredentials.map((credential) => (
                    <div key={credential.value} className="flex items-center space-x-2 p-2 bg-white rounded">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">{credential.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name of Inspector
                  </Label>
                  <Input
                    id="fullName"
                    value={inspectorDetails.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter Inspector's Full Name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="licenseNumbers" className="text-sm font-medium">
                    License Number(s)
                  </Label>
                  <Input
                    id="licenseNumbers"
                    value={inspectorDetails.licenseNumbers}
                    onChange={(e) => handleInputChange('licenseNumbers', e.target.value)}
                    placeholder="Enter License Numbers (Separate Multiple With Commas)"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="websiteUrl" className="text-sm font-medium">
                    Website URL
                  </Label>
                  <Input
                    id="websiteUrl"
                    value={inspectorDetails.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="Enter Inspector's Website URL"
                    className="mt-1"
                  />
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={handleFinalSubmit}
                    className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
                    disabled={!inspectorDetails.fullName || !inspectorDetails.licenseNumbers}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Verification"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-lg p-6" style={{ animation: 'dramatic-pulse 1.2s ease-in-out infinite' }}>
              <h3 className="text-lg font-semibold text-center mb-4 text-green-800">50% Off Pricing</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border border-green-200 rounded-lg text-center bg-green-50" style={{ animation: 'attention-pulse 1.5s ease-in-out infinite' }}>
                  <div className="text-green-600 font-semibold mb-2">Pay Now</div>
                  <div className="text-2xl font-bold text-green-800">$312.50</div>
                  <div className="text-sm text-gray-600">50% Off Standard Rate ($625)</div>
                </div>
              </div>
              <div className="text-center mt-4 text-sm text-green-700">
                * Pricing applies after successful verification of credentials
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}