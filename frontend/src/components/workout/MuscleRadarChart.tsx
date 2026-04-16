import { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { DayWorkout, aggregateActivations } from '../../data/workoutData';

type MuscleGroup = 'push' | 'pull' | 'lower';

const MUSCLE_GROUP: Record<string, MuscleGroup> = {
  // Push
  'Chest — Sternal':     'push',
  'Chest — Clavicular':  'push',
  'Delts — Anterior':    'push',
  'Delts — Lateral':     'push',
  'Triceps — Long':      'push',
  'Triceps — Medial':    'push',
  'Triceps — Lateral':   'push',
  // Pull
  'Back — Lats':         'pull',
  'Back — Upper/Mid':    'pull',
  'Delts — Posterior':   'pull',
  'Biceps — Long':       'pull',
  'Biceps — Short':      'pull',
  'Traps — Upper':       'pull',
  // Lower
  'Quads — VL':              'lower',
  'Quads — VM':              'lower',
  'Quads — VI':              'lower',
  'Quads — RF':              'lower',
  'Glutes — Maximus':        'lower',
  'Glutes — Medius':         'lower',
  'Hamstrings — BF':         'lower',
  'Hamstrings — SM':         'lower',
  'Hamstrings — ST':         'lower',
  'Calves — Gastrocnemius':  'lower',
  'Calves — Soleus':         'lower',
};

// Muscle name (first segment) → push/pull/lower for group mode
const MUSCLE_NAME_GROUP: Record<string, MuscleGroup> = {
  'Chest':      'push',
  'Delts':      'push',
  'Triceps':    'push',
  'Back':       'pull',
  'Biceps':     'pull',
  'Traps':      'pull',
  'Quads':      'lower',
  'Glutes':     'lower',
  'Hamstrings': 'lower',
  'Calves':     'lower',
};

const AXIS_ORDER: string[] = [
  'Chest — Sternal', 'Chest — Clavicular',
  'Delts — Anterior', 'Delts — Lateral',
  'Triceps — Long', 'Triceps — Medial', 'Triceps — Lateral',
  'Back — Lats', 'Back — Upper/Mid',
  'Delts — Posterior',
  'Biceps — Long', 'Biceps — Short',
  'Traps — Upper',
  'Quads — VL', 'Quads — VM', 'Quads — VI', 'Quads — RF',
  'Glutes — Maximus', 'Glutes — Medius',
  'Hamstrings — BF', 'Hamstrings — SM', 'Hamstrings — ST',
  'Calves — Gastrocnemius', 'Calves — Soleus',
];

const GROUP_AXIS_ORDER: string[] = [
  'Chest', 'Delts', 'Triceps',
  'Back', 'Biceps', 'Traps',
  'Quads', 'Glutes', 'Hamstrings', 'Calves',
];

const GROUP_COLORS: Record<MuscleGroup, string> = {
  push:  '#f87171',
  pull:  '#60a5fa',
  lower: '#fb923c',
};

const LABEL_OFFSET = 14;

// Renders one or two lines, vertically centred, coloured by push/pull/lower
const CustomAngleTick = (props: any) => {
  const { cx, cy, x, y, payload, textAnchor } = props;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = cx + dx * (1 + LABEL_OFFSET / dist);
  const ny = cy + dy * (1 + LABEL_OFFSET / dist);
  const group: MuscleGroup =
    MUSCLE_GROUP[payload.value] ?? MUSCLE_NAME_GROUP[payload.value] ?? 'push';
  const parts = payload.value.split(' — ');
  const LINE_H = 11;
  const startY = ny - ((parts.length - 1) * LINE_H) / 2;
  return (
    <text x={nx} textAnchor={textAnchor} fill={GROUP_COLORS[group]} fontSize={9}>
      {parts.map((part: string, i: number) => (
        <tspan key={i} x={nx} y={startY + i * LINE_H} dominantBaseline="central">
          {part}
        </tspan>
      ))}
    </text>
  );
};

interface Props {
  dayData: DayWorkout;
}

export const MuscleRadarChart = ({ dayData }: Props) => {
  const [byGroup, setByGroup] = useState(true);
  const raw = aggregateActivations(dayData);
  if (Object.keys(raw).length === 0) return null;

  // Build display data depending on mode
  let displayRaw: Record<string, number>;
  let axisOrder: string[];
  let groupLookup: (name: string) => MuscleGroup;

  if (byGroup) {
    // Average heads into muscle names
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    for (const [head, val] of Object.entries(raw)) {
      const muscleName = head.split(' — ')[0];
      sums[muscleName] = (sums[muscleName] ?? 0) + val;
      counts[muscleName] = (counts[muscleName] ?? 0) + 1;
    }
    displayRaw = {};
    for (const name of Object.keys(sums)) {
      displayRaw[name] = sums[name] / counts[name];
    }
    axisOrder = GROUP_AXIS_ORDER;
    groupLookup = (name) => MUSCLE_NAME_GROUP[name] ?? 'push';
  } else {
    displayRaw = raw;
    axisOrder = AXIS_ORDER;
    groupLookup = (name) => MUSCLE_GROUP[name] ?? 'push';
  }

  const sortedKeys = Object.keys(displayRaw).sort((a, b) => {
    const ai = axisOrder.indexOf(a);
    const bi = axisOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  const domainMax = 12;

  const data = sortedKeys.map((name) => {
    const group = groupLookup(name);
    return {
      name,
      push:  group === 'push'  ? displayRaw[name] : 0,
      pull:  group === 'pull'  ? displayRaw[name] : 0,
      lower: group === 'lower' ? displayRaw[name] : 0,
    };
  });

  return (
    <div className="bg-slate-950 shadow-lg shadow-slate-900/50 rounded-lg p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-100">
          Daily Activation Summary
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-xs text-slate-400">
            {(['push', 'pull', 'lower'] as MuscleGroup[]).map((g) => (
              <span key={g} className="flex items-center gap-1.5 capitalize">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ backgroundColor: GROUP_COLORS[g] }}
                />
                {g}
              </span>
            ))}
          </div>
          <button
            onClick={() => setByGroup((v) => !v)}
            className="text-xs px-2.5 py-1 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors whitespace-nowrap"
          >
            {byGroup ? 'By Group' : 'By Head'}
          </button>
        </div>
      </div>

      <div className="w-full" style={{ height: 260 }}>
        <ResponsiveContainer>
          <RadarChart
            data={data}
            cx="50%" cy="50%"
            outerRadius="72%"
            margin={{ top: 24, right: 56, bottom: 24, left: 56 }}
          >
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="name"
              tick={(props) => <CustomAngleTick {...props} />}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, domainMax]}
              tickCount={4}
              tick={{ fill: '#334155', fontSize: 9 }}
              axisLine={false}
            />
            <Radar name="Push"  dataKey="push"  stroke={GROUP_COLORS.push}  fill={GROUP_COLORS.push}  fillOpacity={0.22} strokeWidth={1.5} />
            <Radar name="Pull"  dataKey="pull"  stroke={GROUP_COLORS.pull}  fill={GROUP_COLORS.pull}  fillOpacity={0.22} strokeWidth={1.5} />
            <Radar name="Lower" dataKey="lower" stroke={GROUP_COLORS.lower} fill={GROUP_COLORS.lower} fillOpacity={0.22} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
