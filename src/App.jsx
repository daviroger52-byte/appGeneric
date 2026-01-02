import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Target, Zap, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, 
  TrendingUp, Brain, Wallet, Dumbbell, Star, X, Calendar, ListChecks, 
  AlertTriangle, Pencil, BarChart3, PieChart, LayoutDashboard, Percent,
  Sun, Moon, LogOut, User, Lock, Mail, Loader2, Chrome, History, Flame, Repeat,
  PartyPopper, Palette, Shield, Gem, Camera, Save, ChevronRight, Clock, Check, Menu
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  addDoc, 
  writeBatch,
  enableNetwork,
  query,
  orderBy,
  limit,
  where,
  getDocs
} from 'firebase/firestore';

// --- IMPORTS ---
import { 
  DIFFICULTIES, 
  CATEGORIES, 
  SPRINTS, 
  FREQUENCIES, 
  COSMETIC_ITEMS, 
  INITIAL_QUESTS, 
  INITIAL_REWARDS 
} from './data/constants';

import { playSound, compressImage } from './utils/helpers';

import Modal from './components/ui/Modal';
import ProgressBar from './components/ui/ProgressBar';
import FloatingText from './components/ui/FloatingText';
import Confetti from './components/ui/Confetti';
import RadarChart from './components/charts/RadarChart';
import MonthlyChart from './components/charts/MonthlyChart';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyA3qR1xYs3mIVRcWtBqIbUh2CpntbIrYPY",
  authDomain: "legacy-d2109.firebaseapp.com",
  projectId: "legacy-d2109",
  storageBucket: "legacy-d2109.firebasestorage.app",
  messagingSenderId: "741100735718",
  appId: "1:741100735718:web:6e8a23d09e9cd1c233ff27",
  measurementId: "G-LFTD73T9MR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'legacy-26-production';

