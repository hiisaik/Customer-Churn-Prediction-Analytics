import React, { useState, useMemo } from 'react';
import { SAMPLE_CUSTOMERS, TELCO_BENCHMARKS } from '../data/telcoData';
import { TelcoCustomer } from '../types/telco';
import { Search, ArrowUpDown, ChevronRight, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface ExecutiveDashboardProps {
  onInspectCustomer: (customer: TelcoCustomer) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onInspectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contractFilter, setContractFilter] = useState<'All' | 'Month-to-month' | 'One year' | 'Two year'>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');
  const [sortField, setSortField] = useState<'churnProbability' | 'MonthlyCharges' | 'tenure'>('churnProbability');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return SAMPLE_CUSTOMERS.filter(c => {
      if (contractFilter !== 'All' && c.Contract !== contractFilter) return false;
      if (riskFilter === 'High' && c.churnProbability < 0.6) return false;
      if (riskFilter === 'Moderate' && (c.churnProbability < 0.3 || c.churnProbability >= 0.6)) return false;
      if (riskFilter === 'Low' && c.churnProbability >= 0.3) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          c.customerID.toLowerCase().includes(query) ||
          c.InternetService.toLowerCase().includes(query) ||
          c.clusterName.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [contractFilter, riskFilter, searchTerm, sortField, sortAsc]);

  const toggleSort = (field: 'churnProbability' | 'MonthlyCharges' | 'tenure') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Context Note */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Executive BI Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            IBM Telco Customer Churn population benchmark (7,043 accounts) · SQL-engineered business layer
          </p>
        </div>

        {/* Filter Controls (Interactive Buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
            {(['All', 'Month-to-month', 'One year', 'Two year'] as const).map(contract => (
              <button
                key={contract}
                onClick={() => setContractFilter(contract)}
                className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
                  contractFilter === contract
                    ? 'bg-slate-800 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {contract}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
            {(['All', 'High', 'Moderate', 'Low'] as const).map(risk => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
                  riskFilter === risk
                    ? 'bg-slate-800 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {risk} Risk
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 font-medium">Overall Churn Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              {TELCO_BENCHMARKS.overallChurnRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">1,869 churners</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>42.7% in Month-to-Month contracts</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 font-medium">Monthly Revenue at Risk</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
              ${(TELCO_BENCHMARKS.totalRevenueAtRisk / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500 font-mono">/ month</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>30.5% of total MRR ($456.1k)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 font-medium">Onboarding Cliff Rate (0-12m)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-300">
              47.4%
            </span>
            <span className="text-xs text-slate-500 font-mono">1,037 accounts</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>55.5% of all cancellations occur &lt; 12m</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 font-medium">Protected Net Retention Lift</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              +$50.1k
            </span>
            <span className="text-xs text-slate-500 font-mono">monthly ROI</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Via KMeans targeted retention plays</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Churn by Contract Term */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Churn Rate & Revenue by Contract Term</h2>
              <p className="text-xs text-slate-400 mt-0.5">Month-to-month contracts drive 79% of all revenue leakage</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">SQL Aggregated</span>
          </div>

          <div className="space-y-4">
            {TELCO_BENCHMARKS.contractBreakdown.map(contract => (
              <div key={contract.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{contract.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono tabular-nums">
                      ${(contract.revenueAtRisk / 1000).toFixed(1)}k at risk
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-200">
                      {contract.churnRate}% churn
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      contract.churnRate > 35
                        ? 'bg-rose-500'
                        : contract.churnRate > 10
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${contract.churnRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{contract.count.toLocaleString()} customers ({contract.percentage}%)</span>
                  <span>Avg MRR: ${contract.avgCharges.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Tenure Cohort Cliff */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Tenure Cohorts: The 0-12 Month Onboarding Cliff</h2>
              <p className="text-xs text-slate-400 mt-0.5">Accounts surviving past 24 months drop to &lt; 20% churn probability</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Cohort Analysis</span>
          </div>

          <div className="space-y-4">
            {TELCO_BENCHMARKS.tenureCohorts.map(cohort => (
              <div key={cohort.cohort} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{cohort.cohort}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono tabular-nums">
                      {cohort.churnCount} churned / {cohort.count} total
                    </span>
                    <span className={`font-mono tabular-nums font-semibold ${
                      cohort.churnRate > 40 ? 'text-rose-400' : cohort.churnRate > 20 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {cohort.churnRate}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cohort.churnRate > 40
                        ? 'bg-rose-500'
                        : cohort.churnRate > 25
                        ? 'bg-amber-500'
                        : cohort.churnRate > 15
                        ? 'bg-indigo-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${cohort.churnRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Avg bill: ${cohort.avgCharges.toFixed(2)}</span>
                  <span>Cohort share: {((cohort.count / 7043) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Tech Support & Fiber Optic Interaction */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">The Fiber Optic Deficit Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Fiber customers without TechSupport churn at 49.4%</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Service Cross-Product</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950/70 border border-rose-900/40 rounded-lg p-3.5">
              <span className="text-xs text-slate-400">Fiber Optic · No TechSupport</span>
              <div className="text-xl font-bold font-mono tabular-nums text-rose-400 mt-1">49.37%</div>
              <p className="text-xs text-slate-400 mt-1">2,230 accounts · $100.4k MRR at risk</p>
            </div>

            <div className="bg-slate-950/70 border border-emerald-900/40 rounded-lg p-3.5">
              <span className="text-xs text-slate-400">Fiber Optic · With TechSupport</span>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">22.63%</div>
              <p className="text-xs text-slate-400 mt-1">866 accounts · -26.7% risk drop</p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
              <span className="text-xs text-slate-400">DSL · No TechSupport</span>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">27.76%</div>
              <p className="text-xs text-slate-400 mt-1">1,243 accounts · $18.5k MRR at risk</p>
            </div>

            <div className="bg-slate-950/70 border border-emerald-900/40 rounded-lg p-3.5">
              <span className="text-xs text-slate-400">DSL · With TechSupport</span>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-300 mt-1">9.68%</div>
              <p className="text-xs text-slate-400 mt-1">1,178 accounts · Solid loyalty base</p>
            </div>
          </div>
        </div>

        {/* Chart 4: Payment Friction vs Auto-Pay */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Billing Friction: Electronic Check vs Auto-Pay</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manual checks force monthly re-evaluation of subscription value</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Payment Elasticity</span>
          </div>

          <div className="space-y-3 pt-1">
            {TELCO_BENCHMARKS.paymentMethodBreakdown.map(p => (
              <div key={p.method} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                <div className="space-y-0.5">
                  <span className="font-medium text-slate-300">{p.method}</span>
                  <div className="text-slate-500">{p.count.toLocaleString()} subscribers</div>
                </div>
                <div className="text-right">
                  <span className={`font-mono tabular-nums font-semibold ${
                    p.churnRate > 35 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {p.churnRate}% churn
                  </span>
                  <div className="text-slate-500 font-mono">{p.activeSubscribers} active</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-Risk Customer Watchlist Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">High-Risk Customer Watchlist</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live priority accounts evaluated with XGBoost pipeline · Click any customer to inspect in SHAP Simulator
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by ID or service..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Contract</th>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort('tenure')} className="flex items-center gap-1 hover:text-white">
                    <span>Tenure</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Internet</th>
                <th className="py-2.5 px-3">Tech Support</th>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort('MonthlyCharges')} className="flex items-center gap-1 hover:text-white">
                    <span>MRR</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">K-Means Cluster</th>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort('churnProbability')} className="flex items-center gap-1 hover:text-white">
                    <span>Predicted Risk</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => {
                  const probPct = Math.round(customer.churnProbability * 100);
                  const isHighRisk = probPct >= 60;
                  const isModerateRisk = probPct >= 30 && probPct < 60;

                  return (
                    <tr
                      key={customer.customerID}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => onInspectCustomer(customer)}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {customer.customerID}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {customer.Contract}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-300">
                        {customer.tenure} mos
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {customer.InternetService}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={customer.TechSupport === 'Yes' ? 'text-emerald-400' : 'text-slate-400'}>
                          {customer.TechSupport}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-200 font-semibold">
                        ${customer.MonthlyCharges.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 text-xs">
                        {customer.clusterName}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isHighRisk
                                ? 'text-rose-400'
                                : isModerateRisk
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {probPct}%
                          </span>
                          <span className="font-sans text-xs text-slate-500">
                            {isHighRisk ? 'High' : isModerateRisk ? 'Mod' : 'Low'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onInspectCustomer(customer);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-400 hover:text-white hover:bg-indigo-600 rounded transition-all"
                        >
                          <span>SHAP Tree</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing {filteredCustomers.length} representative accounts</span>
          <span>Click any row to test retention offers in live SHAP simulator</span>
        </div>
      </div>
    </div>
  );
};
