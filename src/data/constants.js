import { 
  Dumbbell, Wallet, TrendingUp, Brain, Star, Target, Repeat, Calendar, 
  Coins, BookOpen, Clock, Footprints, Droplets, Scale
} from 'lucide-react';

export const DIFFICULTIES = {
  easy: { 
    id: 'easy', 
    label: 'Fácil', 
    xp: 10, 
    gold: 5, 
    color: 'text-emerald-500', 
    border: 'border-emerald-500/50', 
    bg: 'bg-emerald-500/10' 
  },
  medium: { 
    id: 'medium', 
    label: 'Médio', 
    xp: 25, 
    gold: 15, 
    color: 'text-blue-500', 
    border: 'border-blue-500/50', 
    bg: 'bg-blue-500/10' 
  },
  hard: { 
    id: 'hard', 
    label: 'Difícil', 
    xp: 50, 
    gold: 30, 
    color: 'text-purple-500', 
    border: 'border-purple-500/50', 
    bg: 'bg-purple-500/10' 
  },
  epic: { 
    id: 'epic', 
    label: 'Épico', 
    xp: 100, 
    gold: 100, 
    color: 'text-amber-400', 
    border: 'border-amber-500/50', 
    bg: 'bg-amber-500/10' 
  },
};

export const CATEGORIES = {
  health: { id: 'health', label: 'Saúde', icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  finance: { id: 'finance', label: 'Finanças', icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  career: { id: 'career', label: 'Carreira', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  learning: { id: 'learning', label: 'Estudos', icon: Brain, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  other: { id: 'other', label: 'Outros', icon: Star, color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

export const SPRINTS = {
  sprint1: { id: 'sprint1', title: 'Trimestre 1', range: 'Jan - Mar' },
  sprint2: { id: 'sprint2', title: 'Trimestre 2', range: 'Abr - Jun' },
  sprint3: { id: 'sprint3', title: 'Trimestre 3', range: 'Jul - Set' },
  sprint4: { id: 'sprint4', title: 'Trimestre 4', range: 'Out - Dez' },
  ongoing: { id: 'ongoing', title: 'Rotina Base', range: 'Ano Todo' }
};

export const FREQUENCIES = {
    once: { id: 'once', label: 'Única', icon: Target },
    daily: { id: 'daily', label: 'Diária', icon: Repeat },
    weekly: { id: 'weekly', label: 'Semanal', icon: Calendar },
    monthly: { id: 'monthly', label: 'Mensal', icon: Star }
};

// --- MÉTRICAS ATUALIZADAS (TEMPO AGORA É 'h') ---
export const METRICS = {
  custom: { label: 'Outro', unit: '', icon: Target },
  money: { label: 'Dinheiro', unit: 'R$', icon: Coins },
  pages: { label: 'Leitura', unit: 'pág', icon: BookOpen },
  time: { label: 'Tempo', unit: 'h', icon: Clock }, // <--- Alterado para 'h'
  distance: { label: 'Distância', unit: 'km', icon: Footprints },
  workouts: { label: 'Treinos', unit: 'dias', icon: Dumbbell },
  bodyweight: { label: 'Peso Corp.', unit: 'kg', icon: Scale },
  water: { label: 'Água', unit: 'ml', icon: Droplets },
};

export const PLAN_TEMPLATES = {
  finance_savings: {
    id: 'finance_savings',
    label: 'Poupança e Investimentos',
    description: 'Defina o mês final e deixe o app calcular.',
    icon: Wallet,
    color: 'text-emerald-400',
    questions: [
      { id: 'targetValue', label: 'Qual o valor total (R$)?', type: 'number', placeholder: 'Ex: 10000' },
      { id: 'startMonth', label: 'Começar em qual mês?', type: 'select', options: [
        { label: 'Janeiro', value: 0 }, { label: 'Fevereiro', value: 1 }, { label: 'Março', value: 2 },
        { label: 'Abril', value: 3 }, { label: 'Maio', value: 4 }, { label: 'Junho', value: 5 },
        { label: 'Julho', value: 6 }, { label: 'Agosto', value: 7 }, { label: 'Setembro', value: 8 },
        { label: 'Outubro', value: 9 }, { label: 'Novembro', value: 10 }, { label: 'Dezembro', value: 11 }
      ]},
      { id: 'endMonth', label: 'Até quando (Mês Final)?', type: 'select', options: [
        { label: 'Janeiro', value: 0 }, { label: 'Fevereiro', value: 1 }, { label: 'Março', value: 2 },
        { label: 'Abril', value: 3 }, { label: 'Maio', value: 4 }, { label: 'Junho', value: 5 },
        { label: 'Julho', value: 6 }, { label: 'Agosto', value: 7 }, { label: 'Setembro', value: 8 },
        { label: 'Outubro', value: 9 }, { label: 'Novembro', value: 10 }, { label: 'Dezembro', value: 11 }
      ]}
    ]
  },
  reading_goal: {
    id: 'reading_goal',
    label: 'Meta de Leitura',
    description: 'Ler uma quantidade de livros.',
    icon: Brain,
    color: 'text-blue-400',
    questions: [
      { id: 'targetValue', label: 'Quantos livros?', type: 'number', placeholder: 'Ex: 12' },
      { id: 'duration', label: 'Em quanto tempo (meses)?', type: 'number', placeholder: 'Ex: 12 (1 ano)' },
      { id: 'frequency', label: 'Modo de distribuição?', type: 'select', options: [
        { label: 'Focado (1 por vez)', value: 'focused' },
        { label: 'Livre (Lista completa)', value: 'flexible' }
      ]}
    ]
  }
};

export const COSMETIC_ITEMS = [
    { 
      id: 'theme_default', 
      type: 'theme', 
      name: 'Clássico', 
      description: 'Equilíbrio visual.', 
      cost: 0, 
      font: "sans-serif",
      palette: 'purple',
      previewGradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'theme_midas', 
      type: 'theme', 
      name: 'Toque de Midas', 
      description: 'Luxo e ostentação.', 
      cost: 50, 
      font: "'Cinzel', serif",
      palette: 'amber',
      previewGradient: 'from-amber-400 to-yellow-600'
    },
    { 
      id: 'theme_matrix', 
      type: 'theme', 
      name: 'The Matrix', 
      description: 'Wake up, Neo.', 
      cost: 30, 
      font: "'JetBrains Mono', monospace",
      palette: 'green',
      effect: 'matrix',
      previewGradient: 'from-green-500 to-emerald-700'
    },
    { 
      id: 'theme_cyber', 
      type: 'theme', 
      name: 'Cyberpunk', 
      description: 'High tech, low life.', 
      cost: 40, 
      font: "'Orbitron', sans-serif",
      palette: 'cyan',
      previewGradient: 'from-cyan-400 to-blue-600'
    },
    { id: 'border_bronze', type: 'border', name: 'Bronze', description: 'Iniciante.', cost: 10, className: 'ring-2 ring-orange-700 bg-orange-700/10' },
    { id: 'border_gold', type: 'border', name: 'Ouro Maciço', description: 'Ostentação.', cost: 100, className: 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-yellow-400/10' },
    { id: 'border_neon', type: 'border', name: 'Neon Blue', description: 'Futurista.', cost: 50, className: 'ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] bg-cyan-400/10' },
];

export const INITIAL_QUESTS = [
  { 
    type: 'checklist', 
    title: 'Beber 2L de Água', 
    category: 'health', 
    difficulty: 'easy', 
    sprint: 'ongoing', 
    frequency: 'daily', 
    completed: false, 
    subtasks: [] 
  },
  { 
    type: 'checklist', 
    title: 'Ler 10 Páginas', 
    category: 'learning', 
    difficulty: 'medium', 
    sprint: 'ongoing', 
    frequency: 'daily', 
    completed: false, 
    subtasks: [] 
  },
  {
    type: 'progressive',
    title: 'Reserva de Emergência',
    category: 'finance',
    difficulty: 'hard',
    sprint: 'ongoing',
    frequency: 'once',
    completed: false,
    progress: { current: 0, target: 1000, unit: 'R$' },
    subtasks: []
  }
];

export const INITIAL_REWARDS = [
  { title: 'Café da Tarde Premium', cost: 30 },
  { title: 'Episódio de Série (Noite)', cost: 50 },
  { title: 'Pedir Delivery (Fim de Semana)', cost: 200 },
  { title: 'Comprar um Livro Novo', cost: 300 }
];