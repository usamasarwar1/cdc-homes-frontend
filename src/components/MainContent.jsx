import AddressInputNew from "../components/booking/AddressInputNew";
import { getPricingTier } from "../utils/getPricingTier";

export default function MainContent({
  property,
  isLoading,
  setIsLoading,
  setProperty,
  navigate,
  isOpen,
  setIsOpen,
}) {
  return (
    <main
      id="booking-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-0 main-footer-gap"
    >
      {!property && (
        <div className="mb-2 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Enter Inspection Details
          </h2>
          <p className="text-base text-gray-600">
            Enter your property address below to begin your inspection booking
          </p>
        </div>
      )}

      <div className="stable-grid mb-5">
        <div className={"col-span-full flex justify-center"}>
          <div className="w-full max-w-2xl">
            <AddressInputNew
              onPropertyFound={(propertyData) => {
                const pricing = getPricingTier(propertyData);
                const propertyWithPricing = {
                  ...propertyData,
                  basePrice: pricing.payNow,
                  payNowPrice: pricing.payNow,
                  challengePrice: pricing.challenge,
                  pricingTier: pricing.tier,
                };
                setProperty(propertyWithPricing);

                sessionStorage.setItem(
                  "confirmedProperty",
                  JSON.stringify(propertyWithPricing),
                );
                setIsOpen(false);
                navigate("/property-confirmed");
              }}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
