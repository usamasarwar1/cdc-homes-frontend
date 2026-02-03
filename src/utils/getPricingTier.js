 const getPricingTier = (propertyData) => {
  const { propertyType, mobileHomeType, multiFamilyUnits, commercialType, squareFootage = 0 } = propertyData;
  
  if (propertyType === 'Mobile/Manufactured Home') {
    switch (mobileHomeType) {
      case 'Single Wide': return { payNow: 625, challenge: 312, tier: "Single Wide Mobile Home" };
      case 'Double Wide': return { payNow: 750, challenge: 375, tier: "Double Wide Mobile Home" };
      case 'Triple Wide': return { payNow: 800, challenge: 400, tier: "Triple Wide Mobile Home" };
      default: return { payNow: 750, challenge: 375, tier: "Mobile/Manufactured Home" };
    }
  }
  
  if (propertyType === 'Multi-Family Residence') {
    const { unitSquareFootages = [] } = propertyData;
    
    if (unitSquareFootages && unitSquareFootages.length > 0) {
      const uniqueSquareFootages = Array.from(new Set(unitSquareFootages.map((sf) => parseInt(sf) || 0)));
      const allSameSize = uniqueSquareFootages.length === 1;
      
      if (allSameSize) {
        switch (multiFamilyUnits) {
          case '2 Units': return { payNow: 825, challenge: 412.50, tier: "2-Unit Multi-Family" };
          case '3 Units': return { payNow: 900, challenge: 450, tier: "3-Unit Multi-Family" };
          case '4 Units': return { payNow: 925, challenge: 462.50, tier: "4-Unit Multi-Family" };
          case '5 Units': return { payNow: 1050, challenge: 525, tier: "5-Unit Multi-Family" };
          case '6 Units': return { payNow: 1325, challenge: 662.50, tier: "6-Unit Multi-Family" };
          default: return { payNow: 825, challenge: 412, tier: "Multi-Family Residence" };
        }
      } else {
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
        
        const unitCount = unitSquareFootages.length;
        let discount = 0;
        switch (unitCount) {
          case 2: discount = 0.20; break; 
          case 3: discount = 0.22; break; 
          case 4: discount = 0.25; break; 
          case 5: discount = 0.27; break; 
          case 6: discount = 0.30; break; 
        }
        
        const discountedPayNow = Math.round(totalPayNow * (1 - discount));
        // const discountedChallenge = Math.floor(discountedPayNow / 2); 
        const discountedChallenge = Number((discountedPayNow / 2).toFixed(2));
        
        return { 
          payNow: discountedPayNow, 
          challenge: discountedChallenge, 
          tier: `${unitCount}-Unit Multi-Family (Custom Pricing)` 
        };
      }
    }
    
    switch (multiFamilyUnits) {
      case '2 Units': return { payNow: 825, challenge: 412.50, tier: "2-Unit Multi-Family" };
      case '3 Units': return { payNow: 900, challenge: 450, tier: "3-Unit Multi-Family" };
      case '4 Units': return { payNow: 925, challenge: 462.50, tier: "4-Unit Multi-Family" };
      case '5 Units': return { payNow: 1050, challenge: 525, tier: "5-Unit Multi-Family" };
      case '6 Units': return { payNow: 1325, challenge: 662.50, tier: "6-Unit Multi-Family" };
      default: return { payNow: 825, challenge: 412, tier: "Multi-Family Residence" };
    }
  }
  
if (propertyType === 'Commercial') {
  if (squareFootage <= 1200) {
    return { 
      payNow: 1916.67, 
      challenge: 958.33, 
      tier: "Commercial 700–1,200 SF" 
    };
  } 
  else if (squareFootage <= 3000) {
    return { 
      payNow: 2166.67, 
      challenge: 1083.33, 
      tier: "Commercial 1,201–3,000 SF" 
    };
  } 
  else if (squareFootage <= 5000) {
    return { 
      payNow: 2416.67, 
      challenge: 1208.33, 
      tier: "Commercial 3,001–5,000 SF" 
    };
  } 
  else {
    return { 
      payNow: 2666.67, 
      challenge: 1333.33, 
      tier: "Commercial 5,001–6,000 SF" 
    };
  }
}

  
  if (squareFootage <= 1200) {
    return { payNow: 575, challenge: 287.50, tier: "Up to 1,200 SF" };
  } else if (squareFootage <= 3000) {
    return { payNow: 650, challenge: 325, tier: "1,201 SF to 3,000 SF" };
  } else if (squareFootage <= 5000) {
    return { payNow: 725, challenge: 362.50, tier: "3,001 SF to 5,000 SF" };
  } else {
    return { payNow: 800, challenge: 400, tier: "5,001 SF to 6,000 SF" };
  }
};

export {
  getPricingTier
}