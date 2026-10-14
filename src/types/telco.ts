export interface TelcoCustomer {
  customerID: string;
  gender: 'Male' | 'Female';
  SeniorCitizen: 0 | 1;
  Partner: 'Yes' | 'No';
  Dependents: 'Yes' | 'No';
  tenure: number;
  PhoneService: 'Yes' | 'No';
  MultipleLines: 'No phone service' | 'No' | 'Yes';
  InternetService: 'DSL' | 'Fiber optic' | 'No';
  OnlineSecurity: 'No' | 'Yes' | 'No internet service';
  OnlineBackup: 'No' | 'Yes' | 'No internet service';
  DeviceProtection: 'No' | 'Yes' | 'No internet service';
  TechSupport: 'No' | 'Yes' | 'No internet service';
  StreamingTV: 'No' | 'Yes' | 'No internet service';
  StreamingMovies: 'No' | 'Yes' | 'No internet service';
  Contract: 'Month-to-month' | 'One year' | 'Two year';
  PaperlessBilling: 'Yes' | 'No';
  PaymentMethod: 'Electronic check' | 'Mailed check' | 'Bank transfer (automatic)' | 'Credit card (automatic)';
  MonthlyCharges: number;
  TotalCharges: number;
  Churn: 'Yes' | 'No';
  churnProbability: number;
  clusterId: number;
  clusterName: string;
}

export interface SHAPContribution {
  feature: string;
  value: string | number;
  impact: number; // positive increases churn probability, negative decreases
  direction: 'increases_risk' | 'decreases_risk';
  description: string;
}

export interface ModelMetricComparison {
  name: string;
  tag: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  trainingTime: string;
  hyperparameters: Record<string, string>;
  pros: string;
  cons: string;
}

export interface SegmentArchetype {
  id: number;
  name: string;
  code: string;
  sizePercentage: number;
  customerCount: number;
  churnRate: number;
  avgMonthlyCharges: number;
  avgTenure: number;
  revenueAtRisk: number;
  keyTraits: string[];
  recommendedAction: string;
  offerCost: number;
  expectedRetentionLift: number;
  projectedNetSavings: number;
}

export interface SQLPresetQuery {
  id: string;
  title: string;
  category: string;
  description: string;
  sql: string;
}
