import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { getDoc, getDocs, doc, collection, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../components/Headers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Home,
  X,
  Award,
  FileText,
  Phone,
  Globe
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to format Firestore timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return "N/A";
  };

  // Helper function to get status badge styling
  const getStatusConfig = (status) => {
    const configs = {
      'approved': {
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
        color: 'text-green-600'
      },
      'approval_pending': {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        color: 'text-yellow-600'
      },
      'pending_verification': {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: AlertCircle,
        color: 'text-blue-600'
      },
      'rejected': {
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        color: 'text-red-600'
      },
    };
    
    return configs[status] || {
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertCircle,
      color: 'text-gray-600'
    };
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Fetch profile + bookings
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userSnap.exists()) {
          setIsLoading(false);
          return;
        }

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid)
        );
        const bookingsSnap = await getDocs(bookingsQuery);

        const bookings = bookingsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        console.log("bookings", bookings);
        

        setUser({ id: currentUser.uid, ...userSnap.data(), bookings });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No user data found.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <Header /> */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Card className="mb-8 shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-1">{user?.name || "User"}</CardTitle>
                    <CardDescription className="text-base">{user?.email}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  {user?.role?.toUpperCase() || "USER"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Member Since</p>
                    <p className="text-md font-semibold text-gray-900">
                      {formatTimestamp(user?.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                    <p className="text-md font-semibold text-gray-900">
                      {user?.bookings?.length || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Account Status</p>
                    <p className="text-md font-semibold text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                My Bookings
              </h2>
              {user?.bookings?.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {user.bookings.length} {user.bookings.length === 1 ? 'booking' : 'bookings'}
                </Badge>
              )}
            </div>
            
            {!user?.bookings || user.bookings.length === 0 ? (
              <Card className="shadow-md">
                <CardContent className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <Home className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-md font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    You haven't made any bookings yet. Start by searching for a property to inspect.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.bookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <Card
                      key={booking.id}
                      onClick={() => handleBookingClick(booking)}
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white group"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-md line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {booking.property?.address || "Property Address"}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge className={`${statusConfig.className} border`}>
                          <StatusIcon className={`h-3 w-3 mr-1.5 ${statusConfig.color}`} />
                          {booking.status?.replace(/_/g, ' ') || 'Unknown'}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{booking.property?.propertyType || "N/A"}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {booking.property?.city}, {booking.property?.state}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Home className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{booking.property?.squareFootage?.toLocaleString() || "N/A"} SF</span>
                          </div>
                          
                          <div className="pt-3 border-t flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-md font-bold text-gray-900">
                                ${booking.property?.basePrice || booking.property?.payNowPrice || "N/A"}
                              </span>
                            </div>
                            {booking.isDiscount && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Discount
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(booking.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Booking Details Modal */}
        {selectedBooking && isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div>
                  {(() => {
                    const statusConfig = getStatusConfig(selectedBooking.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <Badge className={`${statusConfig.className} border text-sm px-4 py-2`}>
                        <StatusIcon className={`h-4 w-4 mr-2 ${statusConfig.color}`} />
                        {selectedBooking.status?.replace(/_/g, ' ') || 'Unknown'}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Property Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-600" />
                      Property Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p className="font-medium text-gray-900">{selectedBooking.property?.address || "N/A"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Property Type</p>
                        <p className="font-medium text-gray-900">{selectedBooking.property?.propertyType || "N/A"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Square Footage</p>
                        <p className="font-medium text-gray-900">
                          {selectedBooking.property?.squareFootage?.toLocaleString() || "N/A"} SF
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Pricing Tier</p>
                        <p className="font-medium text-gray-900">{selectedBooking.property?.pricingTier || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Base Price</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${selectedBooking.property?.basePrice || selectedBooking.property?.payNowPrice || "N/A"}
                          </p>
                        </div>
                        {selectedBooking.property?.challengePrice && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Challenge Price</p>
                            <p className="text-xl font-semibold text-blue-600">
                              ${selectedBooking.property.challengePrice}
                            </p>
                          </div>
                        )}
                      </div>
                      {selectedBooking.isDiscount && (
                        <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                          Discount Applied
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Inspector Information */}
                {selectedBooking.inspector && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md flex items-center gap-2">
                        <User className="h-5 w-5 text-purple-600" />
                        Inspector Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Full Name</p>
                          <p className="font-medium text-gray-900">{selectedBooking.inspector.fullName || "N/A"}</p>
                        </div>
                        
                        {selectedBooking.inspector.licenseNumbers && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">License Number</p>
                            <p className="font-medium text-gray-900">{selectedBooking.inspector.licenseNumbers}</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedBooking.inspector.websiteUrl && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-gray-500 mb-1">Website</p>
                          <a 
                            href={selectedBooking.inspector.websiteUrl.startsWith('http') 
                              ? selectedBooking.inspector.websiteUrl 
                              : `https://${selectedBooking.inspector.websiteUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4" />
                            {selectedBooking.inspector.websiteUrl}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">{formatTimestamp(selectedBooking.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedBooking.updatedAt && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium text-gray-900">{formatTimestamp(selectedBooking.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Modal Footer */}
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={closeModal}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;