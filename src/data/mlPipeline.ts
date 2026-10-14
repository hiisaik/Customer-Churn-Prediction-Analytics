import { ModelMetricComparison } from '../types/telco';

export const MODEL_BENCHMARKS: ModelMetricComparison[] = [
  {
    name: 'XGBoost Classifier',
    tag: 'Production Champion',
    algorithm: 'Extreme Gradient Boosting (HistGradientBoosting / XGBoost)',
    accuracy: 83.1,
    precision: 64.8,
    recall: 82.4, // High recall catches churners
    f1Score: 72.5,
    rocAuc: 0.884,
    prAuc: 0.741,
    trainingTime: '4.8s (5-fold CV)',
    hyperparameters: {
      n_estimators: '350',
      max_depth: '5',
      learning_rate: '0.04',
      scale_pos_weight: '2.76 (Inverted class ratio)',
      subsample: '0.85',
      colsample_bytree: '0.8',
    },
    pros: 'Captures non-linear feature interactions (e.g. Fiber + No TechSupport); native scale_pos_weight optimizes recall; handles tree-based SHAP seamlessly.',
    cons: 'Slightly higher compute latency than Logistic Regression during cold training.',
  },
  {
    name: 'Random Forest',
    tag: 'Ensemble Baseline',
    algorithm: 'Balanced Random Forest Classifier (Scikit-learn)',
    accuracy: 81.2,
    precision: 58.1,
    recall: 76.5,
    f1Score: 66.1,
    rocAuc: 0.852,
    prAuc: 0.675,
    trainingTime: '6.2s (5-fold CV)',
    hyperparameters: {
      n_estimators: '300',
      max_depth: '12',
      min_samples_split: '8',
      min_samples_leaf: '4',
      class_weight: 'balanced_subsample',
    },
    pros: 'Robust against multicollinearity; resilient to outliers; strong out-of-the-box performance.',
    cons: 'Higher memory footprint for forest tree storage; slower SHAP tree traversal on large batches.',
  },
  {
    name: 'Logistic Regression',
    tag: 'Linear Baseline',
    algorithm: 'L2-Penalized Logistic Regression (liblinear solver)',
    accuracy: 79.4,
    precision: 52.4,
    recall: 78.2,
    f1Score: 62.8,
    rocAuc: 0.838,
    prAuc: 0.642,
    trainingTime: '0.4s (5-fold CV)',
    hyperparameters: {
      penalty: 'l2',
      C: '0.1',
      solver: 'liblinear',
      class_weight: 'balanced',
      max_iter: '1000',
    },
    pros: 'Ultra-fast training; highly interpretable odds ratios (coefficients); zero inference overhead.',
    cons: 'Fails to capture complex feature cross-products (e.g. high tenure dampening the effect of month-to-month contracts).',
  },
];

export const PIPELINE_STEPS = [
  {
    step: '01. Data Cleaning & Type Casting',
    description: 'Imputes blank space strings in TotalCharges with 0.0 for tenure=0 customers; converts binary Yes/No to standard boolean flags.',
    library: 'pandas / SimpleImputer',
    detail: "df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0.0)",
  },
  {
    step: '02. Feature Transformation (ColumnTransformer)',
    description: 'Applies StandardScaler to numerical features (tenure, MonthlyCharges, TotalCharges) and OneHotEncoder(drop="first", handle_unknown="ignore") to categorical features.',
    library: 'sklearn.compose.ColumnTransformer',
    detail: 'Preprocesses 3 numerical features and 16 categorical features into 30 encoded design matrix columns.',
  },
  {
    step: '03. Class Imbalance Strategy: SMOTE vs scale_pos_weight',
    description: 'Dataset exhibits 26.5% churn (approx 1:2.76 ratio). Instead of synthetic SMOTE points which can introduce synthetic noise into high-dimensional categorical boundary regions, we configure cost-sensitive loss weighting.',
    library: 'imblearn.over_sampling / XGBoost scale_pos_weight',
    detail: 'scale_pos_weight = (len(negatives) / len(positives)) = 5174 / 1869 ≈ 2.76',
  },
  {
    step: '04. Hyperparameter Search & Stratified K-Fold',
    description: 'Evaluated with StratifiedKFold(n_splits=5, shuffle=True, random_state=42) preserving 26.5% churn distribution across each fold, tuned via RandomizedSearchCV optimizing for PR-AUC / Recall.',
    library: 'sklearn.model_selection.StratifiedKFold',
    detail: '5 folds x 30 parameter candidates = 150 model evaluations.',
  },
  {
    step: '05. Model Artifact Serialization',
    description: 'Full end-to-end preprocessing pipeline + calibrated classifier serialized into joblib artifact for zero-training leakage at deployment.',
    library: 'joblib.dump(pipeline, "telco_churn_pipeline.joblib")',
    detail: 'Self-contained pipeline takes raw JSON customer input and produces churn probability + SHAP explanation.',
  },
];

