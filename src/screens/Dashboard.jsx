import React, { useMemo } from 'react';
import { Trophy, TrendingUp, Activity, Coins, BookOpen, Dumbbell, Droplets, Zap, Clock, Star } from 'lucide-react';
import { METRICS } from '../data/constants'; // Certifique-se que METRICS está no constants.js

export default function Dashboard({ userData, quests, totalSpent, theme, TC, themeClasses }) {
  
  // Lógica de Agrupamento de Métricas
  const aggregatedMetrics = useMemo(() => {
    const totals = {};

    quests.forEach(quest => {
      // Só conta se for do tipo 'progressive' e tiver uma métrica definida
      if (quest.type === 'progressive' && quest.metric && quest.progress?.current) {
        const key = quest.metric;
        if (!totals[key]) totals[key] = 0;
        totals[key] += Number(quest.progress.current);
      }
    });

    return totals;
  }, [quests]);

  // Ícones mapeados para as chaves de métrica (fallback para Star se não achar)
  const getIcon = (key) => {
    const metricData = METRICS[key];
    if (metricData && metricData.icon) return metricData.icon;
    
    // Fallbacks manuais caso a constante não tenha o ícone direto ou seja custom
    switch (key) {
        case 'pages': return BookOpen;
        case 'workouts': return Dumbbell;
        case 'water': return Droplets;
        case 'meditation': return Zap;
        case 'hours': return Clock;
        default: return Star;
    }
  };

  const getLabel = (key) => {
      return METRICS[key]?.label || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const getUnit = (key) => {
      return METRICS[key]?.unit || '';
  };

  const completedCount = quests.filter(q => q.completed).length;
  const activeCount = quests.filter(q => !q.completed).length;

  return (
    <div className="animate-fadeIn space-y-8 pb-20">
      
      {/* Cabeçalho */}
      <div>
        <h2 className={`text-2xl font-black ${TC.title}`}>Legado do Viajante</h2>
        <p className={`text-sm ${themeClasses.textMuted}`}>O somatório de todas as suas conquistas.</p>
      </div>

      {/* Resumo Geral (Topo) */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${themeClasses.cardBg}`}>
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-xl ${TC.iconBg} ${TC.text}`}><Trophy size={20}/></div>
                <span className="text-2xl font-black">{completedCount}</span>
            </div>
            <div className="text-xs font-bold opacity-60">Missões Concluídas</div>
        </div>
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${themeClasses.cardBg}`}>
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-xl bg-yellow-500/10 text-yellow-500`}><Coins size={20}/></div>
                <span className="text-2xl font-black text-yellow-500">{totalSpent}</span>
            </div>
            <div className="text-xs font-bold opacity-60">Ouro Investido</div>
        </div>
      </div>

      {/* GRID DE MÉTRICAS (CONQUISTAS) */}
      <div>
          <h3 className="text-sm font-bold uppercase opacity-50 mb-4 tracking-wider flex items-center gap-2">
            <Activity size={16}/> Estatísticas Vitais
          </h3>
          
          {Object.keys(aggregatedMetrics).length === 0 ? (
              <div className={`p-8 border-2 border-dashed rounded-3xl text-center opacity-40 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                  <p className="text-sm font-bold">Nenhum dado progressivo registrado ainda.</p>
                  <p className="text-xs mt-1">Crie missões do tipo "Progresso" (ex: Ler páginas, Beber água) para ver suas estatísticas aqui.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(aggregatedMetrics).map(([key, value]) => {
                      const Icon = getIcon(key);
                      return (
                        <div key={key} className={`p-6 rounded-3xl border flex items-center gap-5 transition-all hover:scale-[1.02] ${themeClasses.cardBg}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 border border-slate-100'}`}>
                                <Icon size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="text-3xl font-black tracking-tight">
                                    {value} <span className="text-sm font-bold opacity-50 text-slate-500">{getUnit(key)}</span>
                                </div>
                                <div className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>
                                    Total de {getLabel(key)}
                                </div>
                            </div>
                        </div>
                      );
                  })}
              </div>
          )}
      </div>
    </div>
  );
}