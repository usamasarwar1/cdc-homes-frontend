import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "../gamification/ProgressProvider";
import { getPricingTier } from "../../utils/getPricingTier";
import { ProgressSteps, GuidanceCard } from "../ui/Progress-steps";

export default function PropertyDetails({ property, onContinue, onBack }) {
  const navigate = useNavigate();
  const formatNumber = (num) => num?.toLocaleString() || "N/A";
  const [selectedPayment, setSelectedPayment] = useState("pay_now");
  const [squareFootageConfirmed, setSquareFootageConfirmed] = useState(false);
  const [manualSquareFootage, setManualSquareFootage] = useState(
    property.squareFootage || 0,
  );
  const [isEditingSquareFootage, setIsEditingSquareFootage] = useState(false);

  const { currentStep, completedSteps, completeStep, setStep } = useProgress();

  useEffect(() => {
    setStep("details");
    completeStep("address");
  }, [setStep, completeStep]);

  const finalSquareFootage = isEditingSquareFootage
    ? manualSquareFootage
    : property.squareFootage || 0;
  const updatedProperty = { ...property, squareFootage: finalSquareFootage };
  const pricing = getPricingTier(updatedProperty);
  // console.log(pricing);

  const progressSteps = [
    {
      id: "address",
      title: "Address",
      description: "Enter location",
      completed: true,
    },
    {
      id: "details",
      title: "Pricing Details",
      description: "Enter Price",
      current: true,
    },
    {
      id: "contact",
      title: "Contact Info",
      description: "Enter details",
      completed: false,
    },
    {
      id: "booking",
      title: "Schedule",
      description: "Pay & book",
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 md:py-8 w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-2 md:px-4">
        <ProgressSteps steps={progressSteps} />

        {/* <div className="hidden md:block">
          <GuidanceCard
            title="Step 2: Booking Details"
            description="Review and confirm the property information below. This ensures accurate pricing for your inspection."
            nextAction="Choose payment option to continue"
            variant="info"
          >
            <div className="text-sm text-blue-700 bg-white/30 p-2 rounded mt-2">
              <strong>What's next:</strong> Select either standard pricing or
              take the 50% challenge to proceed
            </div>
          </GuidanceCard>
        </div> */}

        <div className="space-y-4 md:space-y-6">
          <div className="mb-4 md:mb-6">
            <div className="p-3 md:p-4 bg-blue-50 border border-blue-300 rounded-lg shadow-sm">
              <div className="text-center md:text-left">
                <h2 className="text-base md:text-xl font-bold text-blue-900 mb-1 md:mb-2">
                  Your Inspection Address
                </h2>
                <div className="text-blue-800 text-sm md:text-lg font-semibold leading-tight md:leading-relaxed">
                  <div className="truncate">
                    {property.street || property.address?.split(",")[0] || ""}
                  </div>
                  <div className="text-xs md:text-base">
                    {property.city ||
                      property.address?.split(",")[1]?.trim() ||
                      ""}
                    , {property.state || "AZ"}{" "}
                    {property.zip || property.zipCode}
                  </div>
                  {(finalSquareFootage > 0 ||
                    property.multiFamilyUnits ||
                    property.mobileHomeType) && (
                    <div className="mt-1 text-xs md:text-base font-bold">
                      {property.propertyType === "Single Family Residence"
                        ? `${formatNumber(finalSquareFootage)} ft²`
                        : property.propertyType === "Multi-Family Residence"
                          ? `${property.multiFamilyUnits || "Multi-Unit"}`
                          : property.propertyType === "Mobile/Manufactured Home"
                            ? `${property.mobileHomeType || "Single Wide"}`
                            : property.propertyType === "Commercial"
                              ? "Commercial Property"
                              : `${formatNumber(finalSquareFootage)} ft²`}
                    </div>
                  )}
                </div>
              </div>

              {(property.isManual || property.manualEntry) && (
                <div className="mt-1 md:mt-3 text-center md:text-left">
                  <Badge
                    variant="outline"
                    className="text-xs text-blue-600 border-blue-200 bg-blue-100"
                  >
                    Manual Entry
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {property.propertyType !== "Single Family Residence" && (
            <div className="mb-6 md:mb-8 p-3 md:p-4 bg-gray-50 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Property Type Details
              </h3>
              <div className="text-sm md:text-base text-gray-700 space-y-1">
                <p>
                  <strong>Property Type:</strong> {property.propertyType}
                </p>
                {property.mobileHomeType && (
                  <p>
                    <strong>Mobile Home Type:</strong> {property.mobileHomeType}
                  </p>
                )}
                {property.multiFamilyUnits && (
                  <p>
                    <strong>Number of Units:</strong>{" "}
                    {property.multiFamilyUnits}
                  </p>
                )}
                {property.commercialType && (
                  <p>
                    <strong>Commercial Type:</strong> {property.commercialType}
                  </p>
                )}
              </div>
            </div>
          )}

          {(property.address || property.street) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-2 text-center md:text-left">
                Your Inspection Pricing
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-center md:text-left">
                Property Size: {pricing.tier}
              </p>

              <div className="flex flex-col">
                <button
                  onClick={() => {
                    completeStep("details");
                    setStep("contact");

                    const params = new URLSearchParams({
                      address: property.address || "",
                      street: property.street || "",
                      city: property.city || "",
                      state: property.state || "",
                      zip: property.zip || "",
                      propertyType: property.propertyType || "",
                      squareFootage: finalSquareFootage?.toString() || "",
                      paymentMethod: "pay_now",
                    });

                    if (property.propertyType === "Multi-Family Residence") {
                      if (property.multiFamilyUnits)
                        params.set(
                          "multiFamilyUnits",
                          property.multiFamilyUnits,
                        );

                      if (property.unitLabels)
                        params.set(
                          "unitLabels",
                          JSON.stringify(property.unitLabels),
                        );

                      if (property.unitSquareFootages)
                        params.set(
                          "unitSquareFootages",
                          JSON.stringify(property.unitSquareFootages),
                        );
                    }

                    sessionStorage.setItem("paymentMethod", "pay_now");
                    navigate(`/contact-verification?${params.toString()}`);
                  }}
                  className="group relative overflow-hidden cursor-pointer rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-green-400 hover:shadow-2xl"
                >
                  <div className="flex h-full flex-col justify-between gap-4 text-left">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-800">
                          Book Now
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          Fast-track your booking instantly
                        </p>
                      </div>

                      <div className="rounded-full bg-green-100 p-2 transition-colors group-hover:bg-green-200">
                        <ArrowRight className="h-5 w-5 text-green-700" />
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-green-600">
                          ${pricing.payNow}
                        </span>
                        <span className="mb-1 text-sm font-medium text-gray-500">
                          USD
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-medium text-green-700">
                        Standard Fee
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* <div className="mt-2 md:mt-4 p-3 md:p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm md:text-xs text-gray-700 text-center leading-tight">
                  Choose 50% challenge to match credentials or standard pricing
                  to continue
                </p>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
