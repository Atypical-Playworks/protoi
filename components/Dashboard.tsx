
import React, { useMemo } from 'react';
import { Project } from '../types';
import { Card } from './Card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend, CartesianGrid 
} from 'recharts';
import { Users, Code, Activity, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  projects: Project[];
}

// Brutalist color palette
const COLORS = [
  '#facc15', // scaffold yellow
  '#4ade80', // terminal green
  '#f97316', // scaffold orange
  '#ef4444', // red
  '#3b82f6', // blue
  '#a855f7', // purple
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-basalt-900 border-2 border-basalt-700 p-3 z-50">
        <p className="text-white font-mono text-xs mb-1 font-bold uppercase">{label}</p>
        <p className="text-yellow-400 font-mono text-sm">
          {payload[0].value} Projects
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const { t } = useLanguage();
  
  const trackData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.track] = (counts[p.track] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  const techData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      p.techStack.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [projects]);

  const totalDevs = projects.reduce((acc, curr) => acc + curr.teamSize, 0);

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      {/* Stat Cards - Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        {/* Stat Cards - Brutalist Basalt Blocks */}
        <div className="basalt-block p-4">
        <span className="font-mono text-[10px] text-yellow-400 block mb-1">// PROJECTS_SYNC</span>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-white font-mono tracking-tighter">{projects.length}</div>
          <div className="bg-basalt-800 border border-basalt-700 p-2">
            <Layers className="text-yellow-400 w-5 h-5" />
          </div>
        </div>
        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-2">{t.totalProjects}</p>
      </div>
      
      <div className="basalt-block p-4">
        <span className="font-mono text-[10px] text-gray-500 block mb-1">// ACTIVE_DEVS</span>
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-white font-mono tracking-tighter">{totalDevs}</div>
          <div className="bg-basalt-800 border border-basalt-700 p-2">
            <Users className="text-green-400 w-5 h-5" />
          </div>
        </div>
        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-2">{t.developers}</p>
      </div>

      <div className="basalt-block p-4">
        <span className="font-mono text-[10px] text-gray-500 block mb-1">// TOP_TRACK</span>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-white font-mono truncate max-w-[150px]" title={trackData[0]?.name}>
            {trackData[0]?.name || 'N/A'}
          </div>
          <div className="bg-basalt-800 border border-basalt-700 p-2">
            <Activity className="text-orange-400 w-5 h-5" />
          </div>
        </div>
        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-2">{t.topTrack}</p>
      </div>

      <div className="basalt-block p-4">
        <span className="font-mono text-[10px] text-gray-500 block mb-1">// TOP_TECH</span>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-white font-mono truncate max-w-[150px]" title={techData[0]?.name}>
            {techData[0]?.name || 'N/A'}
          </div>
          <div className="bg-basalt-800 border border-basalt-700 p-2">
            <Code className="text-green-400 w-5 h-5" />
          </div>
        </div>
        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-2">{t.techStack}</p>
      </div>
      </div>

      {/* Charts Section - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
      
        {/* Track Distribution - Pie Chart */}
        <Card title={t.trackDist} className="h-[400px]">
        <div className="w-full h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
              <Pie
                data={trackData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="#0a0a0b"
                strokeWidth={2}
              >
                {trackData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="square"
                wrapperStyle={{ 
                  paddingTop: '20px', 
                  fontFamily: 'Space Mono', 
                  fontSize: '10px',
                  color: '#9ca3af',
                  textTransform: 'uppercase'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

        {/* Tech Stack - Bar Chart */}
        <Card title={t.topTech} className="h-[400px]">
        <div className="w-full h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={techData} 
              layout="vertical" 
              margin={{ top: 10, right: 40, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(250, 204, 21, 0.1)" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={130} 
                tick={{fill: '#9ca3af', fontSize: 10, fontFamily: 'Space Mono'}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: 'rgba(250, 204, 21, 0.05)'}}
                content={<CustomTooltip />}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 2, 2, 0]} 
                barSize={24}
                animationDuration={1500}
              >
                {techData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
        </div>
      </div>
    </div>
  );
};
