 const getPricingTier = (propertyData) => {
  const { propertyType, mobileHomeType, multiFamilyUnits, commercialType, squareFootage = 0 } = propertyData;
  
  // Mobile/Manufactured Home pricing - fixed rates
  if (propertyType === 'Mobile/Manufactured Home') {
    switch (mobileHomeType) {
      case 'Single Wide': return { payNow: 625, challenge: 312, tier: "Single Wide Mobile Home" };
      case 'Double Wide': return { payNow: 750, challenge: 375, tier: "Double Wide Mobile Home" };
      case 'Triple Wide': return { payNow: 800, challenge: 400, tier: "Triple Wide Mobile Home" };
      default: return { payNow: 750, challenge: 375, tier: "Mobile/Manufactured Home" };
    }
  }
  
  // Multi-Family pricing with per-unit calculation and discounts
  if (propertyType === 'Multi-Family Residence') {
    const { unitSquareFootages = [] } = propertyData;
    
    if (unitSquareFootages && unitSquareFootages.length > 0) {
      // Check if all units have the same square footage
      const uniqueSquareFootages = Array.from(new Set(unitSquareFootages.map((sf) => parseInt(sf) || 0)));
      const allSameSize = uniqueSquareFootages.length === 1;
      
      if (allSameSize) {
        // Use standard unit-based pricing
        switch (multiFamilyUnits) {
          case '2 Units': return { payNow: 825, challenge: 412, tier: "2-Unit Multi-Family" };
          case '3 Units': return { payNow: 900, challenge: 450, tier: "3-Unit Multi-Family" };
          case '4 Units': return { payNow: 950, challenge: 475, tier: "4-Unit Multi-Family" };
          case '5 Units': return { payNow: 1050, challenge: 525, tier: "5-Unit Multi-Family" };
          default: return { payNow: 825, challenge: 412, tier: "Multi-Family Residence" };
        }
      } else {
        // Calculate price per unit based on square footage with discounts
        let totalPayNow = 0;
        
        unitSquareFootages.forEach((sf) => {
          const squareFootage = parseInt(sf) || 0;
          let unitPrice = 0;
          
          if (squareFootage <= 1000) unitPrice = 475;
          else if (squareFootage <= 1500) unitPrice = 525;
          else if (squareFootage <= 2000) unitPrice = 575;
          else if (squareFootage <= 2500) unitPrice = 625;
          else if (squareFootage <= 3000) unitPrice = 675;
          else if (squareFootage <= 3500) unitPrice = 725;
          else if (squareFootage <= 4000) unitPrice = 775;
          else if (squareFootage <= 5000) unitPrice = 825;
          else unitPrice = 875;
          
          totalPayNow += unitPrice;
        });
        
        // Apply multi-family discounts
        const unitCount = unitSquareFootages.length;
        let discount = 0;
        switch (unitCount) {
          case 2: discount = 0.20; break; // 20% off
          case 3: discount = 0.22; break; // 22% off
          case 4: discount = 0.25; break; // 25% off
          case 5: discount = 0.27; break; // 27% off
          case 6: discount = 0.30; break; // 30% off
        }
        
        const discountedPayNow = Math.round(totalPayNow * (1 - discount));
        const discountedChallenge = Math.floor(discountedPayNow / 2); // 50% challenge pricing
        
        return { 
          payNow: discountedPayNow, 
          challenge: discountedChallenge, 
          tier: `${unitCount}-Unit Multi-Family (Custom Pricing)` 
        };
      }
    }
    
    // Fallback to new fixed pricing if no unit square footages
    switch (multiFamilyUnits) {
      case '2 Units': return { payNow: 825, challenge: 412, tier: "2-Unit Multi-Family" };
      case '3 Units': return { payNow: 900, challenge: 450, tier: "3-Unit Multi-Family" };
      case '4 Units': return { payNow: 950, challenge: 475, tier: "4-Unit Multi-Family" };
      case '5 Units': return { payNow: 1050, challenge: 525, tier: "5-Unit Multi-Family" };
      default: return { payNow: 825, challenge: 412, tier: "Multi-Family Residence" };
    }
  }
  
  // Commercial pricing - flat rate
  if (propertyType === 'Commercial') {
    return { payNow: 1100, challenge: 550, tier: `Commercial - ${commercialType || 'Property'}` };
  }
  
  // Single Family Residence - square footage based pricing
  if (squareFootage <= 1200) {
    return { payNow: 575, challenge: 287, tier: "Up to 1,200 SF" };
  } else if (squareFootage <= 3000) {
    return { payNow: 650, challenge: 325, tier: "1,201 SF to 3,000 SF" };
  } else if (squareFootage <= 5000) {
    return { payNow: 725, challenge: 362, tier: "3,001 SF to 5,000 SF" };
  } else {
    return { payNow: 800, challenge: 400, tier: "5,001 SF to 6,000 SF" };
  }
};

export {
  getPricingTier
}