import { useEffect, useState } from "react";
import ContactVerification from "../components/booking/ContactVerification";
import { MiniProgressTracker } from "../components/gamification/MiniProgressTracker";
import { useProgress } from "../components/gamification/ProgressProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function ContactVerificationPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const { currentStep, completedSteps, completeStep, setStep } = useProgress();

  const [property, setProperty] = useState(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [tokenError, setTokenError] = useState(null);

  useEffect(() => {
    const initializeProperty = async () => {
      if (token) {
        try {
          setIsLoadingBooking(true);
          setTokenError(null);

          const cleanToken = token.trim();

          const bookingsQuery = query(
            collection(db, "bookings"),
            where("approvalToken", "==", cleanToken),
          );

          sessionStorage.setItem("approvalToken", cleanToken);
          localStorage.setItem("approvalToken", cleanToken);

          const querySnapshot = await getDocs(bookingsQuery);

          if (querySnapshot.empty) {
            setTokenError(
              "Invalid approval token. Please check your email link.",
            );
            setIsLoadingBooking(false);
            return;
          }

          const bookingData = querySnapshot.docs[0].data();

          sessionStorage.setItem(
            "bookingDataUsingToken",
            JSON.stringify(bookingData),
          );

          if (bookingData.approvalTokenUsed) {
            setTokenError("This approval link has already been used.");
            setIsLoadingBooking(false);
            return;
          }

          const expirationTime = bookingData.approvalTokenExpiresAt;
          if (expirationTime && Date.now() > expirationTime) {
            setTokenError(
              "This approval link has expired. Please contact support.",
            );
            setIsLoadingBooking(false);
            return;
          }

          if (bookingData.status !== "approval_pending") {
            setTokenError("This booking is not in approval pending status.");
            setIsLoadingBooking(false);
            return;
          }

          if (!bookingData.property) {
            setTokenError("Booking property data not found.");
            setIsLoadingBooking(false);
            return;
          }

          setProperty({
            address: bookingData.property.address || "",
            street: bookingData.property.street || "",
            city: bookingData.property.city || "",
            state: bookingData.property.state || "",
            zip: bookingData.property.zip || "",
            propertyType: bookingData.property.propertyType || "",
            squareFootage: bookingData.property.squareFootage || undefined,
            paymentMethod: bookingData.isDiscount ? "challenge" : "pay_now",
            challangePrice: bookingData.property.challengePrice,
          });
        } catch (error) {
          console.error("Error fetching booking by token:", error);
          setTokenError("Failed to validate approval token. Please try again.");
        } finally {
          setIsLoadingBooking(false);
        }
      } else {
        const hasPropertyParams =
          urlParams.get("address") ||
          urlParams.get("street") ||
          urlParams.get("city");

        if (hasPropertyParams) {
          const propertyFromUrl = {
            address: urlParams.get("address") || "",
            street: urlParams.get("street") || "",
            city: urlParams.get("city") || "",
            state: urlParams.get("state") || "",
            zip: urlParams.get("zip") || "",
            propertyType: urlParams.get("propertyType") || "",
            squareFootage:
              parseInt(urlParams.get("squareFootage") || "0") || undefined,
            paymentMethod: urlParams.get("paymentMethod") || "pay_now",
          };

          setProperty(propertyFromUrl);
        } else {
          // Fall back to sessionStorage when URL params are missing
          try {
            const contactDataStr = sessionStorage.getItem(
              "verified-contact-data",
            );
            const confirmedPropertyStr =
              sessionStorage.getItem("confirmedProperty");

            let contactData = null;
            let confirmedProperty = null;

            if (contactDataStr) {
              contactData = JSON.parse(contactDataStr);
            }
            if (confirmedPropertyStr) {
              confirmedProperty = JSON.parse(confirmedPropertyStr);
            }

            if (contactData || confirmedProperty) {
              const propertyFromStorage = {
                address:
                  confirmedProperty?.address || contactData?.address || "",
                street:
                  confirmedProperty?.street ||
                  contactData?.address?.split(",")[0]?.trim() ||
                  "",
                city:
                  confirmedProperty?.city ||
                  contactData?.address?.split(",")[1]?.trim() ||
                  "",
                state:
                  confirmedProperty?.state ||
                  contactData?.address?.split(",")[2]?.split(" ")[0]?.trim() ||
                  "",
                zip:
                  confirmedProperty?.zip ||
                  contactData?.address?.split(",")[2]?.split(" ")[1]?.trim() ||
                  "",
                propertyType:
                  confirmedProperty?.propertyType ||
                  contactData?.propertyType ||
                  "",
                squareFootage:
                  confirmedProperty?.squareFootage ||
                  contactData?.squareFootage ||
                  undefined,
                paymentMethod:
                  confirmedProperty?.paymentMethod ||
                  contactData?.paymentMethod ||
                  "pay_now",
              };

              setProperty(propertyFromStorage);
            } else {
              setTokenError(
                "No property information or approval token provided.",
              );
            }
          } catch (error) {
            console.error("Error parsing sessionStorage:", error);
            setTokenError(
              "No property information or approval token provided.",
            );
          }
        }
        setIsLoadingBooking(false);
      }
    };

    initializeProperty();
  }, [token]);

  useEffect(() => {
    if (property) {
      setStep("contact");
      completeStep("details");
    }
  }, [property, setStep, completeStep]);

  const handleVerified = (contactData) => {
    completeStep("contact");
    setStep("scheduling");
  };

  const handleBack = () => {
    if (property) {
      const params = new URLSearchParams();

      if (property.address) params.set("address", property.address);
      if (property.street) params.set("street", property.street);
      if (property.city) params.set("city", property.city);
      if (property.state) params.set("state", property.state);
      if (property.zip) params.set("zip", property.zip);
      if (property.propertyType)
        params.set("propertyType", property.propertyType);
      if (property.squareFootage)
        params.set("squareFootage", property.squareFootage.toString());
      if (property.paymentMethod)
        params.set("paymentMethod", property.paymentMethod);

      navigate(`/inspection-confirmed?${params.toString()}`);
    } else {
      navigate("/property-confirmed");
    }
  };

  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {token
              ? "Validating approval token..."
              : "Loading property information..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="text-center md:absolute md:left-10 md:top-12 md:transform md:-translate-y-1/2 md:text-left pt-4 md:pb-4">
          <Button
            onClick={() => navigate("/property-confirmed")}
            variant="ghost"
            className="text-blue-600 hover:bg-blue-50 text-sm cursor-pointer"
          >
            ← Back to Home
          </Button>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Contact Verification
            </h1>
            <p className="text-gray-600 mt-2">
              Verify your contact information to continue with booking
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <MiniProgressTracker
          currentStep={currentStep}
          completedSteps={completedSteps}
          className="mb-4"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {property && (
          <ContactVerification
            property={property}
            onVerified={handleVerified}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
