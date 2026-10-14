import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { PredictionStudio } from './components/PredictionStudio';
import { SQLStudio } from './components/SQLStudio';
import { ModelLab } from './components/ModelLab';
import { CustomerSegmentation } from './components/CustomerSegmentation';
import { InterviewKit } from './components/InterviewKit';
import { TelcoCustomer } from './types/telco';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('executive');
  const [selectedCustomer, setSelectedCustomer] = useState<TelcoCustomer | null>(null);

  const handleInspectCustomer = (customer: TelcoCustomer) => {
    setSelectedCustomer(customer);
    setActiveTab('prediction');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'executive' && (
          <ExecutiveDashboard onInspectCustomer={handleInspectCustomer} />
        )}

        {activeTab === 'prediction' && (
          <PredictionStudio initialCustomer={selectedCustomer} />
        )}

        {activeTab === 'sql' && (
          <SQLStudio />
        )}

        {activeTab === 'models' && (
          <ModelLab />
        )}

        {activeTab === 'clusters' && (
          <CustomerSegmentation />
        )}

        {activeTab === 'interview' && (
          <InterviewKit />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Telco Churn Intelligence</span>
            <span>·</span>
            <span>IBM Telco Customer Churn (Kaggle Benchmark)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>XGBoost Champion (82.4% Recall)</span>
            <span>·</span>
            <span>SHAP TreeExplainer</span>
            <span>·</span>
            <span>Cost-Optimal Threshold T*=0.35</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
