import React from "react";
import RotatingCredentials from "../utils/RotatingCreadentials";
import { Star } from 'lucide-react';


export default function Herosection() {
  return (
    <>
      <section className="bg-black text-white">
        <div className="relative min-h-[40vh] md:min-h-[70vh] flex items-center overflow-hidden">
          <div className="relative z-10 py-12 md:py-20 w-full bg-black/25">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="max-w-4xl mx-auto">
                <h1
                  className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight text-center"
                  style={{
                    textShadow:
                      "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
                  }}
                >
                  Protecting Your Family, Your Investment, Your Peace of Mind
                </h1>

                <div className="mb-8 md:mb-10 max-w-4xl relative min-h-[140px] md:min-h-[180px] lg:min-h-[200px] xl:min-h-[220px] flex items-center justify-center">
                  <RotatingCredentials />
                </div>
              </div>
            </div>
          </div>

          {/* Background Video - Absolute positioned behind content */}
          <div
            className="absolute inset-0 overflow-hidden bg-gray-900"
            style={{ zIndex: 0 }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              className="w-full h-full object-cover"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                minHeight: "100%",
                minWidth: "100%",
              }}
              src="/videos/myvideo_fixed.mp4"
            >
              Your browser does not support the video tag.
            </video>
           
          </div>

          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-lg z-20"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 shadow-lg z-20"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-lg z-20"></div>
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500 shadow-lg z-20"></div>
        </div>

        <div className="hero-stats py-8 md:py-12 bg-gradient-to-r from-red-600 to-orange-600 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: "#000000",
              opacity: 0.77,
              zIndex: 1,
            }}
          ></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex justify-center">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl w-full max-w-4xl relative">
                <div className="grid grid-cols-2 gap-4 md:gap-6 text-center">
                  <div>
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-md mb-2">
                      No Hidden
                    </div>
                    <div className="text-red-100 text-base md:text-lg">
                      Fees
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-md mb-2">
                      24hr
                    </div>
                    <div className="text-red-100 text-base md:text-lg">
                      Fast Turnaround
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-md mb-2">
                      100%
                    </div>
                    <div className="text-red-100 text-base md:text-lg">
                      Professional
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-md mb-2">
                      360+
                    </div>
                    <div className="text-red-100 flex items-center justify-center gap-2 text-sm md:text-base">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4 md:h-5 md:w-5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <span>Google Reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}