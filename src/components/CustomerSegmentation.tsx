import React, { useState } from 'react';
import { KMEANS_CLUSTERS } from '../data/clusteringEngine';
import { Network, Users, DollarSign, Target, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const CustomerSegmentation: React.FC = () => {
  const [selectedClusterId, setSelectedClusterId] = useState<number>(0);
  const [campaignRolloutPct, setCampaignRolloutPct] = useState<number>(100);

  const selectedCluster = KMEANS_CLUSTERS.find(c => c.id === selectedClusterId) || KMEANS_CLUSTERS[0];

  // Aggregate metrics
  const totalRevenueAtRisk = KMEANS_CLUSTERS.reduce((acc, c) => acc + c.revenueAtRisk, 0);
  const totalNetSavings = KMEANS_CLUSTERS.reduce((acc, c) => acc + (c.projectedNetSavings * (campaignRolloutPct / 100)), 0);
  const totalTargetAccounts = KMEANS_CLUSTERS.reduce((acc, c) => acc + c.customerCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">K-Means Customer Segmentation & Retention Strategy</h1>
            <span className="text-xs text-indigo-400 font-mono">Unsupervised Business Layer</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            4 RFM & Behavioral clusters with revenue at risk quantification and targeted retention playbooks
          </p>
        </div>

        {/* Campaign Rollout Slider */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <span className="text-slate-400 font-medium">Campaign Scope:</span>
          <input
            type="range"
            min="25"
            max="100"
            step="25"
            value={campaignRolloutPct}
            onChange={e => setCampaignRolloutPct(parseInt(e.target.value, 10))}
            className="w-24 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
          />
          <span className="font-mono font-semibold text-indigo-300">{campaignRolloutPct}% Rollout</span>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 font-medium">Total Monthly Revenue at Risk</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              ${(totalRevenueAtRisk / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500 font-mono">/ month</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Annualized: ${(totalRevenueAtRisk * 12 / 1000000).toFixed(2)}M ARR exposure
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 font-medium">Projected Net Monthly Savings</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              +${(totalNetSavings / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500 font-mono">net margin</span>
          </div>
          <span className="text-xs text-emerald-500 mt-1 block">
            Annualized Net Gain: +${(totalNetSavings * 12 / 1000).toFixed(0)}k/year
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400 font-medium">K-Means Optimal Clusters (k=4)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-indigo-400">
              4 Archetypes
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Silhouette Score: 0.58 on RFM + Telco features
          </span>
        </div>
      </div>

      {/* 4 Cluster Archetype Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KMEANS_CLUSTERS.map(cluster => {
          const isSelected = cluster.id === selectedClusterId;
          const isCritical = cluster.churnRate >= 45;

          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-semibold text-indigo-400">
                  Cluster #{cluster.id}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {cluster.churnRate}% Churn
                </span>
              </div>

              <h2 className="text-sm font-bold text-white mb-1">{cluster.name}</h2>
              <div className="text-xs text-slate-400 font-mono mb-3">
                {cluster.customerCount.toLocaleString()} accounts ({cluster.sizePercentage}%)
              </div>

              <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-2.5">
                <div className="flex justify-between text-slate-400">
                  <span>Avg MRR:</span>
                  <span className="text-slate-200 tabular-nums">${cluster.avgMonthlyCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg Tenure:</span>
                  <span className="text-slate-200 tabular-nums">{cluster.avgTenure} mos</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Revenue at Risk:</span>
                  <span className="text-amber-400 font-bold tabular-nums">
                    ${(cluster.revenueAtRisk / 1000).toFixed(1)}k/mo
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Inspection for Selected Cluster */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">
                Cluster #{selectedCluster.id}: {selectedCluster.name}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Actionable behavioral fingerprint and quantified intervention play
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Net Impact: <strong className="text-emerald-400 font-semibold">+${((selectedCluster.projectedNetSavings * campaignRolloutPct) / 100).toLocaleString()}/mo</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Behavioral Fingerprint */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Segment Behavioral Profile
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {selectedCluster.keyTraits.map((trait, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/50 border border-slate-800/80 rounded p-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Prescriptive Action & Business Economics */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Prescriptive Retention Play
            </h3>

            <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-4 space-y-3">
              <div className="text-xs font-semibold text-indigo-200">
                Recommended Action:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedCluster.recommendedAction}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-900/40 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Offer Cost / Acc</span>
                  <span className="font-semibold text-amber-300">${selectedCluster.offerCost}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Expected Lift</span>
                  <span className="font-semibold text-emerald-400">+{selectedCluster.expectedRetentionLift}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Monthly Savings</span>
                  <span className="font-semibold text-emerald-300">
                    +${((selectedCluster.projectedNetSavings * campaignRolloutPct) / 100).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Executive ROI Summary: </strong>
              Deploying this retention play to {Math.round((selectedCluster.customerCount * campaignRolloutPct) / 100).toLocaleString()} accounts in Cluster #{selectedCluster.id} generates an estimated ${((selectedCluster.projectedNetSavings * campaignRolloutPct * 12) / 1000).toFixed(0)}k in preserved annual recurring revenue.
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Retention Strategy Matrix */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Segment Retention Matrix (Executive Summary)</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-sans">Segment Name</th>
                <th className="py-2 px-3">Size</th>
                <th className="py-2 px-3">Churn Rate</th>
                <th className="py-2 px-3">MRR at Risk</th>
                <th className="py-2 px-3 font-sans">Targeted Action</th>
                <th className="py-2 px-3">Offer Cost</th>
                <th className="py-2 px-3">Lift</th>
                <th className="py-2 px-3 text-right">Net Savings / Mo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {KMEANS_CLUSTERS.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                    {c.name}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-slate-300">
                    {c.customerCount}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-rose-400 font-semibold">
                    {c.churnRate}%
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-amber-400">
                    ${(c.revenueAtRisk / 1000).toFixed(1)}k
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px] max-w-xs truncate">
                    {c.recommendedAction}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-slate-300">
                    ${c.offerCost}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-emerald-400 font-semibold">
                    +{c.expectedRetentionLift}%
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-emerald-400 font-bold text-right">
                    +${c.projectedNetSavings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
