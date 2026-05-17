'use client';

import { CheckCircle2, Ban, Clock, Droplets } from 'lucide-react';

const rules = [
  { id: 1, label: 'Mandi dulu sebelum main HP', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 2, label: 'No TikTok sebelum mandi', icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 3, label: 'Tidur sebelum 23:00', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 4, label: 'Minum 8 gelas air hari ini', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

export function DailyRules() {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
        Rule Hari Ini
      </h2>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <div className={`p-1.5 rounded-lg ${rule.bg}`}>
                <Icon className={`w-4 h-4 ${rule.color}`} />
              </div>
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
