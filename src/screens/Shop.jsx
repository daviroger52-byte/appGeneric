import React from 'react';
import { ShoppingBag, Trophy, Trash2, History, Gem } from 'lucide-react';
import { COSMETIC_ITEMS } from '../data/constants';

export default function Shop({
  shopTab,
  setShopTab,
  rewards,
  history,
  userData,
  theme,
  TC,
  themeClasses,
  currentThemeBase,
  handleBuyCosmetic,
  handleEquipCosmetic,
  requestBuyReward,
  requestDeleteReward,
  requestDeleteHistory,
  setEditingRewardId,
  setIsRewardModalOpen
}) {
  return (
    <div className="animate-fadeIn space-y-8">
      <div className={`flex gap-8 border-b pb-2 mb-8 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
        <button onClick={() => setShopTab('rewards')} className={`pb-3 text-sm font-bold transition-all relative ${shopTab === 'rewards' ? TC.text : themeClasses.textMuted}`}>
          {shopTab === 'rewards' && <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${TC.bg} rounded-t-full`}></span>}Recompensas
        </button>
        <button onClick={() => setShopTab('cosmetics')} className={`pb-3 text-sm font-bold transition-all relative ${shopTab === 'cosmetics' ? TC.text : themeClasses.textMuted}`}>
          {shopTab === 'cosmetics' && <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${TC.bg} rounded-t-full`}></span>}Cosméticos
        </button>
      </div>

      {shopTab === 'rewards' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold flex items-center gap-3 ${themeClasses.textMain}`}><ShoppingBag className={TC.text} /> Itens Reais</h2>
            <button onClick={() => { setEditingRewardId(null); setIsRewardModalOpen(true); }} className={`px-5 py-2.5 rounded-2xl text-sm font-bold border transition-colors active:scale-95 ${TC.btnSec}`}>+ Criar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewards.map(reward => { 
              const canAfford = (userData?.gold || 0) >= reward.cost; 
              return (
                <div key={reward.id} className={`rounded-3xl p-6 border flex flex-col justify-between group relative transition-transform hover:-translate-y-1 ${themeClasses.cardBg}`}>
                  <div className="mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${TC.iconBg} ${TC.text}`}><Trophy size={28} /></div>
                    <h3 className="font-bold text-xl">{reward.title}</h3>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { if(canAfford) requestBuyReward(reward); }} disabled={!canAfford} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${canAfford ? `${TC.btn}` : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                      {canAfford ? 'Comprar' : `${userData?.gold} / ${reward.cost}`} Ouro
                    </button>
                    <button onClick={() => requestDeleteReward(reward.id)} className="p-3 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 active:scale-95 transition-colors border border-transparent hover:border-red-500/20"><Trash2 size={22}/></button>
                  </div>
                </div>
              ) 
            })}
          </div>
          <div className="mt-12">
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${themeClasses.textMuted}`}><History size={20} /> Histórico de Resgates</h3>
            {history.length === 0 ? ( 
              <p className={`text-sm italic ${themeClasses.textMuted} text-center py-8`}>Nenhuma recompensa resgatada ainda.</p> 
            ) : ( 
              <div className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                {history.map((item, index) => ( 
                  <div key={item.id || index} className={`flex justify-between items-center p-4 border-b last:border-0 ${theme === 'dark' ? 'bg-white/5 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div><div className="font-bold">{item.title}</div><div className={`text-xs mt-1 ${themeClasses.textMuted}`}>{new Date(item.date).toLocaleDateString()}</div></div>
                    <div className="flex items-center gap-4"><div className="text-red-500 font-bold">-{item.cost} Ouro</div><button onClick={() => requestDeleteHistory(item.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={18} /></button></div>
                  </div> 
                ))}
              </div> 
            )}
          </div>
        </div>
      )}

      {shopTab === 'cosmetics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COSMETIC_ITEMS.filter(i => i.type === 'theme' || i.type === 'border').map(item => { 
            const owned = userData.inventory?.includes(item.id); 
            const equipped = userData.equipped?.[item.type] === item.id; 
            const canAfford = (userData.diamonds || 0) >= item.cost; 
            return ( 
              <div key={item.id} className={`rounded-3xl p-6 border flex flex-col justify-between transition-transform hover:-translate-y-1 ${themeClasses.cardBg} ${equipped ? `ring-2 ring-${currentThemeBase.palette}-500 bg-${currentThemeBase.palette}-500/5` : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div><div className={`text-[10px] font-bold uppercase mb-2 tracking-wider ${themeClasses.textMuted}`}>{item.type === 'theme' ? 'Tema' : 'Borda'}</div><h3 className="font-bold text-xl leading-tight">{item.name}</h3><p className={`text-sm mb-6 mt-2 ${themeClasses.textMuted}`}>{item.description}</p></div>
                  {item.type === 'theme' ? (<div className={`w-12 h-12 rounded-2xl bg-gradient-to-br shadow-lg ${item.previewGradient}`}></div>) : (<div className={`w-12 h-12 rounded-full bg-slate-800 ${item.className}`}></div>)}
                </div>
                {owned ? (
                  <button onClick={() => handleEquipCosmetic(item)} disabled={equipped} className={`w-full py-3 rounded-2xl font-bold text-sm mt-auto active:scale-95 transition-transform ${equipped ? `bg-${currentThemeBase.palette}-500/20 text-${currentThemeBase.palette}-500 cursor-default border border-${currentThemeBase.palette}-500/50` : TC.btnSec}`}>{equipped ? 'Equipado' : 'Equipar'}</button>
                ) : (
                  <button onClick={() => handleBuyCosmetic(item)} disabled={!canAfford} className={`w-full py-3 rounded-2xl font-bold text-sm mt-auto transition-all active:scale-95 ${canAfford ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-lg shadow-cyan-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Comprar {item.cost} <Gem size={14} className="inline ml-1"/></button>
                )}
              </div> 
            );
          })}
        </div>
      )}
    </div>
  );
}