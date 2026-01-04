import React, { useState, useEffect } from 'react';
import { User, Search, UserPlus, UserCheck, Users, Newspaper, Trophy, Crown, Clock, Flame, Heart, MessageCircle, Zap, Send } from 'lucide-react';
import { getFirestore, collection, getDocs, limit, query, doc, setDoc, deleteDoc, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove, where, getDoc } from 'firebase/firestore';
import { COSMETIC_ITEMS, DIFFICULTIES } from '../data/constants';
import { useAuth } from '../hooks/useAuth';
import { playSound } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import ChatWindow from '../components/ChatWindow';

export default function Community({ theme, TC, themeClasses }) {
  const { user: authUser, db, userData } = useAuth();
  const [activeView, setActiveView] = useState('feed'); 
  
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [chats, setChats] = useState([]); 
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingUserQuests, setViewingUserQuests] = useState([]); 
  const [activeChatUser, setActiveChatUser] = useState(null); 

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    return `${Math.floor(hours / 24)} d`;
  };

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        setLoading(true);
        if (authUser) {
            const qFollowing = collection(db, 'artifacts', 'legacy-26-production', 'users', authUser.uid, 'following');
            const snapshotFollowing = await getDocs(qFollowing);
            setFollowingIds(snapshotFollowing.docs.map(doc => doc.id));
        }
        const qUsers = query(collection(db, 'public_profiles'), limit(100));
        const snapshotUsers = await getDocs(qUsers);
        const loadedUsers = snapshotUsers.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(loadedUsers.filter(u => u.id !== authUser?.uid));
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchStaticData();
  }, [authUser, db]);

  useEffect(() => {
    if (activeView !== 'feed' && !viewingUser) return;
    setFeedLoading(true);
    const qPosts = query(collection(db, 'social_posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(qPosts, (snapshot) => {
        const loadedPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (activeView === 'feed') {
             const feedData = loadedPosts.filter(p => p.authorId === authUser?.uid || followingIds.includes(p.authorId));
             setPosts(feedData);
        } else {
             setPosts(loadedPosts); 
        }
        setFeedLoading(false);
    });
    return () => unsubscribe();
  }, [activeView, db, authUser, followingIds, viewingUser]);

  useEffect(() => {
      if (activeView !== 'chats' || !authUser) return;
      setLoading(true);
      const qChats = query(
          collection(db, 'conversations'), 
          where('participants', 'array-contains', authUser.uid),
          orderBy('updatedAt', 'desc')
      );
      const unsubscribe = onSnapshot(qChats, async (snapshot) => {
          const loadedChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setChats(loadedChats);
          setLoading(false);
      });
      return () => unsubscribe();
  }, [activeView, authUser, db]);

  const getChatPartner = (chat) => {
      if (!chat.participants) return null;
      const partnerId = chat.participants.find(id => id !== authUser.uid);
      return users.find(u => u.id === partnerId) || { id: partnerId, name: 'Usuário', avatar: '' };
  };

  const handleToggleFollow = async (targetUser) => {
      if (!authUser) return;
      const isFollowing = followingIds.includes(targetUser.id);
      const myFollowingRef = doc(db, 'artifacts', 'legacy-26-production', 'users', authUser.uid, 'following', targetUser.id);

      if (isFollowing) {
          setFollowingIds(prev => prev.filter(id => id !== targetUser.id));
          playSound('click');
          await deleteDoc(myFollowingRef);
      } else {
          setFollowingIds(prev => [...prev, targetUser.id]);
          playSound('coin');
          await setDoc(myFollowingRef, { name: targetUser.name, avatar: targetUser.avatar || '', followedAt: new Date().toISOString() });
      }
  };

  const handleIncentivize = async (quest) => {
      if (!authUser) return;
      const questRef = doc(db, 'public_quests', quest.id);
      const myId = authUser.uid;
      const incentives = quest.incentives || [];
      if (!incentives.includes(myId)) {
          playSound('powerup');
          await updateDoc(questRef, { incentives: arrayUnion(myId) });
      }
  };

  const handleLike = async (post) => {
      if (!authUser) return;
      const postRef = doc(db, 'social_posts', post.id);
      const myId = authUser.uid;
      const likes = post.likes || [];
      const hasLiked = likes.includes(myId);
      if (!hasLiked) playSound('pop');
      try {
          if (hasLiked) await updateDoc(postRef, { likes: arrayRemove(myId) });
          else await updateDoc(postRef, { likes: arrayUnion(myId) });
      } catch (error) { console.error(error); }
  };

  // --- FUNÇÃO PARA ABRIR PERFIL PELO AVATAR ---
  const handleProfileClick = (uid) => {
      if(uid === authUser.uid) return; // Não abre o próprio perfil
      const user = users.find(u => u.id === uid);
      if (user) {
          setViewingUser(user);
          playSound('pop');
      }
  };

  useEffect(() => {
      if (!viewingUser) { setViewingUserQuests([]); return; }
      const q = query(collection(db, 'public_quests'), where('uid', '==', viewingUser.id), where('completed', '==', false));
      const unsub = onSnapshot(q, (snap) => { setViewingUserQuests(snap.docs.map(d => ({ id: d.id, ...d.data() }))); });
      return () => unsub();
  }, [viewingUser, db]);

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fadeIn space-y-6 pb-20">
      
      {/* Abas */}
      <div className={`flex p-1 rounded-2xl border ${themeClasses.cardBg}`}>
        <button onClick={() => { setActiveView('feed'); playSound('click'); }} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeView === 'feed' ? TC.btn : `${themeClasses.textMuted} hover:bg-white/5`}`}>
            <Newspaper size={18} /> Jornal
        </button>
        <button onClick={() => { setActiveView('chats'); playSound('click'); }} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeView === 'chats' ? TC.btn : `${themeClasses.textMuted} hover:bg-white/5`}`}>
            <MessageCircle size={18} /> Direct
        </button>
        <button onClick={() => { setActiveView('users'); playSound('click'); }} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeView === 'users' ? TC.btn : `${themeClasses.textMuted} hover:bg-white/5`}`}>
            <Users size={18} /> Viajantes
        </button>
      </div>

      {/* FEED */}
      {activeView === 'feed' && (
          <div className="space-y-4">
             {feedLoading ? <div className="text-center py-10 opacity-50"><div className="animate-pulse">Carregando jornal...</div></div> : posts.length === 0 ? (
                <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                    <p className={`opacity-50 ${themeClasses.textMuted}`}>O jornal está silencioso.</p>
                </div>
             ) : (
                 posts.map(post => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        authUser={authUser} 
                        handleLike={handleLike} 
                        theme={theme} 
                        TC={TC} 
                        themeClasses={themeClasses} 
                        timeAgo={timeAgo} 
                        onAvatarClick={handleProfileClick} // <--- PASSANDO A FUNÇÃO
                    />
                 ))
             )}
          </div>
      )}

      {/* CHATS */}
      {activeView === 'chats' && (
          <div className="space-y-4">
              {loading ? <div className="text-center py-10 opacity-50">Carregando conversas...</div> : chats.length === 0 ? (
                  <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                      <MessageCircle size={40} className="mx-auto mb-2 opacity-30" />
                      <p className="opacity-50">Nenhuma conversa iniciada.</p>
                      <button onClick={() => setActiveView('users')} className={`mt-2 text-sm font-bold ${TC.text} hover:underline`}>Encontrar alguém</button>
                  </div>
              ) : (
                  chats.map(chat => {
                      const partner = getChatPartner(chat);
                      return (
                          <div 
                            key={chat.id} 
                            onClick={() => setActiveChatUser(partner)}
                            className={`p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer hover:scale-[1.01] ${themeClasses.cardBg}`}
                          >
                              <div className={`w-12 h-12 rounded-full bg-slate-800 overflow-hidden relative`}>
                                  {partner.avatar ? <img src={partner.avatar} className="w-full h-full object-cover" /> : <User size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500"/>}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-1">
                                      <h3 className="font-bold truncate">{partner.name}</h3>
                                      <span className={`text-[10px] ${themeClasses.textMuted}`}>{timeAgo(chat.updatedAt?.toDate())}</span>
                                  </div>
                                  <p className={`text-xs truncate ${themeClasses.textMuted}`}>{chat.lastMessage || '...'}</p>
                              </div>
                          </div>
                      );
                  })
              )}
          </div>
      )}

      {/* USERS */}
      {activeView === 'users' && (
          <div className="space-y-4">
             <div className={`flex items-center p-4 rounded-2xl border ${themeClasses.cardBg}`}>
                <Search size={20} className={`${themeClasses.textMuted} mr-3`} />
                <input type="text" placeholder="Buscar viajante..." className={`bg-transparent border-none outline-none w-full font-bold ${themeClasses.textMain}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(user => {
                    const borderItem = COSMETIC_ITEMS.find(c => c.id === user.border);
                    const borderClass = borderItem ? borderItem.className : 'border-2 border-slate-700';
                    return (
                        <div key={user.id} onClick={() => setViewingUser(user)} className={`p-5 rounded-3xl border flex items-center gap-5 transition-all hover:scale-[1.01] cursor-pointer ${themeClasses.cardBg}`}>
                            <div className={`w-14 h-14 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 relative ${borderClass}`}>
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-4 text-slate-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base truncate">{user.fullName || user.name}</h3>
                                <div className={`text-xs font-bold truncate ${themeClasses.textMuted}`}>@{user.name} • Nv. {user.level}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
          </div>
      )}

      {/* MODAL DE PERFIL */}
      <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title="Ficha do Viajante" theme={theme} modalClasses={{innerBg: theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900', textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}}>
        {viewingUser && (() => {
            const isFollowing = followingIds.includes(viewingUser.id);
            const borderItem = COSMETIC_ITEMS.find(c => c.id === viewingUser.border);
            const borderClass = borderItem ? borderItem.className : 'border-2 border-slate-700';

            return (
                <div className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className={`w-28 h-28 rounded-full bg-slate-800 overflow-hidden relative mb-4 ${borderClass} shadow-xl`}>
                            {viewingUser.avatar ? <img src={viewingUser.avatar} className="w-full h-full object-cover" /> : <User size={40} className="m-auto mt-8 text-slate-500" />}
                        </div>
                        <h2 className="text-2xl font-black">{viewingUser.fullName || viewingUser.name}</h2>
                        <div className={`text-sm font-bold ${themeClasses.textMuted}`}>@{viewingUser.name}</div>
                        
                        <div className="flex gap-3 w-full mt-6">
                            <button 
                                onClick={() => handleToggleFollow(viewingUser)} 
                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isFollowing ? 'bg-red-500/10 text-red-500 border border-red-500/20' : TC.btn}`}
                            >
                                {isFollowing ? <><UserCheck size={18}/> Deixar</> : <><UserPlus size={18}/> Seguir</>}
                            </button>
                            <button 
                                onClick={() => { setViewingUser(null); setActiveChatUser(viewingUser); }}
                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border ${theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100'}`}
                            >
                                <MessageCircle size={18} /> Mensagem
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-700/50 pt-4">
                        <h3 className="text-xs font-bold uppercase opacity-50 mb-3 tracking-wider">Metas Ativas</h3>
                        {viewingUserQuests.length === 0 ? (
                            <div className="text-center py-4 opacity-30 text-xs">Sem metas públicas ativas.</div>
                        ) : (
                            <div className="space-y-3">
                                {viewingUserQuests.map(quest => {
                                    const diff = DIFFICULTIES[quest.difficulty] || DIFFICULTIES.medium;
                                    const incentived = (quest.incentives || []).includes(authUser.uid);
                                    
                                    return (
                                        <div key={quest.id} className={`p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                            <div>
                                                <div className={`text-xs font-bold ${diff.color}`}>{quest.category?.toUpperCase()}</div>
                                                <div className="font-bold text-sm">{quest.title}</div>
                                            </div>
                                            <button 
                                                onClick={() => handleIncentivize(quest)}
                                                className={`p-2 rounded-lg transition-all ${incentived ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' : 'bg-white/5 hover:bg-yellow-500/20 text-yellow-500'}`}
                                                disabled={incentived}
                                                title="Incentivar!"
                                            >
                                                <Zap size={18} className={incentived ? "fill-black" : ""} />
                                                {(quest.incentives?.length > 0) && <span className="ml-1 text-xs font-black">{quest.incentives.length}</span>}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            );
        })()}
      </Modal>

      {/* Chat (com z-index corrigido para cobrir nav) */}
      {activeChatUser && (
          <ChatWindow 
            currentUser={{ uid: authUser.uid }} 
            targetUser={activeChatUser} 
            onClose={() => setActiveChatUser(null)} 
            theme={theme}
            themeClasses={themeClasses}
            TC={TC}
          />
      )}

    </div>
  );
}

// Componente PostCard (Atualizado com clique no avatar)
const PostCard = ({ post, authUser, handleLike, theme, TC, themeClasses, timeAgo, onAvatarClick }) => {
    const likes = post.likes || [];
    const hasLiked = likes.includes(authUser?.uid);

    return (
        <div className={`p-5 rounded-3xl border flex gap-4 ${themeClasses.cardBg}`}>
            {/* AVATAR CLICÁVEL */}
            <div 
                onClick={() => onAvatarClick(post.authorId)}
                className={`w-12 h-12 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border-2 border-slate-700 cursor-pointer hover:border-white transition-colors`}
            >
                {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-3 text-slate-500" />}
            </div>
            
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div className="text-sm font-bold mb-1">
                        {post.authorName} <span className={`opacity-50 font-normal ${themeClasses.textMuted}`}>
                            {post.type === 'levelup' ? 'subiu de nível!' : 'completou uma missão.'}
                        </span>
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 opacity-40 ${themeClasses.textMuted}`}>
                        <Clock size={10} /> {timeAgo(post.timestamp)}
                    </div>
                </div>
                <div className={`mt-2 p-3 rounded-xl border flex items-center gap-3 ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`p-2 rounded-lg ${post.type === 'levelup' ? 'bg-yellow-500/20 text-yellow-500' : `${TC.iconBg} ${TC.text}`}`}>
                        {post.type === 'levelup' ? <Crown size={20} /> : <Trophy size={20} />}
                    </div>
                    <div>
                        <div className="font-bold text-sm">{post.title}</div>
                        {post.xp > 0 && <div className="text-[10px] font-bold opacity-60 text-purple-400">+{post.xp} XP</div>}
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                    <button onClick={() => handleLike(post)} className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${hasLiked ? 'text-pink-500' : 'text-slate-500 hover:text-pink-400'}`}>
                        <Heart size={16} className={hasLiked ? "fill-current" : ""} />
                        {likes.length > 0 && <span>{likes.length}</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};