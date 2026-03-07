import { useState, useEffect } from 'react';
import { progressApi } from '../api';
import { ProgressData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import { TrendingUp, Weight, Activity } from 'lucide-react';

interface Props {
  telegramId: string;
}

export default function Progress({ telegramId }: Props) {
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    progressApi.getExerciseNames(telegramId)
      .then(names => {
        setExerciseNames(names);
        if (names.length > 0) setSelected(names[0]);
      })
      .finally(() => setLoading(false));
  }, [telegramId]);

  useEffect(() => {
    if (!selected) return;
    setChartLoading(true);
    progressApi.getProgress(selected, telegramId)
      .then(setData)
      .finally(() => setChartLoading(false));
  }, [selected, telegramId]);

  const chartData = data?.progressData.map(p => ({
    date: dayjs(p.date).format('MMM D'),
    weight: p.maxWeight,
    volume: p.totalVolume,
  })) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#22223a] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-white text-sm font-mono font-semibold">
            {p.value}{p.dataKey === 'weight' ? 'kg' : 'kg vol'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 pt-8 animate-enter">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Progress</h1>

      {loading && (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-48 w-full" />
        </div>
      )}

      {!loading && exerciseNames.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📈</div>
          <p className="text-white/50 font-medium">No data yet</p>
          <p className="text-white/30 text-sm mt-1">Complete workouts to track progress</p>
        </div>
      )}

      {!loading && exerciseNames.length > 0 && (
        <>
          {/* Exercise selector */}
          <div className="mb-4">
            <p className="section-label mb-2">Exercise</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {exerciseNames.map(name => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selected === name
                      ? 'bg-[#6c63ff] text-white shadow-[0_0_16px_rgba(108,99,255,0.4)]'
                      : 'bg-white/5 text-white/50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Stats cards */}
          {data && !chartLoading && (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="card p-3 text-center">
                  <Weight size={16} className="text-[#ff9a3c] mx-auto mb-1" />
                  <p className="text-xl font-display font-bold text-white">{data.stats.maxWeight}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Max kg</p>
                </div>
                <div className="card p-3 text-center">
                  <TrendingUp size={16} className="text-[#00d9a3] mx-auto mb-1" />
                  <p className="text-xl font-display font-bold text-white">
                    {data.stats.totalVolume > 999 ? `${(data.stats.totalVolume / 1000).toFixed(1)}k` : data.stats.totalVolume}
                  </p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Volume</p>
                </div>
                <div className="card p-3 text-center">
                  <Activity size={16} className="text-[#6c63ff] mx-auto mb-1" />
                  <p className="text-xl font-display font-bold text-white">{data.stats.totalSessions}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">Sessions</p>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 1 && (
                <div className="card p-4 mb-4">
                  <p className="section-label mb-4">Max Weight Progress</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#6c63ff"
                        strokeWidth={2.5}
                        dot={{ fill: '#6c63ff', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#6c63ff', stroke: 'rgba(108,99,255,0.3)', strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Session history */}
              <div>
                <p className="section-label mb-3">Session Log</p>
                <div className="flex flex-col gap-2">
                  {data.progressData.slice().reverse().map((p, i) => (
                    <div key={i} className="card p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{dayjs(p.date).format('ddd, MMM D')}</p>
                        <p className="text-white/30 text-xs mt-0.5">{p.sets.length} sets</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#ff9a3c] font-mono font-semibold text-sm">{p.maxWeight}kg</p>
                        <p className="text-white/30 text-xs font-mono">{p.totalVolume}kg vol</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {chartLoading && (
            <div className="flex flex-col gap-3">
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-48 w-full" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
