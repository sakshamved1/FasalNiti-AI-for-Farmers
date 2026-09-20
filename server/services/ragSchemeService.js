/**
 * Generic Government Scheme Rules & Eligibility Evaluation Engine
 * Evaluates thousands of agricultural schemes against actual authenticated user profiles
 * Evaluates: State, District, Crops, Role, Landholding size, Category, Irrigation, Income, KCC
 */

const evaluateSchemeForProfile = (scheme, profile = {}) => {
  const {
    state = '',
    district = '',
    role = 'FARMER',
    farmerDetails = {}
  } = profile;

  const userLand = Number(farmerDetails.landSizeAcres || profile.landSizeAcres || 0);
  const userCategory = farmerDetails.landCategory || profile.landCategory || 'Small';
  const userIrrigation = farmerDetails.irrigationType || profile.irrigationType || 'Rainfed';
  const userCrops = farmerDetails.primaryCrops || profile.primaryCrops || [];
  const userIncome = Number(farmerDetails.annualIncome || profile.annualIncome || 0);
  const userKcc = Boolean(farmerDetails.kccHolder || profile.kccHolder);

  let score = 50; // Baseline starting score
  const matchedRules = [];
  const unmatchedRules = [];
  let isPotentiallyEligible = true;

  // 1. ROLE CHECK
  const applicableRoles = scheme.applicableRoles || ['FARMER'];
  if (applicableRoles.includes(role) || applicableRoles.includes('ALL')) {
    score += 10;
    matchedRules.push(`Eligible for your registered role (${role})`);
  } else {
    isPotentiallyEligible = false;
    unmatchedRules.push(`Intended for ${applicableRoles.join(', ')} (Your role: ${role})`);
  }

  // 2. STATE APPLICABILITY
  const schemeStates = scheme.states || (scheme.state ? [scheme.state] : ['All India / Central']);
  const isNational = schemeStates.some(s => 
    s.toLowerCase().includes('all india') || s.toLowerCase().includes('central')
  );

  if (isNational) {
    score += 15;
    matchedRules.push('Pan-India Central Government Scheme (Available across all States)');
  } else if (state && schemeStates.some(s => s.toLowerCase() === state.toLowerCase())) {
    score += 25; // Bonus for targeted state scheme
    matchedRules.push(`Directly applicable in your state (${state})`);
  } else if (state && !isNational) {
    isPotentiallyEligible = false;
    unmatchedRules.push(`Not available in your state (${state}). Applicable in: ${schemeStates.join(', ')}`);
  }

  // 3. DISTRICT APPLICABILITY (If state matched)
  const schemeDistricts = scheme.districts || ['All Districts'];
  const isAllDistricts = schemeDistricts.some(d => 
    d.toLowerCase().includes('all')
  );

  if (district && !isAllDistricts) {
    if (schemeDistricts.some(d => d.toLowerCase() === district.toLowerCase())) {
      score += 10;
      matchedRules.push(`Notified specifically for your district (${district})`);
    } else {
      isPotentiallyEligible = false;
      unmatchedRules.push(`Targeted to specific districts (${schemeDistricts.join(', ')})`);
    }
  }

  // 4. CROP ALIGNMENT
  const schemeCrops = scheme.applicableCrops || (scheme.eligibility?.applicableCrops) || ['All Crops'];
  const isAllCrops = schemeCrops.some(c => c.toLowerCase().includes('all'));

  if (isAllCrops) {
    score += 10;
    matchedRules.push('Universal scheme covering all field, oilseed, fiber, and grain crops');
  } else if (userCrops.length > 0) {
    const matchedCrops = userCrops.filter(uc => 
      schemeCrops.some(sc => sc.toLowerCase().includes(uc.toLowerCase()) || uc.toLowerCase().includes(sc.toLowerCase()))
    );

    if (matchedCrops.length > 0) {
      score += 20;
      matchedRules.push(`Specifically benefits your crop: ${matchedCrops.join(', ')}`);
    } else {
      score -= 10;
      unmatchedRules.push(`Targeted towards: ${schemeCrops.join(', ')} (Your crops: ${userCrops.join(', ')})`);
    }
  }

  // 5. LANDHOLDING LIMITS
  const minAcres = scheme.eligibility?.landSizeMinAcres || 0;
  const maxAcres = scheme.eligibility?.landSizeMaxAcres || 999;

  if (userLand >= minAcres && userLand <= maxAcres) {
    score += 10;
    matchedRules.push(`Your landholding (${userLand} acres) fits scheme criteria (${minAcres}–${maxAcres} acres)`);
  } else if (userLand > maxAcres) {
    score -= 20;
    unmatchedRules.push(`Your landholding (${userLand} acres) exceeds upper ceiling of ${maxAcres} acres`);
  }

  // 6. FARMER CATEGORY CHECK
  const targetCategories = scheme.farmerCategories || ['All Categories'];
  if (targetCategories.includes('All Categories') || targetCategories.some(c => c.toLowerCase() === userCategory.toLowerCase())) {
    score += 5;
    matchedRules.push(`Category alignment confirmed (${userCategory} category)`);
  } else {
    unmatchedRules.push(`Prioritized for: ${targetCategories.join(', ')}`);
  }

  // 7. IRRIGATION & SPECIAL BOOSTS
  const reqIrrigation = scheme.eligibility?.irrigationRequirement || 'Any';
  if (reqIrrigation === 'Any') {
    // neutral
  } else if (userIrrigation.toLowerCase().includes(reqIrrigation.toLowerCase()) || reqIrrigation.toLowerCase().includes(userIrrigation.toLowerCase())) {
    score += 10;
    matchedRules.push(`Matches your irrigation infrastructure (${userIrrigation})`);
  } else {
    score -= 5;
    unmatchedRules.push(`Requires ${reqIrrigation} irrigation infrastructure`);
  }

  // Calculate final percentage score bounded between 10% and 98%
  const finalScore = isPotentiallyEligible ? Math.min(Math.max(score, 25), 98) : Math.min(score, 30);

  return {
    scheme,
    matchScore: finalScore,
    potentialEligibility: isPotentiallyEligible,
    matchedRules,
    unmatchedRules,
    whyAmISeeingThis: {
      locationMatched: isNational || (state && schemeStates.some(s => s.toLowerCase() === state.toLowerCase())),
      roleMatched: applicableRoles.includes(role),
      cropMatched: isAllCrops || userCrops.some(uc => schemeCrops.some(sc => sc.toLowerCase().includes(uc.toLowerCase()))),
      matchedCriteriaCount: matchedRules.length,
      unmatchedCriteriaCount: unmatchedRules.length
    }
  };
};

