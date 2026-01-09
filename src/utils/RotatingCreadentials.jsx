
import React, { useState, useEffect } from 'react';
const RotatingCredentials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const credentialTexts = [
    "No other inspector delivers a complete solution backed by the same breadth of licensure, certifications, and hands-on experience.",
    "Darrell is licensed as a Home Inspector, Insurance Adjuster, General Contractor, Electrician, Plumber, HVAC Technician, and Realtor, and is IICRC certified in storm, water, fire, and mold damage restoration.",
    "Each credential was intentionally pursued to ensure your inspection is thorough, accurate, and informed by real-world expertise—not performed by a checklist technician.",
    "He inspects every property with the same purpose, to ensure that you know exactly what you're getting for the next 30 years. This is the same care and attention that he would give his own family."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % credentialTexts.length);
    }, 8550); 

    return () => clearInterval(interval);
  }, [credentialTexts.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {credentialTexts.map((text, index) => (
        <p
          key={index}
          className={`absolute inset-0 flex items-center text-base md:text-xl lg:text-2xl xl:text-3xl text-red-100 leading-relaxed text-center px-4 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)'}}
        >
          {text}
        </p>
      ))}
    </div>
  );
}

export default RotatingCredentials;