export default function Legacy26App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [dbError, setDbError] = useState(false);
  
  const [userData, setUserData] = useState(null); 
  const [quests, setQuests] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]); 
  const [xpHistory, setXpHistory] = useState([]); 
  
  const [activeTab, setActiveTab] = useState('quests');
  const [shopTab, setShopTab] = useState('rewards');
  const [activeSprint, setActiveSprint] = useState('sprint1');
  const [floatingTexts, setFloatingTexts] = useState([]);
  
  const xpBarRef = useRef(null);
  const goldRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState(false);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakModal, setStreakModal] = useState(false);
  const [confirmation, setConfirmation] = useState({ isOpen: false, type: null, data: null, title: '', message: '', actionLabel: '' });
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({ name: '', fullName: '', phone: '', birthDate: '', bio: '', avatar: '' });
  
  const [editingQuestId, setEditingQuestId] = useState(null);
  const [newQuest, setNewQuest] = useState({ type: 'checklist', title: '', category: 'health', difficulty: 'easy', sprint: 'sprint1', frequency: 'once', hasSubtasks: false, tempSubtask: '', progressTarget: '', progressUnit: 'R$' });
  const [newSubtasksList, setNewSubtasksList] = useState([]);
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [newReward, setNewReward] = useState({ title: '', cost: 50 });
  const [updatingProgressQuest, setUpdatingProgressQuest] = useState(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [progressMode, setProgressMode] = useState('add');

  const getThemeColors = () => {
      const themeId = userData?.equipped?.theme || 'theme_default';
      const themeObj = COSMETIC_ITEMS.find(c => c.id === themeId);
      return themeObj?.colors || COSMETIC_ITEMS[0].colors;
  };
  
  const currentThemeColors = getThemeColors();
  
  const addFloatingText = (text, color, targetRef = null) => {
      const id = Date.now();
      let x, y;
      if (targetRef && targetRef.current) {
          const rect = targetRef.current.getBoundingClientRect();
          x = rect.left + rect.width / 2; 
          y = rect.top + rect.height;     
      } else {
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
      }
      setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 2000);
  };
  
  const checkDailyRoutine = async (uid, currentData) => {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = currentData.lastLoginDate;
      if (lastLogin !== today) {
          const batch = writeBatch(db);
          const userRef = doc(db, 'artifacts', appId, 'users', uid, 'profile', 'main');
          const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];
          let newStreak = currentData.streak || 0;
          if (lastLogin < yesterdayString) newStreak = 0;
          const qSnapshot = await getDocs(query(collection(db, 'artifacts', appId, 'users', uid, 'quests'), where('frequency', '==', 'daily')));
          qSnapshot.forEach(doc => { if (doc.data().completed) batch.update(doc.ref, { completed: false }); });
          const historyRef = doc(collection(db, 'artifacts', appId, 'users', uid, 'xp_history'), today);
          batch.set(historyRef, { date: today, xp: currentData.xp });
          batch.update(userRef, { lastLoginDate: today, streak: newStreak, dailyTaskDone: false });
          await batch.commit();
      }
  };

  useEffect(() => {
    try { enableNetwork(db); } catch(e) {}
    let unsubProfile = null, unsubQuests = null, unsubRewards = null, unsubHistory = null, unsubXpHistory = null;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (unsubProfile) unsubProfile(); if (unsubQuests) unsubQuests(); if (unsubRewards) unsubRewards(); if (unsubHistory) unsubHistory(); if (unsubXpHistory) unsubXpHistory();
      setAuthUser(user);
      if (user) {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
        unsubProfile = onSnapshot(userRef, (snap) => {
          setDbError(false);
          if (snap.exists()) {
              const data = snap.data();
              if (!data.inventory) data.inventory = ['theme_default', 'border_default'];
              if (!data.equipped) data.equipped = { theme: 'theme_default', border: 'border_default' };
              if (data.diamonds === undefined) data.diamonds = 5;
              setUserData(data);
              checkDailyRoutine(user.uid, data);
          } else if(!isSignUp) {
             setUserData({ name: user.displayName || 'Viajante', level: 1, xp: 0, xpToNextLevel: 100, gold: 0, diamonds: 5, streak: 0, inventory: ['theme_default', 'border_default'], equipped: { theme: 'theme_default', border: 'border_default' } });
          }
          setLoading(false);
        }, (error) => { if (error.code === 'permission-denied') setDbError(true); setLoading(false); });
        unsubQuests = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'quests'), (snap) => setQuests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        unsubRewards = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'rewards'), (snap) => setRewards(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const qHistory = query(collection(db, 'artifacts', appId, 'users', user.uid, 'history'), orderBy('date', 'desc'), limit(50));
        unsubHistory = onSnapshot(qHistory, (snap) => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const qXp = query(collection(db, 'artifacts', appId, 'users', user.uid, 'xp_history'), orderBy('date', 'asc'), limit(365));
        unsubXpHistory = onSnapshot(qXp, (snap) => setXpHistory(snap.docs.map(d => d.data())));
      } else { setLoading(false); setUserData(null); setQuests([]); setRewards([]); setHistory([]); }
    });
    return () => { unsubscribe(); if(unsubProfile) unsubProfile(); };
  }, []);

  const seedInitialData = async (userId) => {
    const batch = writeBatch(db);
    INITIAL_QUESTS.forEach(q => { const ref = doc(collection(db, 'artifacts', appId, 'users', userId, 'quests')); batch.set(ref, { ...q, id: ref.id }); });
    INITIAL_REWARDS.forEach(r => { const ref = doc(collection(db, 'artifacts', appId, 'users', userId, 'rewards')); batch.set(ref, { ...r, id: ref.id }); });
    await batch.commit();
  };

  const handleAuth = async (e) => {
    e.preventDefault(); setAuthError(''); setAuthLoading(true); playSound('click');
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        const initialData = { name: authName || 'Viajante', level: 1, xp: 0, xpToNextLevel: 100, gold: 0, diamonds: 5, streak: 0, lastLoginDate: new Date().toISOString().split('T')[0], inventory: ['theme_default', 'border_default'], equipped: { theme: 'theme_default', border: 'border_default' }, fullName: '', phone: '', birthDate: '', bio: '' };
        await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'main'), initialData);
        await seedInitialData(cred.user.uid);
      } else { await signInWithEmailAndPassword(auth, authEmail, authPassword); }
    } catch (error) { setAuthError("Erro ao autenticar."); } finally { setAuthLoading(false); }
  };

  const handleGoogleAuth = async () => {
    setAuthError(''); setAuthLoading(true); playSound('click');
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'artifacts', appId, 'users', res.user.uid, 'profile', 'main');
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
         await setDoc(userRef, { name: res.user.displayName || 'Viajante', avatar: res.user.photoURL || '', phone: res.user.phoneNumber || '', email: res.user.email, emailVerified: res.user.emailVerified, createdAt: res.user.metadata.creationTime, level: 1, xp: 0, xpToNextLevel: 100, gold: 0, diamonds: 5, streak: 0, lastLoginDate: new Date().toISOString().split('T')[0], inventory: ['theme_default', 'border_default'], equipped: { theme: 'theme_default', border: 'border_default' }, fullName: '', birthDate: '', bio: '' });
         await seedInitialData(res.user.uid);
      }
    } catch (error) { if (error.code !== 'auth/popup-closed-by-user') setAuthError("Erro Google."); } finally { setAuthLoading(false); }
  };

  const saveUserStats = async (newData) => { if (authUser) await updateDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'profile', 'main'), newData); };
  
  const updateUserStats = (xpDelta, goldDelta, isQuestCompletion = false) => {
    if (!userData) return;
    const prev = userData;
    let newXp = Math.max(0, prev.xp + xpDelta);
    let newGold = Math.max(0, prev.gold + goldDelta);
    let newLevel = prev.level;
    let newXpToNext = prev.xpToNextLevel;
    let newStreak = prev.streak || 0;
    let dailyDone = prev.dailyTaskDone || false;

    if (xpDelta > 0) {
        playSound('coin');
        addFloatingText(`+${xpDelta} XP`, '#a855f7', xpBarRef);
        setTimeout(() => addFloatingText(`+${goldDelta} Gold`, '#eab308', goldRef), 200);
    }

    if (xpDelta > 0 && newXp >= prev.xpToNextLevel) { 
        newLevel += 1;
        newXp = newXp - prev.xpToNextLevel; newXpToNext = Math.floor(prev.xpToNextLevel * 1.5); 
        setLevelUpModal(true); setShowConfetti(true); playSound('levelUp'); setTimeout(() => setShowConfetti(false), 5000);
    }
    if (isQuestCompletion && xpDelta > 0 && !dailyDone) {
        newStreak += 1;
        dailyDone = true; setStreakModal(true); setShowConfetti(true); playSound('streak'); setTimeout(() => setShowConfetti(false), 3000);
    }
    const newData = { ...prev, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext, gold: newGold, streak: newStreak, dailyTaskDone: dailyDone };
    setUserData(newData); saveUserStats(newData);
    const today = new Date().toISOString().split('T')[0];
    const historyRef = doc(db, 'artifacts', appId, 'users', authUser.uid, 'xp_history', today);
    setDoc(historyRef, { date: today, xp: newXp }, { merge: true });
  };

  const handleBuyCosmetic = (item) => {
      if (userData.inventory.includes(item.id)) return;
      if (userData.diamonds < item.cost) { alert("Diamantes insuficientes!"); return; }
      if(confirm(`Comprar ${item.name} por ${item.cost} Diamantes?`)) {
          const newDiamonds = userData.diamonds - item.cost;
          const newInv = [...userData.inventory, item.id];
          const newData = { ...userData, diamonds: newDiamonds, inventory: newInv };
          setUserData(newData); saveUserStats(newData); playSound('buy');
      }
  };
  const handleEquipCosmetic = (item) => {
      if (!userData.inventory.includes(item.id)) return;
      const newEquipped = { ...userData.equipped, [item.type]: item.id };
      const newData = { ...userData, equipped: newEquipped };
      setUserData(newData); saveUserStats(newData); playSound('click');
  };
  const handleOpenProfileModal = () => { setProfileForm({ name: userData.name || '', fullName: userData.fullName || '', phone: userData.phone || '', birthDate: userData.birthDate || '', bio: userData.bio || '', avatar: userData.avatar || '' }); setIsProfileModalOpen(true); playSound('pop'); };
  const handleAvatarChange = async (e) => { const file = e.target.files[0]; if (file) { const resizedImage = await compressImage(file); setProfileForm(prev => ({ ...prev, avatar: resizedImage })); } };
  const handleSaveProfile = async () => { if(!authUser) return; const newData = { ...userData, ...profileForm }; setUserData(newData); await saveUserStats(newData); setIsProfileModalOpen(false); playSound('coin'); };
  
  const saveQuestToDb = async (quest) => { if (authUser) { const qId = quest.id ? quest.id.toString() : Date.now().toString(); await setDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'quests', qId), { ...quest, id: qId }); } };
  const deleteQuestFromDb = async (id) => { if (authUser) await deleteDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'quests', id.toString())); };
  const deleteRewardFromDb = async (id) => { if (authUser) await deleteDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'rewards', id.toString())); };
  const saveRewardToDb = async (reward) => { if (authUser) { const rId = reward.id ? reward.id.toString() : Date.now().toString(); await setDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'rewards', rId), { ...reward, id: rId }); } };
  const saveHistoryToDb = async (item) => { if (!authUser) return; await addDoc(collection(db, 'artifacts', appId, 'users', authUser.uid, 'history'), { title: item.title, cost: item.cost, date: new Date().toISOString() }); };
  const requestDeleteQuest = (id) => { setConfirmation({ isOpen: true, type: 'delete_quest', data: id, title: 'Excluir Meta', message: 'Tem certeza?', actionLabel: 'Excluir' }); playSound('pop'); };
  const requestDeleteReward = (id) => { setConfirmation({ isOpen: true, type: 'delete_reward', data: id, title: 'Excluir Item', message: 'Remover da loja?', actionLabel: 'Excluir' }); playSound('pop'); };
  const requestBuyReward = (reward) => { if ((userData?.gold || 0) < reward.cost) return alert("Ouro insuficiente!"); setConfirmation({ isOpen: true, type: 'buy_reward', data: reward, title: 'Resgatar', message: `Gastar ${reward.cost} ouro?`, actionLabel: 'Comprar' }); playSound('pop'); };
  const executeConfirmation = () => {
    if (confirmation.type === 'delete_quest') deleteQuestFromDb(confirmation.data);
    else if (confirmation.type === 'delete_reward') deleteRewardFromDb(confirmation.data);
    else if (confirmation.type === 'buy_reward') { updateUserStats(0, -confirmation.data.cost); saveHistoryToDb(confirmation.data); playSound('buy'); }
    setConfirmation({ ...confirmation, isOpen: false });
  };
  const handleSaveQuest = () => { if (!newQuest.title.trim()) return; const subtasksArray = newQuest.type === 'checklist' ? newSubtasksList.map((title, index) => { let existingSub = null; if(editingQuestId) { const oldQuest = quests.find(q => q.id === editingQuestId); existingSub = oldQuest?.subtasks?.find(s => s.title === title); } return { id: existingSub ? existingSub.id : `st_${Date.now()}_${index}`, title, completed: existingSub ? existingSub.completed : false }; }) : []; const progressObj = newQuest.type === 'progressive' ? { current: editingQuestId ? (quests.find(q => q.id === editingQuestId)?.progress?.current || 0) : 0, target: parseFloat(newQuest.progressTarget) || 100, unit: newQuest.progressUnit || 'un' } : null; const questData = { id: editingQuestId || Date.now().toString(), type: newQuest.type, title: newQuest.title, category: newQuest.category, difficulty: newQuest.difficulty, sprint: newQuest.sprint, frequency: newQuest.frequency || 'once', completed: false, subtasks: subtasksArray, progress: progressObj, createdAt: editingQuestId ? quests.find(q => q.id === editingQuestId).createdAt : Date.now() }; saveQuestToDb(questData); setIsAddModalOpen(false); playSound('coin'); };
  const handleSaveReward = () => { if(!newReward.title.trim()) return; const rId = editingRewardId || Date.now().toString(); saveRewardToDb({ id: rId, title: newReward.title, cost: parseInt(newReward.cost)||0 }); setIsRewardModalOpen(false); playSound('coin'); };
  
  // FUNÇÃO ATUALIZADA: Agora lida com conclusão e reset (subtração de pontos)
  const handleCompleteQuest = (id, e) => { 
      const quest = quests.find(q => q.id === id); 
      if (quest.completed) return; 
      const diffData = DIFFICULTIES[quest.difficulty]; 
      updateUserStats(diffData.xp, diffData.gold, true); 
      saveQuestToDb({...quest, completed: true}); 
      if (quest.difficulty === 'epic') { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); } 
  };
  
  const handleResetQuest = (id) => { 
      const quest = quests.find(q => q.id === id); 
      const diffData = DIFFICULTIES[quest.difficulty]; 
      updateUserStats(-diffData.xp, -diffData.gold); 
      saveQuestToDb({...quest, completed: false}); 
  };

  const handleUpdateProgress = () => { if (!updatingProgressQuest || !progressAmount) return; const amt = parseFloat(progressAmount); const q = updatingProgressQuest; if(q && amt) { const diff = progressMode === 'add' ? amt : -amt; const newCurr = Math.max(0, (q.progress?.current || 0) + diff); const complete = newCurr >= q.progress.target; const qData = DIFFICULTIES[q.difficulty]; const xpReward = Math.floor((amt / q.progress.target) * qData.xp); const goldReward = Math.floor((amt / q.progress.target) * qData.gold); if(progressMode === 'add') updateUserStats(Math.max(1, xpReward), Math.max(1, goldReward), complete); else updateUserStats(-Math.max(1, xpReward), -Math.max(1, goldReward)); saveQuestToDb({ ...q, completed: complete, progress: { ...q.progress, current: newCurr } }); setIsProgressModalOpen(false); playSound('coin'); } };
  
  const themeClasses = {
    appBg: theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    cardBg: theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    headerBg: theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200',
    sidebarBg: theme === 'dark' ? 'bg-slate-950 border-r border-slate-800' : 'bg-white border-r border-slate-200',
    textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    inputBg: theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900',
    navBg: theme === 'dark' ? 'bg-slate-900 border-t border-slate-800' : 'bg-white border-t border-slate-200'
  };

  const modalClasses = {
    innerBg: theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900',
    btnInactive: theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50',
    label: `text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`, 
    input: theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white focus:border-purple-500' : 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-purple-500 font-bold"><Loader2 className="animate-spin mr-2" /> Carregando Legacy 26...</div>;
  if (!authUser) { return ( <div className={`min-h-screen flex items-center justify-center p-6 ${themeClasses.appBg}`}><div className={`max-w-md w-full p-8 rounded-2xl border ${themeClasses.cardBg} relative`}><button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="absolute top-4 right-4 p-2 rounded-full border border-slate-700 opacity-50 hover:opacity-100 transition-opacity active:scale-95">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><div className="text-center mb-8 mt-2"><h1 className={`text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${currentThemeColors.text}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>LEGACY 26</h1><p className={themeClasses.textMuted}>{isSignUp ? "Crie seu perfil." : "Bem-vindo de volta."}</p></div>{authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm"><AlertTriangle size={16} /> {authError}</div>}<form onSubmit={handleAuth} className="space-y-4">{isSignUp && <div><label className="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500">Nome de Exibição</label><input type="text" required className={`w-full p-3 rounded-lg border ${themeClasses.inputBg}`} value={authName} onChange={e => setAuthName(e.target.value)} /></div>}<div><label className="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500">Email</label><input type="email" required className={`w-full p-3 rounded-lg border ${themeClasses.inputBg}`} value={authEmail} onChange={e => setAuthEmail(e.target.value)} /></div><div><label className="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500">Senha</label><input type="password" required className={`w-full p-3 rounded-lg border ${themeClasses.inputBg}`} value={authPassword} onChange={e => setAuthPassword(e.target.value)} /></div><button type="submit" disabled={authLoading} className={`w-full py-3 text-white font-bold rounded-xl mt-6 active:scale-95 transition-transform ${currentThemeColors.btn}`}>{authLoading ? <Loader2 className="animate-spin mx-auto"/> : (isSignUp ? "CRIAR" : "ENTRAR")}</button></form><div className="mt-4 flex items-center gap-4"><div className="h-px flex-1 bg-slate-700"></div><span className="text-xs text-slate-500">OU</span><div className="h-px flex-1 bg-slate-700"></div></div><button onClick={handleGoogleAuth} disabled={authLoading} className={`w-full py-3 border rounded-xl font-bold mt-4 flex items-center justify-center gap-2 active:scale-95 transition-transform ${theme==='dark'?'border-slate-700 hover:bg-slate-800':'border-slate-300 hover:bg-slate-50'}`}><Chrome size={18} /> Google</button><div className="mt-6 text-center"><button onClick={() => setIsSignUp(!isSignUp)} className="text-sm hover:underline text-slate-500">{isSignUp ? "Já tem conta? Login" : "Criar conta"}</button></div></div></div> ); }

  const filteredQuests = quests.filter(q => { if (activeSprint === 'ongoing') return q.sprint === 'ongoing'; return q.sprint === activeSprint || q.sprint === 'ongoing'; }).sort((a, b) => { if (a.completed !== b.completed) return a.completed ? 1 : -1; const dateA = a.createdAt || a.id; const dateB = b.createdAt || b.id; return dateB > dateA ? 1 : -1; });
  const totalSpent = history.reduce((acc, item) => acc + item.cost, 0);
  const equippedBorderId = userData?.equipped?.border;
  const borderItem = COSMETIC_ITEMS.find(c => c.id === equippedBorderId);
  const borderClass = borderItem?.className || '';

  if (!userData) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-purple-500"><Loader2 className="animate-spin" /></div>;

  return (
    <div className={`min-h-screen font-sans selection:bg-purple-500 selection:text-white transition-colors duration-300 ${themeClasses.appBg} flex flex-col md:flex-row`}>
      <FloatingText texts={floatingTexts} />
      <Confetti active={showConfetti} />
      {dbError && (<div className="bg-red-600 text-white text-center p-2 text-sm font-bold animate-pulse fixed top-0 w-full z-[120]">⚠️ ERRO: Firebase bloqueado.</div>)}
      
      <aside className={`hidden md:flex flex-col w-64 h-screen sticky top-0 border-r ${themeClasses.sidebarBg} p-6 z-40`}>
          <div className="mb-10">
             <h1 className={`text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${currentThemeColors.text}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>LEGACY 26</h1>
             <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold">RPG de Hábitos</p>
          </div>

          <nav className="flex-1 space-y-4">
            <button onClick={() => { playSound('tab'); setActiveTab('quests'); }} className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'quests' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}><Target size={20} /> Metas</button>
            <button onClick={() => { playSound('tab'); setActiveTab('shop'); }} className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'shop' ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-900/20' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}><ShoppingBag size={20} /> Loja</button>
            <button onClick={() => { playSound('tab'); setActiveTab('dashboard'); }} className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : theme === 'dark' ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}><LayoutDashboard size={20} /> Painel</button>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`flex items-center gap-3 text-sm font-bold transition-colors ${themeClasses.textMuted} hover:text-white`}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
             </button>
          </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
          <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 md:px-6 py-3 shadow-sm flex items-center justify-between ${themeClasses.headerBg}`}>
            <div className="md:hidden flex items-center gap-2">
                <span className={`text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${currentThemeColors.text}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>L26</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-auto w-full md:w-auto justify-end">
                <div ref={xpBarRef} className="w-20 md:w-48 relative group cursor-default">
                    <div className="flex justify-between text-[10px] font-bold mb-1 opacity-70">
                        <span className="hidden md:inline">XP {userData?.xp}</span>
                        <span>Nv. {userData?.level}</span>
                    </div>
                    <ProgressBar current={userData?.xp} max={userData?.xpToNextLevel} colorClass={currentThemeColors.bar} theme={theme} height="h-1.5 md:h-2" />
                </div>

                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${theme === 'dark' ? 'bg-slate-950 border-orange-500/20' : 'bg-white border-orange-200'}`} title="Ofensiva">
                    <Flame size={14} className="text-orange-500 fill-orange-500/20" />
                    <span className="text-xs font-bold text-orange-500">{userData?.streak || 0}</span>
                </div>

                <div className="h-6 w-px bg-slate-700/50 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                    <div ref={goldRef} className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-950 border-yellow-500/20' : 'bg-white border-yellow-200'}`} title="Ouro">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                        <span className="text-xs font-bold text-yellow-500">{userData?.gold}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${theme === 'dark' ? 'bg-slate-950 border-cyan-500/20' : 'bg-white border-cyan-200'}`} title="Diamantes">
                        <Gem size={14} className="text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-500">{userData?.diamonds || 0}</span>
                    </div>
                </div>

                <div onClick={handleOpenProfileModal} className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-800 cursor-pointer overflow-hidden ${borderClass} ring-2 ring-slate-700 hover:ring-purple-500 transition-all ml-1`}>
                    {userData.avatar ? <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-400 m-auto mt-1.5 md:mt-2" />}
                </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-3xl mx-auto w-full">
            {activeTab === 'quests' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {Object.values(SPRINTS).map(sprint => 
                    (
                      <button key={sprint.id} onClick={() => { playSound('tab'); setActiveSprint(sprint.id); }} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${activeSprint === sprint.id ? `${currentThemeColors.btn} text-white shadow-md border-transparent` : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}><div className="text-[10px] opacity-80 mb-0.5">{sprint.range}</div>{sprint.title}</button>
                    ))}
                </div>

                <div className="flex justify-between items-center"><h3 className={`text-lg font-bold flex items-center gap-2 ${themeClasses.textMuted}`}>Missões Ativas</h3><button onClick={() => { setEditingQuestId(null); setIsAddModalOpen(true); playSound('pop'); }} className={`hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${currentThemeColors.btn}`}><Plus size={18} /> Nova Meta</button></div>
                
                {filteredQuests.length === 0 ?
                ( <div className={`text-center py-16 rounded-2xl border border-dashed ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-300'}`}><p className={themeClasses.textMuted}>Nenhuma missão encontrada.</p><button onClick={() => setIsAddModalOpen(true)} className="text-sm font-bold mt-2 text-purple-500 hover:underline">Criar a primeira</button></div> ) : ( <div className="grid grid-cols-1 gap-3">{filteredQuests.map(quest => { const diffData = DIFFICULTIES[quest.difficulty]; return ( <div key={quest.id} className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 ${quest.completed ? 'opacity-60 border-slate-800' : `border-slate-800 ${diffData.glow} hover:shadow-lg`} ${themeClasses.cardBg}`}><div className="p-5 flex items-start gap-4">
                  
                  {/* Botão de Checkbox / Reset */}
                  <button onClick={(e) => { if(quest.type==='progressive') return; if(quest.completed) { handleResetQuest(quest.id); } else { handleCompleteQuest(quest.id, e); } }} className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${quest.completed ? 'bg-green-500 border-green-500 text-white' : theme === 'dark' ? 'border-slate-600 hover:border-purple-400' : 'border-slate-300 hover:border-purple-500'}`}>{quest.completed && <CheckCircle2 size={16} />}</button>
                  
                  <div className="flex-1"><div className="flex justify-between items-start"><div><h3 className={`font-bold text-lg leading-tight ${quest.completed ? 'line-through opacity-70' : ''}`}>{quest.title}</h3>{quest.frequency && quest.frequency !== 'once' && (<span className={`text-[10px] px-2 py-0.5 rounded-md w-fit mt-1.5 border inline-block mr-2 font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-slate-950 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{FREQUENCIES[quest.frequency]?.label}</span>)}</div>
                  
                  {/* Botão de Lixo (Oculto se concluída)  */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!quest.completed && (
                      <button onClick={() => requestDeleteQuest(quest.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={18} /></button>
                    )}
                  </div>
                  
                  </div>{quest.type === 'progressive' && quest.progress && (<div className="mt-4 mb-2"><div className={`flex justify-between text-xs mb-1 ${themeClasses.textMuted}`}><span>Atual: <b>{quest.progress.unit} {quest.progress.current}</b></span><span>Meta: {quest.progress.target}</span></div><div className="flex items-center gap-3"><div className={`flex-1 h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'}`}><div className={`h-full transition-all duration-700 ${quest.completed ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(100, (quest.progress.current / quest.progress.target) * 100)}%` }}></div></div><button onClick={() => { setUpdatingProgressQuest(quest); setProgressAmount(''); setProgressMode('add'); setIsProgressModalOpen(true); playSound('pop'); }} className={`p-1.5 rounded-lg border transition-colors active:scale-95 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-200'}`}><Plus size={14} /></button></div></div>)}<div className="flex items-center gap-2 mt-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${CATEGORIES[quest.category].color}`}>{CATEGORIES[quest.category].label}</span><span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${DIFFICULTIES[quest.difficulty].color} ${DIFFICULTIES[quest.difficulty].border} ${DIFFICULTIES[quest.difficulty].bg}`}>{DIFFICULTIES[quest.difficulty].label}</span></div></div></div></div> ) })}</div> )}
              </div>
            )}
            
            {activeTab === 'shop' && (
              <div className="animate-fadeIn space-y-8">
                 <div className="flex gap-6 border-b border-slate-700 pb-2 mb-6">
                     <button onClick={() => { playSound('tab'); setShopTab('rewards'); }} className={`pb-2 text-sm font-bold transition-all ${shopTab === 'rewards' ? `text-white border-b-2 border-purple-500` : 'text-slate-500 hover:text-slate-300'}`}>Recompensas</button>
                     <button onClick={() => { playSound('tab'); setShopTab('cosmetics'); }} className={`pb-2 text-sm font-bold transition-all ${shopTab === 'cosmetics' ? `text-white border-b-2 border-purple-500` : 'text-slate-500 hover:text-slate-300'}`}>Cosméticos</button>
                 </div>

                 {shopTab === 'rewards' && (
                 <div>
                    <div className="flex justify-between items-center mb-4"><h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}><ShoppingBag className="text-yellow-500" /> Itens Reais</h2><button onClick={() => { setEditingRewardId(null); setIsRewardModalOpen(true); playSound('pop'); }} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors active:scale-95 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 shadow-sm'}`}>+ Criar</button></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{rewards.map(reward => { const canAfford = (userData?.gold || 0) >= reward.cost; return (<div key={reward.id} className={`rounded-xl p-5 border flex flex-col justify-between group relative transition-transform hover:-translate-y-1 ${themeClasses.cardBg}`}><div className="mb-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-100 text-yellow-600'}`}><Trophy size={24} /></div><h3 className="font-bold text-lg">{reward.title}</h3></div><div className="flex gap-2"><button onClick={() => { if(canAfford) requestBuyReward(reward); }} disabled={!canAfford} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${canAfford ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400 shadow-lg shadow-yellow-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>{reward.cost} Ouro</button><button onClick={() => { requestDeleteReward(reward.id); }} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-red-400 active:scale-95 transition-colors"><Trash2 size={20}/></button></div></div>) })}</div>
                    <div className="mt-10"><h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${themeClasses.textMuted}`}><History size={20} /> Histórico de Resgates</h3>{history.length === 0 ? ( <p className={`text-sm italic ${themeClasses.textMuted}`}>Nenhuma recompensa resgatada ainda.</p> ) : ( <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>{history.map((item, index) => ( <div key={item.id || index} className={`flex justify-between items-center p-3 border-b last:border-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><div><div className="font-bold text-sm">{item.title}</div><div className={`text-xs ${themeClasses.textMuted}`}>{new Date(item.date).toLocaleDateString()}</div></div><div className="text-red-400 font-bold text-sm">-{item.cost} Ouro</div></div> ))}</div> )}</div>
                 </div>
                 )}
                 {shopTab === 'cosmetics' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{COSMETIC_ITEMS.map(item => { const owned = userData.inventory?.includes(item.id); const equipped = userData.equipped?.[item.type] === item.id; const canAfford = (userData.diamonds || 0) >= item.cost; return ( <div key={item.id} className={`rounded-xl p-5 border flex flex-col justify-between transition-transform hover:-translate-y-1 ${themeClasses.cardBg} ${equipped ? 'ring-2 ring-purple-500 bg-purple-500/5' : ''}`}><div className="flex items-start justify-between"><div><div className={`text-[10px] font-bold uppercase mb-1 tracking-wider ${themeClasses.textMuted}`}>{item.type === 'theme' ? 'Tema' : 'Borda'}</div><h3 className="font-bold text-lg">{item.name}</h3><p className="text-sm text-slate-500 mb-4 mt-1">{item.description}</p></div>{item.type === 'theme' ? (<div className={`w-10 h-10 rounded-full bg-gradient-to-br shadow-lg ${item.colors?.text || 'bg-slate-500'}`}></div>) : (<div className={`w-10 h-10 rounded-full bg-slate-800 ${item.className}`}></div>)}</div>{owned ? (<button onClick={() => handleEquipCosmetic(item)} disabled={equipped} className={`w-full py-2.5 rounded-xl font-bold text-sm mt-auto active:scale-95 transition-transform ${equipped ? 'bg-green-500/20 text-green-500 cursor-default border border-green-500/50' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>{equipped ? 'Equipado' : 'Equipar'}</button>) : (<button onClick={() => handleBuyCosmetic(item)} disabled={!canAfford} className={`w-full py-2.5 rounded-xl font-bold text-sm mt-auto transition-all active:scale-95 ${canAfford ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-lg shadow-cyan-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Comprar {item.cost} <Gem size={12} className="inline ml-1"/></button>)}</div> ); })}</div>
                 )}
              </div>
            )}

            {activeTab === 'dashboard' && (
            <div className="animate-fadeIn space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><div className={`p-5 rounded-2xl border ${themeClasses.cardBg}`}><div className={`text-xs font-bold uppercase mb-2 ${themeClasses.textMuted}`}>Concluídas</div><div className="text-3xl font-black">{quests.filter(q => q.completed).length}</div></div><div className={`p-5 rounded-2xl border ${themeClasses.cardBg}`}><div className={`text-xs font-bold uppercase mb-2 ${themeClasses.textMuted}`}>XP Total</div><div className="text-3xl font-black text-purple-500">{userData?.xp}</div></div><div className={`p-5 rounded-2xl border ${themeClasses.cardBg}`}><div className={`text-xs font-bold uppercase mb-2 ${themeClasses.textMuted}`}>Nível</div><div className="text-2xl font-bold text-yellow-500">{userData?.level}</div></div><div className={`p-5 rounded-2xl border ${themeClasses.cardBg}`}><div className={`text-xs font-bold uppercase mb-2 ${themeClasses.textMuted}`}>Ouro</div><div className="text-2xl font-bold text-yellow-600">{userData?.gold}</div></div></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`p-8 rounded-3xl border flex flex-col items-center ${themeClasses.cardBg}`}><h3 className={`text-sm font-bold mb-6 w-full text-left uppercase tracking-wider ${themeClasses.textMuted}`}>Equilíbrio da Vida</h3><RadarChart data={Object.keys(CATEGORIES).map(catKey => { const catQuests = quests.filter(q => q.category === catKey); const completed = catQuests.filter(q => q.completed).length; return { label: CATEGORIES[catKey].label, value: catQuests.length ? Math.round((completed/catQuests.length)*100) : 0 }; })} theme={theme} /></div>
                    <div className="space-y-6"><div className={`p-6 rounded-2xl border ${themeClasses.cardBg}`}><div className="flex justify-between items-start mb-4"><div><h3 className={`text-sm font-bold uppercase tracking-wider ${themeClasses.textMuted}`}>Investido em Mim</h3><p className="text-xs text-slate-500 mt-1">Total gasto em recompensas</p></div><ShoppingBag className="text-yellow-500" size={24} /></div><div className="text-4xl font-black text-yellow-500">{totalSpent} <span className="text-sm font-normal text-slate-500">Ouros</span></div></div><div className={`p-8 rounded-3xl border ${themeClasses.cardBg}`}><h3 className={`text-sm font-bold mb-6 w-full text-left uppercase tracking-wider ${themeClasses.textMuted}`}>Evolução XP (Mensal)</h3><MonthlyChart data={xpHistory} theme={theme} /></div></div>
                </div>
            </div>
            )}
          </main>
      </div>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 px-6 py-3 flex justify-around z-50 ${themeClasses.navBg} pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.2)]`}>
        <button onClick={() => { playSound('tab'); setActiveTab('quests'); }} className={`flex flex-col items-center gap-1 active:scale-95 transition-transform ${activeTab === 'quests' ? 'text-purple-600' : 'text-slate-400'}`}><Target size={24} /><span className="text-[10px] font-bold">Metas</span></button>
        <button onClick={() => { playSound('tab'); setActiveTab('shop'); }} className={`flex flex-col items-center gap-1 active:scale-95 transition-transform ${activeTab === 'shop' ? 'text-yellow-600' : 'text-slate-400'}`}><ShoppingBag size={24} /><span className="text-[10px] font-bold">Loja</span></button>
        <button onClick={() => { playSound('tab'); setActiveTab('dashboard'); }} className={`flex flex-col items-center gap-1 active:scale-95 transition-transform ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><LayoutDashboard size={24} /><span className="text-[10px] font-bold">Painel</span></button>
      </nav>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nova Meta" theme={theme}>
        <div className="space-y-6">
            <div className={`flex p-1 rounded-xl border ${modalClasses.innerBg}`}>
                <button onClick={() => { playSound('click'); setNewQuest({...newQuest, type: 'checklist'}); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${newQuest.type === 'checklist' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:opacity-80'}`}>Checklist</button>
                <button onClick={() => { playSound('click'); setNewQuest({...newQuest, type: 'progressive'}); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${newQuest.type === 'progressive' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:opacity-80'}`}>Progresso</button>
            </div>
            <input type="text" placeholder="Título da Missão" className={`w-full p-4 rounded-xl border focus:outline-none text-lg font-bold ${modalClasses.input}`} value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} autoFocus />
            <div><label className={modalClasses.label}>Dificuldade</label><div className="grid grid-cols-4 gap-2">{Object.entries(DIFFICULTIES).map(([k, v]) => ( <button key={k} onClick={() => { playSound('click'); setNewQuest({...newQuest, difficulty: k}); }} className={`p-2 rounded-lg border text-xs font-bold transition-all active:scale-95 ${newQuest.difficulty === k ? `${v.color} ${v.border} ${v.bg}` : modalClasses.btnInactive}`}>{v.label}</button> ))}</div></div>
            <div><label className={modalClasses.label}>Frequência</label><div className="grid grid-cols-3 gap-2">{Object.entries(FREQUENCIES).map(([k, v]) => ( <button key={k} onClick={() => { playSound('click'); setNewQuest({...newQuest, frequency: k}); }} className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 ${newQuest.frequency === k ? 'border-purple-500 text-purple-400 bg-purple-500/10' : modalClasses.btnInactive}`}><v.icon size={16} /> {v.label}</button> ))}</div></div>
            <div><label className={modalClasses.label}>Categoria</label><div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{Object.entries(CATEGORIES).map(([k, v]) => ( <button key={k} onClick={() => { playSound('click'); setNewQuest({...newQuest, category: k}); }} className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${newQuest.category === k ? `${v.color} border-slate-600 bg-slate-800` : modalClasses.btnInactive}`}><v.icon size={14} /> {v.label}</button> ))}</div></div>
            <div><label className={modalClasses.label}>Período (Sprint)</label><div className="flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-hide">{Object.values(SPRINTS).map(s => ( <button key={s.id} onClick={() => { playSound('click'); setNewQuest({...newQuest, sprint: s.id}); }} className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex justify-between items-center ${newQuest.sprint === s.id ? 'border-purple-500 bg-purple-500/10 text-white' : modalClasses.btnInactive}`}><div><div className="text-xs font-bold">{s.title}</div><div className="text-[10px] opacity-70">{s.range}</div></div>{newQuest.sprint === s.id && <CheckCircle2 size={16} className="text-purple-500" />}</button> ))}</div></div>
            {newQuest.type === 'progressive' && ( <div className={`grid grid-cols-2 gap-2 p-3 rounded-xl border ${modalClasses.innerBg}`}><div><label className="text-[10px] uppercase font-bold opacity-70">Meta Total</label><input type="number" className="w-full bg-transparent border-b border-slate-500/30 py-1 focus:outline-none" value={newQuest.progressTarget} onChange={e => setNewQuest({...newQuest, progressTarget: e.target.value})} placeholder="100" /></div><div><label className="text-[10px] uppercase font-bold opacity-70">Unidade</label><input type="text" className="w-full bg-transparent border-b border-slate-500/30 py-1 focus:outline-none" value={newQuest.progressUnit} onChange={e => setNewQuest({...newQuest, progressUnit: e.target.value})} placeholder="R$" /></div></div> )}
            <button onClick={() => { if(!newQuest.title) return; const questData = { id: Date.now().toString(), type: newQuest.type, title: newQuest.title, category: newQuest.category, difficulty: newQuest.difficulty, sprint: newQuest.sprint, frequency: newQuest.frequency || 'once', completed: false, subtasks: [], progress: newQuest.type === 'progressive' ? { current: 0, target: parseFloat(newQuest.progressTarget)||100, unit: newQuest.progressUnit } : null, createdAt: Date.now() }; saveQuestToDb(questData); setIsAddModalOpen(false); playSound('coin'); }} className={`w-full font-bold py-4 rounded-xl text-white shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-95 transition-all ${currentThemeColors.btn}`}>CRIAR MISSÃO</button>
        </div>
      </Modal>

      <Modal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} title="Nova Recompensa" theme={theme}><div className="space-y-4"><input type="text" placeholder="Título" className={`w-full p-3 rounded border ${modalClasses.input}`} value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})} /><input type="number" placeholder="Custo (Ouro)" className={`w-full p-3 rounded border ${modalClasses.input}`} value={newReward.cost} onChange={e => setNewReward({...newReward, cost: e.target.value})} /><button onClick={handleSaveReward} className="w-full bg-yellow-500 text-slate-900 font-bold py-3 rounded-lg active:scale-95 transition-transform">Criar</button></div></Modal>
      <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Aporte" theme={theme}><div className="space-y-4"><div className={`flex gap-2 p-1 rounded ${modalClasses.innerBg}`}><button onClick={() => setProgressMode('add')} className={`flex-1 py-1 rounded font-bold ${progressMode==='add' ? 'bg-green-600 text-white' : ''}`}>+ Adicionar</button><button onClick={() => setProgressMode('remove')} className={`flex-1 py-1 rounded font-bold ${progressMode==='remove' ? 'bg-red-600 text-white' : ''}`}>- Remover</button></div><input type="number" placeholder="Valor" className={`w-full p-3 rounded border text-lg font-bold ${modalClasses.input}`} value={progressAmount} onChange={e => setProgressAmount(e.target.value)} /><button onClick={handleUpdateProgress} className={`w-full py-3 rounded font-bold text-white active:scale-95 transition-transform ${progressMode==='add' ? 'bg-green-600' : 'bg-red-600'}`}>Confirmar</button></div></Modal>
      
      {levelUpModal && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"><div className="text-center animate-bounce"><h2 className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentThemeColors.text} mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]`} style={{ fontFamily: "'Orbitron', sans-serif" }}>LEVEL UP!</h2><div className="text-2xl text-white font-bold mb-8">Você alcançou o Nível {userData?.level}</div><div className="flex justify-center"><button onClick={() => setLevelUpModal(false)} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">CONTINUAR JORNADA</button></div></div></div>)}
      {streakModal && (<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-bounce"><div className="text-center"><h2 className="text-5xl font-black text-orange-500 mb-2 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]">OFENSIVA!</h2><Flame size={80} className="mx-auto text-orange-500 mb-4 animate-pulse" /><div className="text-2xl text-white font-bold mb-4">{userData?.streak} DIAS SEGUIDOS</div><div className="text-slate-300">Continue assim, Lenda!</div><button onClick={() => setStreakModal(false)} className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold active:scale-95 transition-transform">FECHAR</button></div></div>)}
      {confirmation.isOpen && (<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"><div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl p-6 shadow-2xl animate-slideUp"><div className="flex items-center gap-3 mb-4 text-slate-100"><div className="p-3 bg-red-500/10 rounded-full text-red-500"><AlertTriangle size={24} /></div><h3 className="text-lg font-bold">{confirmation.title}</h3></div><p className="text-slate-400 mb-6 text-sm leading-relaxed">{confirmation.message}</p><div className="flex gap-3"><button onClick={() => setConfirmation({ ...confirmation, isOpen: false })} className="flex-1 py-2.5 rounded-lg font-medium text-slate-400 hover:bg-slate-800 transition-colors active:scale-95">Cancelar</button><button onClick={executeConfirmation} className="flex-1 py-2.5 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 transition-colors">{confirmation.actionLabel}</button></div></div></div>)}
      
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Identidade" theme={theme}>
          <div className="space-y-6">
               <div className={`flex justify-between items-center p-2 rounded-xl border ${modalClasses.innerBg}`}>
                    <button onClick={() => { playSound('click'); setTheme(theme === 'dark' ? 'light' : 'dark'); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-900 shadow-sm border border-slate-200'}`}>{theme === 'dark' ? <><Sun size={18} /> Modo Claro</> : <><Moon size={18} /> Modo Escuro</>}</button>
                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-800 mx-2"></div>
                    <button onClick={() => signOut(auth)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-red-500 hover:bg-red-500/10 transition-all active:scale-95"><LogOut size={18} /> Sair da Conta</button>
               </div>
               <div className="flex justify-center relative group">
                  <div className={`w-32 h-32 rounded-full bg-slate-700 overflow-hidden ${borderClass} flex items-center justify-center relative ring-4 ring-slate-800 shadow-2xl`}>
                      {(profileForm.avatar || userData.avatar) ? <img src={profileForm.avatar || userData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={48} className="text-slate-400" />}
                      <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Camera size={32} className="text-white drop-shadow-md" /></label>
                      <input id="avatar-upload" type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  </div>
              </div>
              <div className="space-y-4">
                  <div><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Seu Nick (Público)</label><input type="text" className={`w-full p-4 rounded-xl border font-black text-lg ${modalClasses.input}`} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Seu Nome (Privado)</label><input type="text" className={`w-full p-4 rounded-xl border font-medium ${modalClasses.input}`} value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} placeholder="Nome Completo" /></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Telefone</label><input type="text" className={`w-full p-4 rounded-xl border ${modalClasses.input}`} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="(XX) XXXXX-XXXX" /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Nascimento</label><div className={`relative flex items-center w-full p-4 rounded-xl border ${modalClasses.input}`}><Calendar size={18} className="mr-3 text-slate-400" /><input type="date" className={`bg-transparent border-none outline-none w-full p-0 font-medium ${theme === 'dark' ? 'text-white [color-scheme:dark]' : 'text-slate-900 [color-scheme:light]'}`} value={profileForm.birthDate} onChange={e => setProfileForm({...profileForm, birthDate: e.target.value})} /></div></div>
                  </div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1 block">Bio</label><textarea className={`w-full p-4 rounded-xl border ${modalClasses.input}`} rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} placeholder="Escreva sua lenda..." /></div>
              </div>
              <div className="flex gap-2 text-[10px] text-slate-500 items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800"><Shield size={12} /><span>Seus dados são privados e visíveis apenas para você.</span></div>
              <button onClick={handleSaveProfile} className={`w-full font-bold py-4 rounded-xl text-white shadow-lg active:scale-95 transition-transform ${currentThemeColors.btn}`}>SALVAR</button>
          </div>
      </Modal>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'); *::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-50px) scale(1.5); opacity: 0; } } .animate-float-up { animation: floatUp 2s ease-out forwards; } @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; } .animate-slideUp { animation: slideUp 0.3s ease-out; }`}</style>
    </div>
  );
}