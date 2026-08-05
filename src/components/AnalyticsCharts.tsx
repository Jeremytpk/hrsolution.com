import React from 'react';
import { TenantAnalytics } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Sparkles, CheckCircle2, AlertTriangle, Clock, ThumbsUp } from 'lucide-react';

interface AnalyticsChartsProps {
  analytics: TenantAnalytics;
  title?: string;
}

const COLORS = ['#14b8a6', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Queries</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {analytics.totalQueriesThisMonth.toLocaleString()}
          </div>
          <p className="text-[11px] text-teal-600 mt-1 font-bold">↑ 14% vs last month</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Auto-Resolution</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-600 mt-2">
            {analytics.autoResolutionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">No HR human intervention</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Avg AI Latency</span>
            <Clock className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {analytics.avgResponseTimeSec}s
          </div>
          <p className="text-[11px] text-teal-700 mt-1 font-bold">Real-time Gemini Flash</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Employee CSAT</span>
            <ThumbsUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {analytics.employeeCsat} / 5.0
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Based on 840+ ratings</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Resolution Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Query Volume & HR Escalation Breakdown</h3>
              <p className="text-xs text-slate-500">Resolved by Kati AI vs Escalated to HR Ops</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.queriesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="resolvedByKati" name="Resolved by Kati AI" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="escalatedToHR" name="Escalated to HR" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Topic Pie Chart */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Employee HR Inquiry Topics</h3>
            <p className="text-xs text-slate-500 mb-2">Category distribution this month</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.topQueries}
                    dataKey="count"
                    nameKey="topic"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {analytics.topQueries.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
            {analytics.topQueries.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700 font-medium">
                <span className="flex items-center space-x-1.5 truncate max-w-[170px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="truncate">{item.topic}</span>
                </span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policy Gap Insights & Alerts */}
      {analytics.policyGapAlerts && analytics.policyGapAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-xs shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">Kati Policy Gap Detection Alert:</span>
            <p className="text-amber-800 mt-0.5 font-medium">
              {analytics.policyGapAlerts[0].recommendedAction}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

