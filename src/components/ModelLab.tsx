import React, { useState, useMemo } from 'react';
import { MODEL_BENCHMARKS, PIPELINE_STEPS, computeEconomicsAtThreshold } from '../data/mlPipeline';
import { Binary, Layers, DollarSign, Sliders, CheckCircle, TrendingUp, AlertCircle, Info } from 'lucide-react';

export const ModelLab: React.FC = () => {
  // Business cost sliders
  const [costFN, setCostFN] = useState<number>(650); // LTV loss of missed churner
  const [costFP, setCostFP] = useState<number>(45); // Cost of retention offer/perk
  const [successRate, setSuccessRate] = useState<number>(0.40); // 40% retention effectiveness
  const [threshold, setThreshold] = useState<number>(0.35); // Decision threshold

  // Compute economics
  const economics = useMemo(() => {
    return computeEconomicsAtThreshold(threshold, costFN, costFP, successRate, 2000);
  }, [threshold, costFN, costFP, successRate]);

  const { currentPoint, optimalThreshold, curve } = economics;

  // Max net savings in curve
  const maxSavingsPoint = curve.find(p => p.threshold === optimalThreshold) || currentPoint;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Model Evaluation & Business Cost Curve</h1>
            <span className="text-xs text-indigo-400 font-mono">Scikit-learn Pipeline & XGBoost</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-validated benchmark comparison, class imbalance strategy, and cost-benefit threshold optimization
          </p>
        </div>
      </div>

      {/* SECTION 1: Business Cost-Benefit Threshold Optimizer (Interactive Standout Feature) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Business Cost Curve & Threshold Optimizer</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Default 0.50 threshold is commercially sub-optimal: missing a churner costs ${costFN} vs a retention offer of ${costFP}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded-md text-xs font-mono text-emerald-300">
              Optimal Threshold: <strong>T* = {optimalThreshold.toFixed(2)}</strong> (Max ROI)
            </div>
          </div>
        </div>

        {/* 3 Parameter Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 text-xs">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-slate-300 font-medium">Cost of False Negative (Customer LTV Loss)</span>
              <span className="font-mono font-semibold text-rose-400">${costFN}</span>
            </div>
            <input
              type="range"
              min="300"
              max="1200"
              step="50"
              value={costFN}
              onChange={e => setCostFN(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Unintercepted churner average lifetime revenue loss</span>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-slate-300 font-medium">Cost of False Positive (Retention Incentive)</span>
              <span className="font-mono font-semibold text-amber-400">${costFP}</span>
            </div>
            <input
              type="range"
              min="15"
              max="150"
              step="5"
              value={costFP}
              onChange={e => setCostFP(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Cost of offer sent to non-churner (discount/perk)</span>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-slate-300 font-medium">Intervention Success Rate</span>
              <span className="font-mono font-semibold text-emerald-400">{(successRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.70"
              step="0.05"
              value={successRate}
              onChange={e => setSuccessRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Percentage of contacted churners who accept and stay</span>
          </div>
        </div>

        {/* Threshold Slider */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-200 font-medium">Select Model Decision Threshold:</span>
              <span className="text-base font-bold font-mono text-indigo-400 tabular-nums">
                {currentPoint.threshold.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400">Recall: <strong className="text-rose-400">{currentPoint.recall}%</strong></span>
              <span className="text-slate-400">Precision: <strong className="text-indigo-400">{currentPoint.precision}%</strong></span>
              <span className="text-slate-400">F1: <strong className="text-emerald-400">{currentPoint.f1}%</strong></span>
            </div>
          </div>

          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0.05 (High Recall, Aggressive Intervention)</span>
            <span className="text-emerald-400 font-semibold">T* = {optimalThreshold.toFixed(2)} (Economic Peak)</span>
            <span className="text-slate-400">0.50 (Default Naive)</span>
            <span>0.95 (High Precision, Strict)</span>
          </div>
        </div>

        {/* Dynamic ROI Metrics & Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Financial Ledger (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Financial Impact on 2,000 Test Accounts
            </h3>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-900 border border-slate-800 rounded p-3">
                <span className="text-[11px] text-slate-400">Avoided Churn Revenue</span>
                <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-1">
                  ${currentPoint.avoidedChurnRevenue.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">{currentPoint.retainedCustomers} customers saved</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded p-3">
                <span className="text-[11px] text-slate-400">Campaign Expense</span>
                <div className="text-lg font-bold font-mono tabular-nums text-rose-400 mt-1">
                  ${currentPoint.interventionExpense.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">{currentPoint.tp + currentPoint.fp} offers deployed</span>
              </div>

              <div className="bg-slate-900 border border-emerald-900/60 rounded p-3">
                <span className="text-[11px] text-emerald-300 font-medium">Net Business ROI</span>
                <div className="text-lg font-bold font-mono tabular-nums text-emerald-300 mt-1">
                  ${currentPoint.netBusinessSavings.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-500">
                  {currentPoint.threshold === optimalThreshold ? '★ Global Maximum' : `$${(maxSavingsPoint.netBusinessSavings - currentPoint.netBusinessSavings).toLocaleString()} sub-optimal`}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">The Business Logic: </strong>
              At threshold <strong>{currentPoint.threshold.toFixed(2)}</strong>, the model flags {currentPoint.tp + currentPoint.fp} accounts. We prevent {currentPoint.retainedCustomers} churners from defecting, protecting ${currentPoint.avoidedChurnRevenue.toLocaleString()} in LTV. 
              {currentPoint.threshold > 0.45 && (
                <span className="text-amber-400 font-medium"> Using the standard 0.50 threshold leaves money on the table because False Negatives are 14.4x more costly than False Positives!</span>
              )}
            </div>
          </div>

          {/* Right: Dynamic Confusion Matrix (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Confusion Matrix (Threshold = {currentPoint.threshold.toFixed(2)})
              </h3>
              <span className="text-xs text-slate-500 font-mono">Test N = 2,000</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              {/* True Positive */}
              <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="font-semibold">True Positive (TP)</span>
                  <span className="text-[10px] font-mono">Targeted & Churned</span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                  {currentPoint.tp}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Saved: {currentPoint.retainedCustomers} accounts (${currentPoint.avoidedChurnRevenue.toLocaleString()})
                </div>
              </div>

              {/* False Positive */}
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3">
                <div className="flex items-center justify-between text-amber-300">
                  <span className="font-semibold">False Positive (FP)</span>
                  <span className="text-[10px] font-mono">Unneeded Offer</span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                  {currentPoint.fp}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Incentive Cost: ${(currentPoint.fp * costFP).toLocaleString()}
                </div>
              </div>

              {/* False Negative */}
              <div className="bg-rose-950/30 border border-rose-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between text-rose-300">
                  <span className="font-semibold">False Negative (FN)</span>
                  <span className="text-[10px] font-mono text-rose-400">CRITICAL COST</span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
                  {currentPoint.fn}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Missed LTV Loss: ${(currentPoint.fn * costFN).toLocaleString()}
                </div>
              </div>

              {/* True Negative */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">True Negative (TN)</span>
                  <span className="text-[10px] font-mono">Quiet Loyalists</span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-200 mt-1">
                  {currentPoint.tn}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Zero intervention cost incurred
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual ROI Curve Preview */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Net Financial Savings ($) across Threshold spectrum</span>
            <span className="font-mono text-emerald-400">Peak ROI: ${maxSavingsPoint.netBusinessSavings.toLocaleString()} at T={optimalThreshold.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-19 gap-1 h-12 items-end bg-slate-950/60 border border-slate-800 rounded p-2">
            {curve.map(pt => {
              const heightPct = Math.max(10, Math.min(100, (pt.netBusinessSavings / maxSavingsPoint.netBusinessSavings) * 100));
              const isSelected = pt.threshold === currentPoint.threshold;
              const isPeak = pt.threshold === optimalThreshold;

              return (
                <div
                  key={pt.threshold}
                  onClick={() => setThreshold(pt.threshold)}
                  title={`T=${pt.threshold}: Net $${pt.netBusinessSavings.toLocaleString()} (Recall: ${pt.recall}%)`}
                  className={`w-full rounded-xs cursor-pointer transition-all ${
                    isPeak
                      ? 'bg-emerald-400 ring-1 ring-emerald-300'
                      : isSelected
                      ? 'bg-indigo-500 ring-1 ring-white'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.05</span>
            <span>0.25</span>
            <span className="text-emerald-400 font-semibold">T*={optimalThreshold.toFixed(2)}</span>
            <span>0.50 (Default)</span>
            <span>0.75</span>
            <span>0.95</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: 3-Model Benchmark Comparison */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">Model Benchmark Matrix (5-Fold Stratified CV)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating Logistic Regression, Random Forest, and XGBoost on Telco Churn test partition
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Class Weights & Stratified K-Fold</span>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {MODEL_BENCHMARKS.map(model => {
            const isChampion = model.name.includes('XGBoost');

            return (
              <div
                key={model.name}
                className={`rounded-lg p-5 space-y-4 border transition-all ${
                  isChampion
                    ? 'bg-indigo-950/20 border-indigo-500/60 shadow-xs'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{model.name}</h3>
                    <span className="text-[11px] text-slate-400">{model.tag}</span>
                  </div>
                  {isChampion && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 rounded">
                      CHAMPION
                    </span>
                  )}
                </div>

                {/* Primary Metric Grid */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-slate-900 border border-slate-800 rounded p-2">
                    <span className="text-[10px] text-slate-400 block font-sans">Recall</span>
                    <span className="text-base font-bold text-rose-400 tabular-nums">{model.recall}%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded p-2">
                    <span className="text-[10px] text-slate-400 block font-sans">PR-AUC</span>
                    <span className="text-base font-bold text-indigo-400 tabular-nums">{model.prAuc}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded p-2">
                    <span className="text-[10px] text-slate-400 block font-sans">ROC-AUC</span>
                    <span className="text-base font-bold text-emerald-400 tabular-nums">{model.rocAuc}</span>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="space-y-1.5 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Accuracy:</span>
                    <span className="font-mono text-slate-200 tabular-nums">{model.accuracy}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Precision:</span>
                    <span className="font-mono text-slate-200 tabular-nums">{model.precision}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>F1-Score:</span>
                    <span className="font-mono text-slate-200 tabular-nums">{model.f1Score}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>CV Training Time:</span>
                    <span className="font-mono text-slate-200">{model.trainingTime}</span>
                  </div>
                </div>

                {/* Hyperparameters Snippet */}
                <div className="bg-slate-900/90 border border-slate-800 rounded p-2.5 space-y-1 font-mono text-[11px]">
                  <span className="text-slate-400 font-sans font-medium text-xs block">Best GridSearchCV Config:</span>
                  {Object.entries(model.hyperparameters).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-slate-300">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-indigo-300 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div><strong className="text-emerald-400">Strengths:</strong> {model.pros}</div>
                  <div><strong className="text-amber-400">Limitations:</strong> {model.cons}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Deep Dive Explanations (Interview Standouts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deep Dive 1: Why Recall Matters for Churn */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <h3 className="text-sm font-semibold text-white">Why Recall & PR-AUC Matter Over Accuracy</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In the Telco dataset, only <strong>26.5% of customers churn</strong>. A naive baseline that predicts "No Churn" for every customer automatically achieves <strong>73.5% accuracy</strong> while catching exactly 0 churners.
          </p>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded text-xs text-slate-300 space-y-1.5 font-mono">
            <div className="text-indigo-300 font-bold font-sans">The Cost Asymmetry:</div>
            <div>• Cost of False Negative (FN) = Lost Customer LTV ≈ $650</div>
            <div>• Cost of False Positive (FP) = Retention Incentive ≈ $45</div>
            <div>• Asymmetry Ratio: FN is <strong>14.4x more costly</strong> than FP!</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Because False Negatives are catastrophically more expensive than False Positives, optimizing for <strong>Recall and PR-AUC</strong> directly protects the company’s bottom line.
          </p>
        </div>

        {/* Deep Dive 2: SMOTE vs Class Weights */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Info className="w-4 h-4 shrink-0" />
            <h3 className="text-sm font-semibold text-white">Class Imbalance: SMOTE vs Cost-Sensitive Weights</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Many junior submissions blindly apply SMOTE over-sampling. In a production pipeline with high-dimensional one-hot encoded categorical features (16 categorical fields = 30 binary columns), SMOTE generates synthetic continuous coordinates that do not correspond to valid real-world customer combinations.
          </p>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded text-xs text-slate-300 space-y-1.5 font-mono">
            <div className="text-emerald-300 font-bold font-sans">Our Production Solution:</div>
            <div>• Configured <code className="text-indigo-300 font-bold">scale_pos_weight = 2.76</code> in XGBoost</div>
            <div>• Penalizes minority misclassification directly in the gradient loss function</div>
            <div>• Zero artificial interpolation artifacts or synthetic data leakage</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cost-sensitive loss weighting achieves an 82.4% test recall while maintaining true empirical distributions.
          </p>
        </div>
      </div>

      {/* SECTION 4: Scikit-learn Pipeline Steps Architecture */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Production Scikit-Learn Pipeline Architecture</h2>
        </div>
        <p className="text-xs text-slate-400">
          End-to-end preprocessing, column transformation, hyperparameter search, and serialization
        </p>

        <div className="space-y-3 pt-2">
          {PIPELINE_STEPS.map((s, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">{s.step}</span>
                <span className="text-xs font-mono text-slate-400">{s.library}</span>
              </div>
              <p className="text-xs text-slate-300">{s.description}</p>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-400 truncate">
                {s.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
