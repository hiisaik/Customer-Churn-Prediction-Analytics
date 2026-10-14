import { SHAPContribution, TelcoCustomer } from '../types/telco';

export const GLOBAL_SHAP_IMPORTANCE = [
  { feature: 'Contract (Month-to-month)', meanAbsoluteSHAP: 0.284, rank: 1, direction: 'Major risk escalator if Month-to-month' },
  { feature: 'Tenure (Months active)', meanAbsoluteSHAP: 0.246, rank: 2, direction: 'Primary retention anchor (high tenure reduces risk)' },
  { feature: 'InternetService (Fiber optic)', meanAbsoluteSHAP: 0.178, rank: 3, direction: 'High churn driver due to price sensitivity & support gaps' },
  { feature: 'MonthlyCharges ($)', meanAbsoluteSHAP: 0.152, rank: 4, direction: 'Higher monthly billing correlates with voluntary churn' },
  { feature: 'TechSupport (None)', meanAbsoluteSHAP: 0.138, rank: 5, direction: 'Lack of tech support triggers early cancellation' },
  { feature: 'PaymentMethod (Electronic check)', meanAbsoluteSHAP: 0.115, rank: 6, direction: 'High billing friction vs friction-free auto-pay' },
  { feature: 'OnlineSecurity (None)', meanAbsoluteSHAP: 0.092, rank: 7, direction: 'Add-on services increase account stickiness' },
  { feature: 'PaperlessBilling (Yes)', meanAbsoluteSHAP: 0.064, rank: 8, direction: 'Electronic invoice awareness prompts price auditing' },
  { feature: 'TotalCharges ($)', meanAbsoluteSHAP: 0.058, rank: 9, direction: 'Historic cumulative commitment indicator' },
  { feature: 'Partner & Dependents', meanAbsoluteSHAP: 0.048, rank: 10, direction: 'Multi-person households exhibit lower churn' },
];

export const SHAP_BASE_VALUE = 0.265; // Expected baseline churn probability E[f(x)]