/**
 * Evaluates all available schemes against a given profile and returns ranked recommendations
 */
const findEligibleSchemes = (farmerProfile = {}, allSchemes = []) => {
  const evaluations = allSchemes.map(s => evaluateSchemeForProfile(s, farmerProfile));

  // Rank by matchScore descending, putting potentially eligible on top
  const sorted = evaluations.sort((a, b) => {
    if (a.potentialEligibility === b.potentialEligibility) {
      return b.matchScore - a.matchScore;
    }
    return a.potentialEligibility ? -1 : 1;
  });

  const potentiallyEligible = sorted.filter(s => s.potentialEligibility);

  return {
    userProfile: {
      name: farmerProfile.name,
      role: farmerProfile.role,
      state: farmerProfile.state,
      district: farmerProfile.district,
      village: farmerProfile.village,
      primaryCrops: farmerProfile.farmerDetails?.primaryCrops || farmerProfile.primaryCrops || [],
      landSizeAcres: farmerProfile.farmerDetails?.landSizeAcres || farmerProfile.landSizeAcres || 0
    },
    totalEvaluated: allSchemes.length,
    eligibleCount: potentiallyEligible.length,
    schemes: sorted,
    disclaimer: 'Potentially eligible based on the information in your profile. Final eligibility is determined by the concerned government authority.'
  };
};

module.exports = {
  findEligibleSchemes,
  evaluateSchemeForProfile
};