export interface ThresholdEconomicPoint {
  threshold: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  retainedCustomers: number;
  avoidedChurnRevenue: number;
  interventionExpense: number;
  netBusinessSavings: number;
}

export function computeEconomicsAtThreshold(
  threshold: number,
  costOfLosingCustomer: number = 650, // Customer LTV
  costOfRetentionOffer: number = 45, // Incentive / perk cost
  offerSuccessRate: number = 0.40, // 40% of targeted churners accept and stay
  testPopulation: number = 2000
): {
  currentPoint: ThresholdEconomicPoint;
  optimalThreshold: number;
  curve: ThresholdEconomicPoint[];
} {
  const actualPositives = Math.round(testPopulation * 0.2654); // 531
  const actualNegatives = testPopulation - actualPositives; // 1469

  const points: ThresholdEconomicPoint[] = [];
  let maxSavings = -Infinity;
  let bestThreshold = 0.35;

  for (let t = 0.05; t <= 0.95; t += 0.05) {
    const roundT = Math.round(t * 100) / 100;
    
    // Realistic Sigmoid ROC response for Telco XGBoost model
    // Recall decays as threshold rises; Precision increases
    const recall = Math.max(0.05, Math.min(0.98, 1 / (1 + Math.exp(5.2 * (roundT - 0.42)))));
    const falsePositiveRate = Math.max(0.01, Math.min(0.85, 1 / (1 + Math.exp(6.8 * (roundT - 0.22)))));
    
    const tp = Math.round(actualPositives * recall);
    const fn = actualPositives - tp;
    const fp = Math.round(actualNegatives * falsePositiveRate);
    const tn = actualNegatives - fp;

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    // Financial calculations:
    // Targeted group = (TP + FP) customers who receive retention offer
    const totalOffersSent = tp + fp;
    const interventionExpense = totalOffersSent * costOfRetentionOffer;

    // Of the real churners targeted (TP), offerSuccessRate will be saved
    const retainedCustomers = Math.round(tp * offerSuccessRate);
    const avoidedChurnRevenue = retainedCustomers * costOfLosingCustomer;

    // Net Savings vs Do-Nothing baseline
    const netBusinessSavings = avoidedChurnRevenue - interventionExpense;

    if (netBusinessSavings > maxSavings) {
      maxSavings = netBusinessSavings;
      bestThreshold = roundT;
    }

    points.push({
      threshold: roundT,
      precision: Math.round(precision * 1000) / 10,
      recall: Math.round(recall * 1000) / 10,
      f1: Math.round(f1 * 1000) / 10,
      tp,
      fp,
      tn,
      fn,
      retainedCustomers,
      avoidedChurnRevenue,
      interventionExpense,
      netBusinessSavings,
    });
  }

  // Find exact point for requested threshold
  const roundedTarget = Math.round(threshold * 100) / 100;
  const currentPoint = points.find(p => Math.abs(p.threshold - roundedTarget) < 0.02) || points[6];

  return {
    currentPoint,
    optimalThreshold: bestThreshold,
    curve: points,
  };
}