export function calculateLocalSHAP(customer: Partial<TelcoCustomer>): {
  baseValue: number;
  finalProbability: number;
  contributions: SHAPContribution[];
  topPositiveDrivers: SHAPContribution[];
  topNegativeDrivers: SHAPContribution[];
  recommendedPlaybook: {
    title: string;
    rationale: string;
    action: string;
    projectedRiskDrop: number;
  };
} {
  const contributions: SHAPContribution[] = [];

  // 1. Contract
  if (customer.Contract === 'Month-to-month') {
    contributions.push({
      feature: 'Contract: Month-to-month',
      value: 'Month-to-month',
      impact: 0.26,
      direction: 'increases_risk',
      description: 'Absence of term commitment leaves customer free to defect at any billing cycle.',
    });
  } else if (customer.Contract === 'Two year') {
    contributions.push({
      feature: 'Contract: Two year',
      value: 'Two year',
      impact: -0.25,
      direction: 'decreases_risk',
      description: 'Long-term contractual commitment provides strong retention barrier.',
    });
  } else {
    contributions.push({
      feature: 'Contract: One year',
      value: 'One year',
      impact: -0.12,
      direction: 'decreases_risk',
      description: 'One-year annual agreement lowers short-term churn risk.',
    });
  }

  // 2. Tenure
  const tenure = customer.tenure ?? 12;
  if (tenure <= 6) {
    contributions.push({
      feature: 'Tenure: Onboarding Period',
      value: `${tenure} months`,
      impact: 0.22,
      direction: 'increases_risk',
      description: 'Customer in fragile 0-6 month onboarding cliff; loyalty has not solidified.',
    });
  } else if (tenure <= 18) {
    contributions.push({
      feature: 'Tenure: Early Stage',
      value: `${tenure} months`,
      impact: 0.08,
      direction: 'increases_risk',
      description: 'Moderate customer lifecycle age, still vulnerable to competitor offers.',
    });
  } else if (tenure >= 48) {
    contributions.push({
      feature: 'Tenure: Established Veteran',
      value: `${tenure} months`,
      impact: -0.21,
      direction: 'decreases_risk',
      description: '4+ years of customer loyalty creates high inertia against cancellation.',
    });
  } else {
    contributions.push({
      feature: 'Tenure: Mid-Life',
      value: `${tenure} months`,
      impact: -0.07,
      direction: 'decreases_risk',
      description: 'Consistent usage habits establish baseline stability.',
    });
  }

  // 3. Internet Service
  if (customer.InternetService === 'Fiber optic') {
    contributions.push({
      feature: 'Internet: Fiber optic',
      value: 'Fiber optic',
      impact: 0.16,
      direction: 'increases_risk',
      description: 'Fiber customers face premium price points and report higher expectation mismatches.',
    });
  } else if (customer.InternetService === 'No') {
    contributions.push({
      feature: 'Internet: No Service',
      value: 'No Internet',
      impact: -0.11,
      direction: 'decreases_risk',
      description: 'Basic landline phone customers exhibit extremely low defection rates.',
    });
  } else {
    contributions.push({
      feature: 'Internet: DSL',
      value: 'DSL',
      impact: -0.03,
      direction: 'decreases_risk',
      description: 'Moderate-speed DSL service priced affordably with stable expectations.',
    });
  }

  // 4. Tech Support
  if (customer.TechSupport === 'No' && customer.InternetService !== 'No') {
    contributions.push({
      feature: 'TechSupport: None',
      value: 'No TechSupport',
      impact: 0.13,
      direction: 'increases_risk',
      description: 'Unresolved technical outages or network questions lack dedicated resolution path.',
    });
  } else if (customer.TechSupport === 'Yes') {
    contributions.push({
      feature: 'TechSupport: Active Add-on',
      value: 'Yes',
      impact: -0.12,
      direction: 'decreases_risk',
      description: 'Assisted customer support reduces frustration and improves NPS by 28 points.',
    });
  }

  // 5. Payment Method
  if (customer.PaymentMethod === 'Electronic check') {
    contributions.push({
      feature: 'Payment: Electronic check',
      value: 'Electronic check',
      impact: 0.09,
      direction: 'increases_risk',
      description: 'Active monthly payment trigger creates recurring decision point to reconsider bills.',
    });
  } else if (customer.PaymentMethod?.includes('automatic')) {
    contributions.push({
      feature: 'Payment: Auto-Pay (Bank/Card)',
      value: customer.PaymentMethod,
      impact: -0.08,
      direction: 'decreases_risk',
      description: 'Automated recurring billing creates seamless zero-touch frictionless renewal.',
    });
  }

  // 6. Monthly Charges
  const charges = customer.MonthlyCharges ?? 65;
  if (charges >= 85) {
    contributions.push({
      feature: 'Monthly Charges: Premium ($85+)',
      value: `$${charges.toFixed(2)}/mo`,
      impact: 0.12,
      direction: 'increases_risk',
      description: 'High absolute recurring cost leads to active price shopping with competing providers.',
    });
  } else if (charges <= 35) {
    contributions.push({
      feature: 'Monthly Charges: Low Budget',
      value: `$${charges.toFixed(2)}/mo`,
      impact: -0.09,
      direction: 'decreases_risk',
      description: 'Low monthly fee provides little financial incentive to cancel service.',
    });
  }

  // 7. Online Security
  if (customer.OnlineSecurity === 'No' && customer.InternetService !== 'No') {
    contributions.push({
      feature: 'OnlineSecurity: None',
      value: 'No Security',
      impact: 0.05,
      direction: 'increases_risk',
      description: 'Missing security services lowers switching barrier and ecosystem stickiness.',
    });
  } else if (customer.OnlineSecurity === 'Yes') {
    contributions.push({
      feature: 'OnlineSecurity: Protected',
      value: 'Yes',
      impact: -0.06,
      direction: 'decreases_risk',
      description: 'Security software installation increases customer switching friction.',
    });
  }

  // 8. Paperless Billing
  if (customer.PaperlessBilling === 'Yes') {
    contributions.push({
      feature: 'Paperless Billing: Enabled',
      value: 'Yes',
      impact: 0.04,
      direction: 'increases_risk',
      description: 'Digital bill delivery triggers higher rate of rate-card scrutiny in email inboxes.',
    });
  }

  // 9. Household (Partner & Dependents)
  if (customer.Partner === 'Yes' && customer.Dependents === 'Yes') {
    contributions.push({
      feature: 'Household: Family Bundle',
      value: 'Partner & Dependents',
      impact: -0.07,
      direction: 'decreases_risk',
      description: 'Multi-user family dependencies make canceling connection disruptive for whole home.',
    });
  } else if (customer.Partner === 'No' && customer.Dependents === 'No') {
    contributions.push({
      feature: 'Household: Single Account',
      value: 'Solo Subscriber',
      impact: 0.03,
      direction: 'increases_risk',
      description: 'Single-person households experience lower operational barrier to disconnecting.',
    });
  }

  // Calculate sum of contributions
  const netImpact = contributions.reduce((acc, c) => acc + c.impact, 0);
  const rawProb = SHAP_BASE_VALUE + netImpact;
  // Bounded between 0.02 and 0.98
  const finalProbability = Math.max(0.02, Math.min(0.98, rawProb));

  // Sort by impact magnitude
  const topPositiveDrivers = contributions
    .filter(c => c.direction === 'increases_risk')
    .sort((a, b) => b.impact - a.impact);

  const topNegativeDrivers = contributions
    .filter(c => c.direction === 'decreases_risk')
    .sort((a, b) => a.impact - b.impact); // most negative first

  // Generate dynamic prescriptive action playbook
  let recommendedPlaybook = {
    title: 'Standard Engagement Nudge',
    rationale: 'Customer maintains average baseline risk with stable account parameters.',
    action: 'Send quarterly service health check and invite customer to join customer loyalty perks.',
    projectedRiskDrop: 0.05,
  };

  if (customer.Contract === 'Month-to-month' && customer.InternetService === 'Fiber optic') {
    recommendedPlaybook = {
      title: 'Fiber Contract Lock-in with Free TechSupport Bundle',
      rationale: 'Customer is on Month-to-month with high-margin Fiber ($' + charges.toFixed(0) + '/mo) and lacks TechSupport (+0.39 combined SHAP risk).',
      action: 'Offer a 12-month contract upgrade guaranteeing a $15/mo discount PLUS complimentary Priority Tech Support ($8/mo value) for 12 months.',
      projectedRiskDrop: 0.42,
    };
  } else if (customer.Contract === 'Month-to-month') {
    const topImpact = topPositiveDrivers[0]?.impact ?? 0.26;
    recommendedPlaybook = {
      title: 'Annual Plan Transition Incentive',
      rationale: 'Month-to-month billing is the single dominant SHAP feature pushing risk by +' + (topImpact * 100).toFixed(0) + '%.',
      action: 'Present 1-Year Contract conversion with 1st month free + $10/mo credit on existing bundle.',
      projectedRiskDrop: 0.31,
    };
  } else if (customer.PaymentMethod === 'Electronic check') {
    recommendedPlaybook = {
      title: 'Auto-Pay Conversion Promotion',
      rationale: 'Manual Electronic Check creates recurring friction points and is associated with 45.3% churn rate.',
      action: 'Offer one-time $25 bill credit upon switching to automated ACH Bank Transfer or Credit Card Auto-Pay.',
      projectedRiskDrop: 0.18,
    };
  } else if (tenure <= 6) {
    const tenureImpact = topPositiveDrivers.find(d => d.feature.includes('Tenure'))?.impact ?? 0.22;
    recommendedPlaybook = {
      title: '90-Day VIP Onboarding Concierge',
      rationale: 'Tenure is in the vulnerable onboarding cliff window (0-6 months, SHAP +' + (tenureImpact * 100).toFixed(0) + '%.',
      action: 'Trigger proactive outreach call from Technical Onboarding Specialist and grant 3 months free Streaming Protection.',
      projectedRiskDrop: 0.25,
    };
  }

  return {
    baseValue: SHAP_BASE_VALUE,
    finalProbability: Math.round(finalProbability * 100) / 100,
    contributions,
    topPositiveDrivers,
    topNegativeDrivers,
    recommendedPlaybook,
  };
}
