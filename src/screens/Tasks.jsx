import React from 'react';
import { Target, CheckCircle2, Calendar, MoreVertical, Flame, Play, AlertCircle, Plus } from 'lucide-react';
import { DIFFICULTIES, CATEGORIES, SPRINTS } from '../data/constants';
import ProgressBar from '../components/ui/ProgressBar';
import { playSound } from '../utils/helpers';

export default function Tasks({ 
    quests, activeSprint, setActiveSprint, theme, TC, themeClasses, currentThemeBase,
    handleEditQuest, handleTogglePriority, requestDeleteQuest, handleCompleteQuest, 
    handleResetQuest, setUpdatingProgressQuest, setEditingQuestId, setIsAddModalOpen,
    setProgressAmount, setProgressMode, setIsProgressModalOpen, onAddQuest 
}) {

  // Filtra quests baseado no sprint ativo
  const filteredQuests = quests.filter(q => {
      if (activeSprint === 'ongoing') return q.sprint === 'ongoing';
      return q.sprint === activeSprint || q.sprint === 'ongoing';
  }).sort((a, b) => {
      // Ordenação: Prioridade > Completado > Data
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const activeQuests = filteredQuests.filter(q => !q.completed);
  const completedQuests = filteredQuests.filter(q => q.completed);

  return (
    <div className="space-y-6">
        
        {/* Filtros de Sprint (Abas Superiores) */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {Object.values(SPRINTS).map(s => (
                <button 
                    key={s.id} 
                    onClick={() => { setActiveSprint(s.id); playSound('click'); }}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        activeSprint === s.id 
                        ? `${TC.bg} text-white border-transparent shadow-lg` 
                        : `bg-transparent ${themeClasses.textMuted} border-transparent hover:bg-white/5`
                    }`}
                >
                    {s.title}
                </button>
            ))}
        </div>

        {/* SEÇÃO: MISSÕES ATIVAS + BOTÃO NOVA META */}
        <div>
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className={`text-xl font-black ${TC.title}`}>Missões Ativas</h2>
                    <p className={`text-xs ${themeClasses.textMuted}`}>Foco total no objetivo.</p>
                </div>
                
                <button 
                    onClick={onAddQuest}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg ${TC.btn}`}
                >
                    <Plus size={16} /> Nova Meta
                </button>
            </div>

            <div className="space-y-3">
                {activeQuests.length === 0 ? (
                    <div className={`p-8 border-2 border-dashed rounded-3xl text-center opacity-50 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                        <Target size={40} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-bold">Nenhuma missão ativa.</p>
                        <p className="text-xs">Crie uma nova meta para começar.</p>
                    </div>
                ) : (
                    activeQuests.map(quest => (
                        <QuestCard 
                            key={quest.id} 
                            quest={quest} 
                            theme={theme} 
                            TC={TC} 
                            themeClasses={themeClasses}
                            currentThemeBase={currentThemeBase}
                            handleEditQuest={handleEditQuest}
                            handleTogglePriority={handleTogglePriority}
                            requestDeleteQuest={requestDeleteQuest}
                            handleCompleteQuest={handleCompleteQuest}
                            setUpdatingProgressQuest={setUpdatingProgressQuest}
                            setIsProgressModalOpen={setIsProgressModalOpen}
                            setProgressAmount={setProgressAmount}
                            setProgressMode={setProgressMode}
                        />
                    ))
                )}
            </div>
        </div>

        {/* SEÇÃO: CONCLUÍDAS */}
        {completedQuests.length > 0 && (
            <div className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Concluídas
                </h3>
                <div className="space-y-3">
                    {completedQuests.map(quest => (
                        <QuestCard 
                            key={quest.id} 
                            quest={quest} 
                            theme={theme} 
                            TC={TC} 
                            themeClasses={themeClasses}
                            currentThemeBase={currentThemeBase}
                            handleEditQuest={handleEditQuest}
                            handleTogglePriority={handleTogglePriority}
                            requestDeleteQuest={requestDeleteQuest}
                            handleResetQuest={handleResetQuest}
                            completed={true}
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}

// Componente do Card (Sem a exclamação visual)
const QuestCard = ({ 
    quest, theme, TC, themeClasses, currentThemeBase, completed,
    handleEditQuest, handleTogglePriority, requestDeleteQuest, 
    handleCompleteQuest, handleResetQuest, setUpdatingProgressQuest, 
    setIsProgressModalOpen, setProgressAmount, setProgressMode 
}) => {
    
    const diffData = DIFFICULTIES[quest.difficulty] || DIFFICULTIES.easy;
    const catColor = CATEGORIES[quest.category]?.color || 'text-slate-500';

    return (
        <div className={`relative group p-4 rounded-2xl border transition-all ${completed ? 'opacity-75 bg-slate-900/10' : `${themeClasses.cardBg} hover:border-${currentThemeBase?.palette}-500/50 hover:shadow-lg`}`}>
            
            {/* REMOVIDO: O bloco visual da exclamação (AlertCircle) foi retirado daqui.
               A lógica de ordenação no componente Tasks acima garante que ele continua no topo.
            */}

            <div className="flex gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                    <button 
                        onClick={() => completed ? handleResetQuest(quest.id) : handleCompleteQuest(quest.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : `border-slate-500 hover:border-${currentThemeBase?.palette}-400`
                        }`}
                    >
                        {completed && <CheckCircle2 size={14} />}
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0" onClick={() => !completed && handleEditQuest(quest)}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${theme==='dark'?'bg-white/10':'bg-slate-100'} ${catColor}`}>
                            {CATEGORIES[quest.category]?.label}
                        </span>
                        {quest.difficulty === 'epic' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold">ÉPICA</span>}
                        {quest.isPublic && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">PÚBLICA</span>}
                    </div>
                    
                    <h3 className={`font-bold leading-tight ${completed ? 'line-through opacity-50' : ''}`}>{quest.title}</h3>
                    
                    {/* Barra de Progresso (Se houver) */}
                    {quest.type === 'progressive' && quest.progress && (
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between text-[10px] font-bold mb-1 opacity-70">
                                <span>{quest.progress.current} / {quest.progress.target} {quest.progress.unit}</span>
                                <span>{Math.round((quest.progress.current / quest.progress.target) * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <ProgressBar current={quest.progress.current} max={quest.progress.target} colorClass={completed ? 'bg-green-500' : TC.bar} theme={theme} height="h-2" />
                                </div>
                                {!completed && (
                                    <button 
                                        onClick={() => {
                                            setUpdatingProgressQuest(quest);
                                            setProgressAmount('');
                                            setProgressMode('add');
                                            setIsProgressModalOpen(true);
                                            playSound('pop');
                                        }}
                                        className={`p-1 rounded hover:bg-white/10 ${TC.text}`}
                                    >
                                        <Play size={12} fill="currentColor" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Subtarefas */}
                    {quest.type === 'checklist' && quest.subtasks && quest.subtasks.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {quest.subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs opacity-70">
                                    <div className={`w-1.5 h-1.5 rounded-full ${sub.completed ? 'bg-green-500' : 'bg-slate-600'}`} />
                                    <span className={sub.completed ? 'line-through' : ''}>{sub.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ações (Delete / Priority) */}
                {!completed && (
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleTogglePriority(quest)} className={`p-1.5 rounded-lg hover:bg-white/10 ${quest.isPriority ? 'text-red-500' : 'text-slate-500'}`} title="Prioridade">
                            <Flame size={14} className={quest.isPriority ? 'fill-current' : ''} />
                        </button>
                        <button onClick={() => requestDeleteQuest(quest.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400" title="Excluir">
                            <MoreVertical size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};