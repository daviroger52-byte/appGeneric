import { 
  Dumbbell, Wallet, TrendingUp, Brain, Star, Target, Repeat, Calendar 
} from 'lucide-react';

export const DIFFICULTIES = {
  easy: { 
    id: 'easy', 
    label: 'Fácil', 
    xp: 10, 
    gold: 5, 
    color: 'text-emerald-500', 
    border: 'border-emerald-500/50', 
    bg: 'bg-emerald-500/10', 
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:border-emerald-400' 
  },
  medium: { 
    id: 'medium', 
    label: 'Médio', 
    xp: 25, 
    gold: 15, 
    color: 'text-blue-500', 
    border: 'border-blue-500/50', 
    bg: 'bg-blue-500/10', 
    glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:border-blue-400' 
  },
  hard: { 
    id: 'hard', 
    label: 'Difícil', 
    xp: 50, 
    gold: 30, 
    color: 'text-purple-500', 
    border: 'border-purple-500/50', 
    bg: 'bg-purple-500/10', 
    glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:border-purple-400' 
  },
  epic: { 
    id: 'epic', 
    label: 'Épico', 
    xp: 100, 
    gold: 100, 
    color: 'text-amber-400', // Dourado Vibrante
    border: 'border-amber-500/50', 
    bg: 'bg-amber-500/10', 
    glow: 'hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:border-amber-300 ring-1 ring-transparent hover:ring-amber-400/50' // Glow mais intenso
  },
};

export const CATEGORIES = {
  health: { id: 'health', label: 'Saúde', icon: Dumbbell, color: 'text-red-400 bg-red-500/10', hex: 'bg-red-500' },
  finance: { id: 'finance', label: 'Finanças', icon: Wallet, color: 'text-yellow-400 bg-yellow-500/10', hex: 'bg-yellow-500' },
  career: { id: 'career', label: 'Carreira', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10', hex: 'bg-cyan-500' },
  learning: { id: 'learning', label: 'Estudos', icon: Brain, color: 'text-fuchsia-400 bg-fuchsia-500/10', hex: 'bg-fuchsia-500' },
  other: { id: 'other', label: 'Outros', icon: Star, color: 'text-slate-400 bg-slate-500/10', hex: 'bg-slate-500' },
};

export const SPRINTS = {
  sprint1: { id: 'sprint1', title: 'Trimestre 1', range: 'Jan - Mar', description: 'O Início' },
  sprint2: { id: 'sprint2', title: 'Trimestre 2', range: 'Abr - Jun', description: 'Consistência' },
  sprint3: { id: 'sprint3', title: 'Trimestre 3', range: 'Jul - Set', description: 'Expansão' },
  sprint4: { id: 'sprint4', title: 'Trimestre 4', range: 'Out - Dez', description: 'Reta Final' },
  ongoing: { id: 'ongoing', title: 'Rotina Base', range: 'Ano Todo', description: 'Hábitos Diários' }
};

export const FREQUENCIES = {
    once: { id: 'once', label: 'Única', icon: Target },
    daily: { id: 'daily', label: 'Diária', icon: Repeat },
    weekly: { id: 'weekly', label: 'Semanal', icon: Calendar }
};

export const COSMETIC_ITEMS = [
    { id: 'theme_default', type: 'theme', name: 'Clássico', description: 'O visual original.', cost: 0, 
      colors: { text: 'from-cyan-400 via-purple-500 to-pink-500', bar: 'bg-gradient-to-r from-purple-600 to-pink-500', btn: 'bg-purple-600 hover:bg-purple-500' } },
    { id: 'theme_midas', type: 'theme', name: 'Toque de Midas', description: 'Luxo e ouro.', cost: 50, 
      colors: { text: 'from-yellow-300 via-yellow-500 to-amber-600', bar: 'bg-gradient-to-r from-yellow-400 to-amber-600', btn: 'bg-yellow-600 hover:bg-yellow-500' } },
    { id: 'theme_matrix', type: 'theme', name: 'The Matrix', description: 'Hacker style.', cost: 30, 
      colors: { text: 'from-green-400 via-emerald-500 to-teal-600', bar: 'bg-gradient-to-r from-green-500 to-emerald-700', btn: 'bg-green-700 hover:bg-green-600' } },
    { id: 'theme_cyber', type: 'theme', name: 'Cyberpunk 2077', description: 'Neon vibrante.', cost: 40, 
      colors: { text: 'from-yellow-400 via-red-500 to-blue-600', bar: 'bg-gradient-to-r from-yellow-400 to-red-500', btn: 'bg-red-600 hover:bg-red-500' } },
    
    { id: 'border_default', type: 'border', name: 'Sem Borda', description: 'Simples e limpo.', cost: 0, className: '' },
    { id: 'border_bronze', type: 'border', name: 'Bronze', description: 'Iniciante.', cost: 10, className: 'ring-2 ring-orange-700' },
    { id: 'border_gold', type: 'border', name: 'Ouro Maciço', description: 'Ostentação.', cost: 100, className: 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' },
    { id: 'border_neon', type: 'border', name: 'Neon Blue', description: 'Futurista.', cost: 50, className: 'ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' },
];

export const INITIAL_QUESTS = [
  { id: 'q1', type: 'checklist', title: 'Ler 10 páginas', category: 'learning', difficulty: 'easy', sprint: 'ongoing', frequency: 'daily', completed: false, subtasks: [] },
  { id: 'q2', type: 'checklist', title: 'Treino (30 min)', category: 'health', difficulty: 'medium', sprint: 'ongoing', frequency: 'daily', completed: false, subtasks: [] },
  { id: 'q3', type: 'progressive', title: 'Reserva de Emergência', category: 'finance', difficulty: 'hard', sprint: 'sprint1', frequency: 'once', completed: false, progress: { current: 0, target: 1000, unit: 'R$' }, subtasks: [] }
];

export const INITIAL_REWARDS = [
  { id: 'r1', title: 'Pedir Delivery', cost: 150 },
  { id: 'r2', title: 'Cinema / Streaming', cost: 50 }
];