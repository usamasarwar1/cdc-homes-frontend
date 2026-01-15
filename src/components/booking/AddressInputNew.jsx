import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiRequest } from '../../lib/queryClient';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';



export default function AddressInputNew({ 
  onPropertyFound, 
  isLoading, 
  setIsLoading, 
  isAuthenticated, 
  setIsAuthenticated, 
  setIsModalOpen, 
  setModalType, 
  setPendingPropertyInfo }) {
  
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
  
  const [propertyData, setPropertyData] = useState(null);
  const [isValidatingProperty, setIsValidatingProperty] = useState(false);
  const [squareFootageConfirmed, setSquareFootageConfirmed] = useState(false);
  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
  // const VITE_BASE_URL = import.meta.env.VITE_LOCAL_URL;
  
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    streetNumber: '',
    direction: 'none',
    streetName: '',
    zipCode: ''
  });
  const [manualSquareFootage, setManualSquareFootage] = useState('');
  
  const [showAddressNotFound, setShowAddressNotFound] = useState(false);
  
  const inputRef = useRef(null);
  const debounceRef = useRef();

  const directionOptions = [
    { value: 'none', label: 'None' },
    { value: 'North', label: 'North' },
    { value: 'East', label: 'East' },
    { value: 'South', label: 'South' },
    { value: 'West', label: 'West' },
    { value: 'Northeast', label: 'Northeast' },
    { value: 'Northwest', label: 'Northwest' },
    { value: 'Southeast', label: 'Southeast' },
    { value: 'Southwest', label: 'Southwest' }
  ];

  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
       const url = `${VITE_BASE_URL}/placesAutocomplete?input=${encodeURIComponent(input)}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    
    const data = await response.json();
      setSuggestions(data.predictions || []);
      
      setShowSuggestions(true);
      setShowAddressNotFound(data.predictions?.length === 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowAddressNotFound(true);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddressChange = (value) => {
    
    setAddress(value);
    setPropertyData(null);
    setSquareFootageConfirmed(false);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
        
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = async (suggestion) => {
    setAddress(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsValidatingProperty(true);

    try {
        const url = `${VITE_BASE_URL}/propertyValidate`;
    const response = await fetch(url, {
      method: 'POST',
       headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    address: suggestion.description,
    placeId: suggestion.place_id,
  }),
    });
      
      const data = await response.json();      
      
      if (data.success && data.property) {
        setPropertyData({
          address: data.property.address,
          squareFootage: data.property.squareFootage,
          zipCode: data.property.zipCode || extractZipCode(suggestion.description),
          isValidated: true
        });
      } else {
        setShowAddressNotFound(true);
      }
    } catch (error) {
      console.error('Error validating property:', error);
      setShowAddressNotFound(true);
    } finally {
      setIsValidatingProperty(false);
    }
  };

  const extractZipCode = (address) => {
    const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
    return zipMatch ? zipMatch[0].substring(0, 5) : '';
  };

  const handleAddressNotFound = () => {
    setShowManualEntry(true);
    setShowSuggestions(false);
    setShowAddressNotFound(false);
    setAddress('');
    setPropertyData(null);
  };

  const handleManualSubmit = () => {
    const fullAddress = [
      manualAddress.streetNumber,
      manualAddress.direction !== 'none' ? manualAddress.direction : '',
      manualAddress.streetName
    ].filter(Boolean).join(' ');
    
    if (!fullAddress || !manualAddress.zipCode || !manualSquareFootage) {
      return;
    }


    setPropertyData({
      address: fullAddress + ', ' + manualAddress.zipCode,
      squareFootage: parseInt(manualSquareFootage),
      zipCode: manualAddress.zipCode,
      isValidated: false
    });
  };

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setIsAuthenticated(!!user);
  //   });
  //   return () => unsubscribe();
  // }, [setIsAuthenticated]);

  const handleConfirmAndProceed = async () => {
    if (!propertyData || !squareFootageConfirmed) return;
    
    setIsLoading(true);

    const propertyInfo = {
      address: propertyData.address,
      squareFootage: propertyData.squareFootage,
      zipCode: propertyData.zipCode,
      isValidated: propertyData.isValidated,
      manualEntry: !propertyData.isValidated,
      street: propertyData.address.split(',')[0] || '',
      city: propertyData.address.split(',')[1]?.trim() || '',
      state: 'AZ',
      zip: propertyData.zipCode,
      propertyType: 'Single Family Residence'
    };

    const user = auth.currentUser;
    // console.log("user in addressInputNew", user);

    // console.log("isAuthenticated in addressInputNew", isAuthenticated);
    
    if(user){
      setIsAuthenticated(true);
      onPropertyFound(propertyInfo);
      setIsLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setIsModalOpen(true);
      setModalType('login');
      setPendingPropertyInfo(propertyInfo);
      setIsLoading(false);
      return;
    }



  };

  const handleBackToAutocomplete = () => {
    setShowManualEntry(false);
    setShowAddressNotFound(false);
    setAddress('');
    setManualAddress({
      streetNumber: '',
      direction: 'none',
      streetName: '',
      zipCode: ''
    });
    setManualSquareFootage('');
    setPropertyData(null);
    setSquareFootageConfirmed(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative">
      <div className="relative bg-white rounded-xl shadow-lg border-2 border-stone-200 p-4 md:p-6">
        <div className="text-center mb-4 md:mb-6">
          <MapPin className="h-8 w-8 md:h-12 md:w-12 text-red-600 mx-auto mb-2 md:mb-3" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Property Address
          </h2>
          <p className="text-sm md:text-base text-gray-600 px-2">
            {showManualEntry 
              ? "Enter property details manually below"
              : "Start typing an address to get validated property information"
            }
          </p>
        </div>


             {!showManualEntry ? (
              // google map search ( code comment by Haider)
          <div className="space-y-6">
                <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter property address..."
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 text-base md:text-lg py-2 md:py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isValidatingProperty}
                />
                {isLoadingSuggestions && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 md:max-h-60 overflow-y-auto z-50 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.place_id}
                      className={`w-full text-left cursor-pointer px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        index === selectedIndex ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 md:mr-3 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-900 leading-tight">{suggestion.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/*Code comment by Haider-dev Address Not Found Option - ( Legacy for backwards compatibility ) */}
            {showAddressNotFound && !isLoadingSuggestions && (
              <div className="text-center py-3 md:py-4 border border-amber-200 rounded-lg bg-amber-50">
                <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm md:text-base text-amber-700 mb-3 px-2">No results found for this address</p>
                <Button
                  onClick={handleAddressNotFound}
                  variant="outline"
                  className="text-amber-600 border-amber-600 hover:bg-amber-50 text-sm md:text-base"
                >
                  Try Manual Entry
                </Button>
              </div>
            )}

            {/* Property Validation Loading */}
            {isValidatingProperty && (
              <div className="text-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">Validating property data...</p>
              </div>
            )}
          </div>
        ) : (
          // Manual  currently working 
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <Button
                onClick={handleBackToAutocomplete}
                variant="ghost"
                className="text-blue-600 hover:bg-blue-50 text-sm cursor-pointer"
              >
                ← Back to Address Search
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Street Number *
                </label>
                <Input
                  type="text"
                  placeholder="123"
                  value={manualAddress.streetNumber}
                  onChange={(e) => setManualAddress(prev => ({ ...prev, streetNumber: e.target.value }))}
                  className="text-center text-sm md:text-base border border-gray-300 rounded-md w-full focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2 ">
                  Direction
                </label>
                <Select 
                  value={manualAddress.direction} 
                  onValueChange={(value) => setManualAddress(prev => ({ ...prev, direction: value }))}
                >
                  <SelectTrigger className="text-sm md:text-base border border-gray-300 rounded-md w-full cursor-pointer">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {directionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  ZIP Code *
                </label>
                <Input
                  type="text"
                  placeholder="85001"
                  value={manualAddress.zipCode}
                  onChange={(e) => setManualAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="text-center text-sm md:text-base  border border-gray-300 rounded-md w-full focus:ring-red-500"
                  maxLength={5}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Street Name *
              </label>
              <Input
                type="text"
                placeholder="Main Street"
                value={manualAddress.streetName}
                onChange={(e) => setManualAddress(prev => ({ ...prev, streetName: e.target.value }))}
                className="text-sm md:text-base  border border-gray-300 rounded-md w-full focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Square Footage *
              </label>
              <Input
                type="number"
                placeholder="2000"
                value={manualSquareFootage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseInt(value) >= 1 && parseInt(value) <= 6000) {
                    setManualSquareFootage(value);
                  }
                }}
                className="text-sm md:text-base border border-gray-300 rounded-md w-full focus:ring-red-500"
              />
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Maximum 6,000 square feet
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleManualSubmit}
                disabled={!manualAddress.streetNumber || !manualAddress.streetName || !manualAddress.zipCode || !manualSquareFootage}
                className="w-full text-sm md:text-base bg-red-600 hover:bg-red-700 text-white py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue with Manual Entry
              </Button>
            </div>
          </div>
        )}

        {propertyData && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-start space-x-2 md:space-x-3">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium text-green-900 mb-2">Property Information</h3>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <p><span className="font-medium">Address:</span> {propertyData.address}</p>
                  <p><span className="font-medium">ZIP Code:</span> {propertyData.zipCode}</p>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Square Footage:</span>
                    <Input
                      type="number"
                      value={propertyData.squareFootage}
                      readOnly={propertyData.isValidated}
                      onChange={(e) => setPropertyData(prev => prev ? { ...prev, squareFootage: parseInt(e.target.value) || 0 } : null)}
                      className={`w-20 md:w-24 h-7 md:h-8 text-xs md:text-sm ${propertyData.isValidated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      min="1"
                      max="6000"
                    />
                    <span className="text-xs text-gray-500">
                      {propertyData.isValidated ? '(Validated)' : '(Manual)'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 md:mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={squareFootageConfirmed}
                      onChange={(e) => setSquareFootageConfirmed(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs md:text-sm text-gray-700">
                      I confirm this square footage is accurate
                    </span>
                  </label>
                </div>

                <Button
                  onClick={handleConfirmAndProceed}
                  disabled={!squareFootageConfirmed || isLoading}
                                  className="w-full text-sm md:text-base mt-10 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Property Details'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}