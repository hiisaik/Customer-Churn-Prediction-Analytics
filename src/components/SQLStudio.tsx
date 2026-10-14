import React, { useState, useTransition } from 'react';
import { PRESET_SQL_QUERIES, executeTelcoSQL, TELCO_SCHEMA, SQLQueryResult } from '../data/sqlEngine';
import { Database, Play, Download, Table, Code2, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const SQLStudio: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_SQL_QUERIES[0].id);
  const [sqlCode, setSqlCode] = useState<string>(PRESET_SQL_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<SQLQueryResult>(() => executeTelcoSQL(PRESET_SQL_QUERIES[0].sql));
  const [showSchema, setShowSchema] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SQL_QUERIES.find(p => p.id === presetId);
    if (preset) {
      setSelectedPresetId(preset.id);
      setSqlCode(preset.sql);
      startTransition(() => {
        const result = executeTelcoSQL(preset.sql);
        setQueryResult(result);
      });
    }
  };

  const handleRunQuery = () => {
    startTransition(() => {
      const result = executeTelcoSQL(sqlCode);
      setQueryResult(result);
    });
  };

  const handleExportCSV = () => {
    if (!queryResult.rows.length) return;
    const headers = queryResult.columns.join(',');
    const rows = queryResult.rows.map(row => 
      queryResult.columns.map(col => `"${row[col] ?? ''}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telco_sql_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">SQL Analytics Studio</h1>
            <span className="text-xs text-indigo-400 font-mono">SQLite / DuckDB Compatible Engine</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Production cohort analysis, churn rate aggregations, and revenue-at-risk calculations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSchema(!showSchema)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
          >
            <Table className="w-3.5 h-3.5 text-indigo-400" />
            <span>Schema Inspector ({TELCO_SCHEMA.length} cols)</span>
            {showSchema ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Schema Inspector Drawer (Collapsible) */}
      {showSchema && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Table: telco_churn (7,043 rows)</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Dialect: ANSI SQL / SQLite</span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="sticky top-0 bg-slate-950 text-slate-400">
                <tr className="border-b border-slate-800">
                  <th className="py-1.5 px-2.5">Column Name</th>
                  <th className="py-1.5 px-2.5">Data Type</th>
                  <th className="py-1.5 px-2.5">Null?</th>
                  <th className="py-1.5 px-2.5 font-sans">Business Meaning</th>
                  <th className="py-1.5 px-2.5">Sample Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {TELCO_SCHEMA.map(col => (
                  <tr key={col.column} className="hover:bg-slate-800/30">
                    <td className="py-1.5 px-2.5 text-indigo-300 font-semibold">{col.column}</td>
                    <td className="py-1.5 px-2.5 text-slate-400">{col.type}</td>
                    <td className="py-1.5 px-2.5 text-slate-500">{col.nullable ? 'YES' : 'NO'}</td>
                    <td className="py-1.5 px-2.5 font-sans text-slate-300">{col.description}</td>
                    <td className="py-1.5 px-2.5 text-emerald-400">{col.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preset Query Carousel */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 font-medium">Pre-Built Production SQL Queries:</span>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_SQL_QUERIES.map(q => (
            <button
              key={q.id}
              onClick={() => handleSelectPreset(q.id)}
              className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                selectedPresetId === q.id
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-white shadow-xs'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200 truncate">{q.title}</div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">{q.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* SQL Editor Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200">Interactive SQL Query Editor</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunQuery}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run SQL</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={sqlCode}
            onChange={e => setSqlCode(e.target.value)}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-xs text-indigo-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
            placeholder="SELECT * FROM telco_churn LIMIT 10;"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Target Table: <code className="text-slate-400 font-mono">telco_churn</code></span>
          <span>Tip: You can modify clauses and click Run SQL to re-execute</span>
        </div>
      </div>

      {/* Query Execution Status Strip & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </div>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">
            {queryResult.rowCount} {queryResult.rowCount === 1 ? 'row' : 'rows'} returned
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            Execution time: <strong className="text-slate-200 font-semibold">{queryResult.executionTimeMs} ms</strong>
          </span>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Query Result Grid */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Result Output</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                {queryResult.columns.map(col => (
                  <th key={col} className="py-2 px-3 font-semibold bg-slate-950/60">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {queryResult.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  {queryResult.columns.map(col => {
                    const val = row[col];
                    const isNumeric = typeof val === 'number';
                    const isChurnPct = col.toLowerCase().includes('churn_rate') || col.toLowerCase().includes('pct');

                    return (
                      <td
                        key={col}
                        className={`py-2 px-3 tabular-nums ${
                          isChurnPct
                            ? val > 35
                              ? 'text-rose-400 font-semibold'
                              : val > 15
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                            : isNumeric
                            ? 'text-slate-200'
                            : 'text-slate-300 font-sans'
                        }`}
                      >
                        {isNumeric
                          ? col.toLowerCase().includes('revenue') || col.toLowerCase().includes('spend') || col.toLowerCase().includes('charges')
                            ? `$${val.toLocaleString()}`
                            : isChurnPct
                            ? `${val}%`
                            : val.toLocaleString()
                          : String(val ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why SQL in Stack Card (Interview Proof) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-md text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold text-slate-200">
              Why SQL in the Machine Learning Stack? (Data Engineering Justification)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard Kaggle projects read raw CSVs directly into Pandas. In enterprise environments, data engineering pipelines perform aggregation, cohort windowing, and financial risk reconciliation inside the database (Snowflake, BigQuery, PostgreSQL). 
              Calculating <code className="text-indigo-300 font-mono">churn_rate_pct</code> and <code className="text-indigo-300 font-mono">revenue_at_risk</code> at the database level preserves single-source-of-truth governance, slashes network egress costs, and feeds clean feature stores directly to Scikit-learn pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
