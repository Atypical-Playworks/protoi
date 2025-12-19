
import React, { useMemo } from 'react';
import { Project } from '../types';
import { Card } from './Card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend, CartesianGrid 
} from 'recharts';
import { Users, Code, Activity, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  projects: Project[];
}

// Dynamic colors based on theme
const getColors = (isDark: boolean) => isDark ? [
  '#22d3ee', // primary cyan
  '#a78bfa', // secondary violet
  '#f43f5e', // accent rose
  '#2dd4bf', // teal
  '#fbbf24', // amber
  '#f87171', // red
] : [
  '#0891b2', // darker cyan for light mode
  '#7c3aed', // darker violet
  '#e11d48', // darker rose
  '#14b8a6', // darker teal
  '#d97706', // darker amber
  '#ef4444', // darker red
];

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="neu-flat p-3 z-50">
        <p className="text-neu-text font-mono text-xs mb-1 font-bold">{label}</p>
        <p className="text-neu-primary font-mono text-sm">
          {payload[0].value} Projects
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const COLORS = getColors(isDark);
  
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in pb-10">
      {/* Stat Cards */}
      <Card glow className="lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neu-textDim text-xs font-mono uppercase tracking-widest">{t.totalProjects}</p>
            <p className="text-4xl font-bold text-neu-text mt-2 font-mono tracking-tighter">{projects.length}</p>
          </div>
          <div className="p-3 neu-icon">
             <Layers className="text-neu-primary w-6 h-6" />
          </div>
        </div>
      </Card>
      
      <Card glow className="lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neu-textDim text-xs font-mono uppercase tracking-widest">{t.developers}</p>
            <p className="text-4xl font-bold text-neu-text mt-2 font-mono tracking-tighter">{totalDevs}</p>
          </div>
          <div className="p-3 neu-icon">
            <Users className="text-neu-secondary w-6 h-6" />
          </div>
        </div>
      </Card>

      <Card glow className="lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neu-textDim text-xs font-mono uppercase tracking-widest">{t.topTrack}</p>
            <p className="text-xl font-bold text-neu-text mt-2 font-mono truncate max-w-[150px]" title={trackData[0]?.name}>
              {trackData[0]?.name || 'N/A'}
            </p>
          </div>
          <div className="p-3 neu-icon">
            <Activity className="text-neu-accent w-6 h-6" />
          </div>
        </div>
      </Card>

      <Card glow className="lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neu-textDim text-xs font-mono uppercase tracking-widest">{t.techStack}</p>
            <p className="text-xl font-bold text-neu-text mt-2 font-mono truncate max-w-[150px]" title={techData[0]?.name}>
               {techData[0]?.name || 'N/A'}
            </p>
          </div>
          <div className="p-3 neu-icon">
            <Code className="text-emerald-500 w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      
      {/* Track Distribution - Pie Chart */}
      <Card title={t.trackDist} className="col-span-1 md:col-span-2 h-[450px]">
        {/* Fixed: Use h-full to ensure ResponsiveContainer has a calculated height from parent flex container */}
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
                stroke="none"
              >
                {trackData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ 
                  paddingTop: '20px', 
                  fontFamily: 'JetBrains Mono', 
                  fontSize: '11px',
                  color: 'var(--neu-text)' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tech Stack - Bar Chart */}
      <Card title={t.topTech} className="col-span-1 md:col-span-2 h-[450px]">
        {/* Fixed: Use h-full to ensure ResponsiveContainer has a calculated height from parent flex container */}
        <div className="w-full h-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={techData} 
              layout="vertical" 
              margin={{ top: 10, right: 40, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={130} 
                tick={{fill: 'var(--neu-text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono'}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: isDark ? 'rgba(34, 211, 238, 0.05)' : 'rgba(8, 145, 178, 0.08)'}}
                content={<CustomTooltip isDark={isDark} />}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]} 
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
  );
};
