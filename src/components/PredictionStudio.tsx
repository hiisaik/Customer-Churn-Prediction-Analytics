import React, { useState, useMemo } from 'react';
import { TelcoCustomer } from '../types/telco';
import { SAMPLE_CUSTOMERS } from '../data/telcoData';
import { calculateLocalSHAP, GLOBAL_SHAP_IMPORTANCE, SHAP_BASE_VALUE } from '../data/shapEngine';
import { Sliders, Sparkles, TrendingUp, TrendingDown, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';

interface PredictionStudioProps {
  initialCustomer?: TelcoCustomer | null;
}

export const PredictionStudio: React.FC<PredictionStudioProps> = ({ initialCustomer }) => {
  // Preset profiles for instant demo testing
  const presets = useMemo(() => [
    {
      id: 'critical_fiber',
      label: 'Critical Risk: New Fiber M2M',
      customer: SAMPLE_CUSTOMERS.find(c => c.customerID === '9305-CDSKC') || SAMPLE_CUSTOMERS[5],
    },
    {
      id: 'senior_risk',
      label: 'High Risk: Senior Citizen (No Tech Support)',
      customer: SAMPLE_CUSTOMERS.find(c => c.customerID === '8779-QRDMV') || SAMPLE_CUSTOMERS[20],
    },
    {
      id: 'loyal_vip',
      label: 'Low Risk: 5-Year Bundled Family',
      customer: SAMPLE_CUSTOMERS.find(c => c.customerID === '3655-SNQYZ') || SAMPLE_CUSTOMERS[15],
    },
    {
      id: 'moderate_dsl',
      label: 'Moderate: Mid-tenure DSL',
      customer: SAMPLE_CUSTOMERS.find(c => c.customerID === '5575-GNVDE') || SAMPLE_CUSTOMERS[1],
    },
  ], []);

  // Form state initialized with initialCustomer or critical_fiber
  const [customer, setCustomer] = useState<Partial<TelcoCustomer>>(() => {
    return initialCustomer || presets[0].customer;
  });

  const [activeExplainView, setActiveExplainView] = useState<'waterfall' | 'global'>('waterfall');

  // Compute live SHAP values and final predicted probability
  const shapResult = useMemo(() => {
    return calculateLocalSHAP(customer);
  }, [customer]);

  const loadPreset = (presetCustomer: TelcoCustomer) => {
    setCustomer({ ...presetCustomer });
  };

  const handleReset = () => {
    setCustomer({ ...presets[0].customer });
  };

  const probPct = Math.round(shapResult.finalProbability * 100);
  const isHighRisk = probPct >= 60;
  const isModerateRisk = probPct >= 30 && probPct < 60;

  const annualRevAtRisk = Math.round((customer.MonthlyCharges || 65) * 12);

  return (
    <div className="space-y-6">
      {/* Header and Preset Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Live Inference & SHAP Explainability</h1>
            <span className="text-xs text-indigo-400 font-mono">Streamlit-Style Simulator</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time XGBoost probability calculation with exact Shapley value decomposition (TreeExplainer)
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Sample Archetypes:</span>
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.customer)}
              className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={handleReset}
            title="Reset to default"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: Left = Input Controls, Right = Model Output & SHAP Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Feature Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-200">Customer Feature Attributes</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">ID: {customer.customerID || 'CUSTOM-SIM'}</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Contract Type */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Contract Term</label>
              <select
                value={customer.Contract || 'Month-to-month'}
                onChange={e => setCustomer({ ...customer, Contract: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Month-to-month">Month-to-month (High Flexibility / High Churn)</option>
                <option value="One year">One year (Moderate Stability)</option>
                <option value="Two year">Two year (Maximum Retention Barrier)</option>
              </select>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">Customer Tenure (Months)</label>
                <span className="font-mono tabular-nums text-slate-200 font-semibold">{customer.tenure} mos</span>
              </div>
              <input
                type="range"
                min="1"
                max="72"
                value={customer.tenure || 1}
                onChange={e => setCustomer({ ...customer, tenure: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-slate-500 text-[10px] mt-0.5 font-mono">
                <span>1 mo (Cliff)</span>
                <span>24 mos</span>
                <span>48 mos</span>
                <span>72 mos (Veteran)</span>
              </div>
            </div>

            {/* Monthly Charges Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">Monthly Recurring Charges ($)</label>
                <span className="font-mono tabular-nums text-slate-200 font-semibold">${customer.MonthlyCharges?.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="18"
                max="120"
                step="0.5"
                value={customer.MonthlyCharges || 65}
                onChange={e => setCustomer({ ...customer, MonthlyCharges: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-slate-500 text-[10px] mt-0.5 font-mono">
                <span>$18.00 (Phone only)</span>
                <span>$65.00 (Avg)</span>
                <span>$120.00 (Max Bundle)</span>
              </div>
            </div>

            {/* Internet Service */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Internet Service</label>
                <select
                  value={customer.InternetService || 'Fiber optic'}
                  onChange={e => setCustomer({ ...customer, InternetService: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Fiber optic">Fiber optic</option>
                  <option value="DSL">DSL</option>
                  <option value="No">No Internet</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tech Support</label>
                <select
                  value={customer.TechSupport || 'No'}
                  onChange={e => setCustomer({ ...customer, TechSupport: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="No">No Tech Support</option>
                  <option value="Yes">Has Tech Support</option>
                  <option value="No internet service">No Internet</option>
                </select>
              </div>
            </div>

            {/* Payment Method & Paperless */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Payment Method</label>
                <select
                  value={customer.PaymentMethod || 'Electronic check'}
                  onChange={e => setCustomer({ ...customer, PaymentMethod: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Electronic check">Electronic check</option>
                  <option value="Bank transfer (automatic)">Bank transfer (auto)</option>
                  <option value="Credit card (automatic)">Credit card (auto)</option>
                  <option value="Mailed check">Mailed check</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Paperless Billing</label>
                <select
                  value={customer.PaperlessBilling || 'Yes'}
                  onChange={e => setCustomer({ ...customer, PaperlessBilling: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Yes">Yes (Paperless)</option>
                  <option value="No">No (Paper Mail)</option>
                </select>
              </div>
            </div>

            {/* Demographics & Add-ons */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Senior Citizen</label>
                <select
                  value={customer.SeniorCitizen ?? 0}
                  onChange={e => setCustomer({ ...customer, SeniorCitizen: parseInt(e.target.value, 10) as 0 | 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
                >
                  <option value={0}>No (0)</option>
                  <option value={1}>Yes (1)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Partner</label>
                <select
                  value={customer.Partner || 'No'}
                  onChange={e => setCustomer({ ...customer, Partner: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Dependents</label>
                <select
                  value={customer.Dependents || 'No'}
                  onChange={e => setCustomer({ ...customer, Dependents: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Score & SHAP Waterfall (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Prediction Gauge Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Score Metric */}
              <div className="sm:border-r border-slate-800 sm:pr-4">
                <span className="text-xs text-slate-400 font-medium">Predicted Churn Probability</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-4xl font-bold font-mono tabular-nums ${
                      isHighRisk ? 'text-rose-400' : isModerateRisk ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {probPct}%
                  </span>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isHighRisk ? 'text-rose-400' : isModerateRisk ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isHighRisk ? 'Critical Risk' : isModerateRisk ? 'Moderate' : 'Low Risk'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Threshold: 0.35 (Cost-optimal)
                </div>
              </div>

              {/* Revenue at Risk Metric */}
              <div className="sm:border-r border-slate-800 sm:pr-4">
                <span className="text-xs text-slate-400 font-medium">Annual Revenue at Risk</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-200 mt-1">
                  ${annualRevAtRisk.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ${(customer.MonthlyCharges || 65).toFixed(2)}/mo x 12
                </div>
              </div>

              {/* Baseline Comparison */}
              <div>
                <span className="text-xs text-slate-400 font-medium">Population Base Value E[f(x)]</span>
                <div className="text-2xl font-bold font-mono tabular-nums text-indigo-400 mt-1">
                  26.5%
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  {shapResult.finalProbability >= SHAP_BASE_VALUE ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-rose-400" />
                      <span className="text-rose-400 font-mono">+{(shapResult.finalProbability - SHAP_BASE_VALUE).toFixed(2)} SHAP shift</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-mono">{(shapResult.finalProbability - SHAP_BASE_VALUE).toFixed(2)} SHAP shift</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isHighRisk ? 'bg-rose-500' : isModerateRisk ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${probPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0% Safe</span>
                <span className="text-amber-500/80">35% Alert Trigger</span>
                <span>100% Definite Churn</span>
              </div>
            </div>
          </div>

          {/* SHAP Explainability Waterfall Component */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">SHAP Local Force Decomposition</h3>
                  <span className="text-xs text-indigo-400 font-mono">Additive Feature Attribution</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizes exact push factors (increasing churn risk) vs pull factors (reducing churn risk)
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5 text-xs">
                <button
                  onClick={() => setActiveExplainView('waterfall')}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                    activeExplainView === 'waterfall' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Local Waterfall
                </button>
                <button
                  onClick={() => setActiveExplainView('global')}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
                    activeExplainView === 'global' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Global Feature Rank
                </button>
              </div>
            </div>

            {activeExplainView === 'waterfall' ? (
              <div className="space-y-3 pt-1">
                {/* Baseline anchor indicator */}
                <div className="flex items-center justify-between text-xs py-1 px-3 bg-slate-950/70 border border-slate-800 rounded font-mono">
                  <span className="text-slate-400">Baseline E[f(x)] Dataset Churn Mean:</span>
                  <span className="text-indigo-400 font-semibold font-mono tabular-nums">0.265 (26.5%)</span>
                </div>

                {/* Individual SHAP Feature Bars */}
                <div className="space-y-2">
                  {shapResult.contributions
                    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                    .map((item, idx) => {
                      const isRisk = item.impact > 0;
                      const absImpact = Math.abs(item.impact);
                      const barWidth = Math.min(100, Math.round((absImpact / 0.3) * 100));

                      return (
                        <div
                          key={idx}
                          className="bg-slate-950/40 border border-slate-800/80 rounded p-2.5 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-slate-300">{item.feature}</span>
                            <div className="flex items-center gap-2 font-mono tabular-nums">
                              <span className="text-slate-400">{item.value}</span>
                              <span
                                className={`font-semibold ${
                                  isRisk ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                {isRisk ? `+${absImpact.toFixed(2)}` : `-${absImpact.toFixed(2)}`}
                              </span>
                            </div>
                          </div>

                          {/* Relative Bar */}
                          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1">
                            {item.description}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Final Equation Synthesis */}
                <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
                  <span>f(x) = E[f(x)] + ∑ φᵢ</span>
                  <span className="text-slate-200">
                    0.265 {shapResult.finalProbability >= 0.265 ? '+' : '-'} {Math.abs(shapResult.finalProbability - 0.265).toFixed(3)} = <span className="font-bold text-indigo-400">{shapResult.finalProbability}</span>
                  </span>
                </div>
              </div>
            ) : (
              /* Global SHAP Importance View */
              <div className="space-y-2.5 pt-1">
                <p className="text-xs text-slate-400">
                  Global mean absolute SHAP values across all 7,043 customer accounts (TreeExplainer on XGBoost):
                </p>

                <div className="space-y-2 font-mono">
                  {GLOBAL_SHAP_IMPORTANCE.map(item => (
                    <div key={item.rank} className="bg-slate-950/60 border border-slate-800/80 rounded p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 font-sans font-medium">
                          {item.rank}. {item.feature}
                        </span>
                        <span className="text-indigo-400 font-semibold tabular-nums">
                          |φ| = {item.meanAbsoluteSHAP.toFixed(3)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${(item.meanAbsoluteSHAP / 0.3) * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        {item.direction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prescriptive Retention Action Playbook */}
          <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-md text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-indigo-200">
                    Recommended Retention Play: {shapResult.recommendedPlaybook.title}
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    -{(shapResult.recommendedPlaybook.projectedRiskDrop * 100).toFixed(0)}% Risk Lift
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  <strong className="text-slate-200">SHAP Driver Rationale: </strong>
                  {shapResult.recommendedPlaybook.rationale}
                </p>

                <div className="p-3 bg-slate-950/60 border border-indigo-900/40 rounded text-xs text-indigo-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-indigo-300">Action Plan: </span>
                    {shapResult.recommendedPlaybook.action}
                  </div>
                  <button
                    onClick={() => {
                      // Apply simulated intervention to test "What-if"
                      if (customer.Contract === 'Month-to-month') {
                        setCustomer({
                          ...customer,
                          Contract: 'One year',
                          TechSupport: 'Yes',
                          PaymentMethod: 'Bank transfer (automatic)',
                          MonthlyCharges: Math.max(20, (customer.MonthlyCharges || 65) - 15),
                        });
                      }
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <span>Simulate Play</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
