import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, ShoppingBag, LayoutDashboard, Sun, Moon, LogOut, User, 
  Loader2, Chrome, AlertTriangle, Flame, Gem, Camera, Calendar, Menu, 
  CheckCircle2, Brain, ChevronRight, Users, PenTool, Sparkles
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, 
  updateDoc, deleteDoc, addDoc, writeBatch, enableNetwork, query, 
  orderBy, limit, where, getDocs 
} from 'firebase/firestore';
import { 
  DIFFICULTIES, CATEGORIES, SPRINTS, FREQUENCIES, COSMETIC_ITEMS, 
  METRICS, PLAN_TEMPLATES 
} from './data/constants';
import { playSound, compressImage, getTodayStr } from './utils/helpers';
import { generatePlanQuests } from './utils/generators';
import { useAuth } from './hooks/useAuth';

import Modal from './components/ui/Modal';
import ProgressBar from './components/ui/ProgressBar';
import FloatingText from './components/ui/FloatingText';
import Confetti from './components/ui/Confetti';

import Tasks from './screens/Tasks';
import Shop from './screens/Shop';
import Dashboard from './screens/Dashboard';
import Community from './screens/Community';

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

const COLOR_PALETTES = {
    purple: {
        dark: { text: 'text-purple-400', bg: 'bg-purple-600', btn: 'bg-purple-600 hover:bg-purple-500 text-white', btnSec: 'bg-slate-800 text-slate-300 hover:bg-slate-700', bar: 'bg-gradient-to-r from-purple-600 to-pink-500', title: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500', iconBg: 'bg-purple-500/10', glow: 'hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]' },
        light: { text: 'text-purple-700', bg: 'bg-purple-500', btn: 'bg-purple-600 hover:bg-purple-700 text-white', btnSec: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50', bar: 'bg-gradient-to-r from-purple-500 to-pink-600', title: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600', iconBg: 'bg-purple-100', glow: 'hover:border-purple-500 hover:shadow-lg' }
    },
    amber: {
        dark: { text: 'text-amber-400', bg: 'bg-amber-600', btn: 'bg-amber-600 hover:bg-amber-500 text-black', btnSec: 'bg-stone-800 text-amber-200/70 hover:bg-stone-700', bar: 'bg-gradient-to-r from-amber-500 to-yellow-500', title: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600', iconBg: 'bg-amber-500/10', glow: 'hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
        light: { text: 'text-amber-700', bg: 'bg-amber-500', btn: 'bg-amber-500 hover:bg-amber-600 text-white', btnSec: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50', bar: 'bg-gradient-to-r from-amber-500 to-yellow-600', title: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600', iconBg: 'bg-amber-100', glow: 'hover:border-amber-500 hover:shadow-lg' }
    },
    green: {
        dark: { text: 'text-green-400', bg: 'bg-green-600', btn: 'bg-green-700 border border-green-500/50 text-green-100 hover:bg-green-600', btnSec: 'bg-black border border-green-900 text-green-500 hover:text-green-400 hover:border-green-700', bar: 'bg-gradient-to-r from-green-600 to-emerald-600', title: 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.9)]', iconBg: 'bg-green-900/30', glow: 'hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]' },
        light: { text: 'text-green-700', bg: 'bg-green-600', btn: 'bg-green-700 hover:bg-green-800 text-white', btnSec: 'bg-white text-green-800 border border-green-200 hover:bg-green-50', bar: 'bg-gradient-to-r from-green-600 to-teal-700', title: 'text-green-700', iconBg: 'bg-green-100', glow: 'hover:border-green-600 hover:shadow-lg' }
    },
    cyan: {
        dark: { text: 'text-cyan-400', bg: 'bg-cyan-600', btn: 'bg-cyan-600 hover:bg-cyan-500 text-white', btnSec: 'bg-slate-800 text-cyan-300 hover:bg-slate-700', bar: 'bg-gradient-to-r from-cyan-500 to-blue-600', title: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500', iconBg: 'bg-cyan-500/10', glow: 'hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]' },
        light: { text: 'text-cyan-700', bg: 'bg-cyan-600', btn: 'bg-cyan-600 hover:bg-cyan-700 text-white', btnSec: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50', bar: 'bg-gradient-to-r from-cyan-500 to-blue-600', title: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600', iconBg: 'bg-cyan-100', glow: 'hover:border-cyan-500 hover:shadow-lg' }
    }
};

export default function Legacy26App() {
  const { user: authUser, userData, loading, dbError, authError, authLoading, login, signup, googleLogin, logout, updateUserProfile, db, appId } = useAuth();

  const [theme, setTheme] = useState('dark');
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
  const [creationStep, setCreationStep] = useState('select'); 
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanTemplate, setSelectedPlanTemplate] = useState(null);
  const [planAnswers, setPlanAnswers] = useState({});

  const [levelUpModal, setLevelUpModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakModal, setStreakModal] = useState(false);
  const [confirmation, setConfirmation] = useState({ isOpen: false, type: null, data: null, title: '', message: '', actionLabel: '' });
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');

  const [profileForm, setProfileForm] = useState({ name: '', fullName: '', phone: '', birthDate: '', bio: '', avatar: '' });
  const [editingQuestId, setEditingQuestId] = useState(null);
  
  const [newQuest, setNewQuest] = useState({ 
    type: 'checklist', title: '', category: 'health', difficulty: 'easy', sprint: 'sprint1', frequency: 'once', hasSubtasks: false, tempSubtask: '', progressTarget: '', progressUnit: '', metric: 'custom', objectiveId: null, isPublic: false 
  });
  
  const [newSubtasksList, setNewSubtasksList] = useState([]);
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [newReward, setNewReward] = useState({ title: '', cost: 50 });
  const [updatingProgressQuest, setUpdatingProgressQuest] = useState(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [progressMode, setProgressMode] = useState('add');

  const currentThemeBase = COSMETIC_ITEMS.find(c => c.id === userData?.equipped?.theme) || COSMETIC_ITEMS[0];
  const paletteKey = currentThemeBase?.palette || 'purple';
  const TC = COLOR_PALETTES[paletteKey] ? COLOR_PALETTES[paletteKey][theme] : COLOR_PALETTES['purple'][theme];
  
  const borderClass = COSMETIC_ITEMS.find(c => c.id === userData?.equipped?.border)?.className || '';
  const isMatrixEffect = currentThemeBase.effect === 'matrix';

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

  useEffect(() => {
    let unsubQuests = () => {};
    let unsubRewards = () => {};
    let unsubHistory = () => {};
    let unsubXpHistory = () => {};

    if (authUser) {
        try {
            unsubQuests = onSnapshot(collection(db, 'artifacts', appId, 'users', authUser.uid, 'quests'), (snap) => setQuests(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
            unsubRewards = onSnapshot(collection(db, 'artifacts', appId, 'users', authUser.uid, 'rewards'), (snap) => setRewards(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
            unsubHistory = onSnapshot(query(collection(db, 'artifacts', appId, 'users', authUser.uid, 'history'), orderBy('date', 'desc'), limit(50)), (snap) => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
            unsubXpHistory = onSnapshot(query(collection(db, 'artifacts', appId, 'users', authUser.uid, 'xp_history'), orderBy('date', 'asc'), limit(365)), (snap) => setXpHistory(snap.docs.map(d => d.data())));
        } catch (e) { console.error("Listener error", e); }
    } else {
        setQuests([]);
        setRewards([]);
        setHistory([]);
        setXpHistory([]);
    }

    return () => { unsubQuests(); unsubRewards(); unsubHistory(); unsubXpHistory(); };
  }, [authUser, db, appId]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) await signup(formEmail, formPassword, formName);
    else await login(formEmail, formPassword);
  };

  const updateUserStats = async (xpDelta, goldDelta, isQuestCompletion = false) => {
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
        try {
            await addDoc(collection(db, 'social_posts'), {
                authorId: authUser.uid,
                authorName: userData.name || 'Viajante',
                authorAvatar: userData.avatar || '',
                type: 'levelup',
                title: `Alcançou o Nível ${newLevel}!`,
                xp: 0,
                timestamp: new Date().toISOString(),
                likes: []
            });
        } catch(e) { console.error("Erro post social", e); }
    }

    if (isQuestCompletion && xpDelta > 0 && !dailyDone) {
        newStreak += 1;
        dailyDone = true; setStreakModal(true); setShowConfetti(true); playSound('streak'); setTimeout(() => setShowConfetti(false), 3000);
    }
    const newData = { ...prev, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext, gold: newGold, streak: newStreak, dailyTaskDone: dailyDone };
    updateUserProfile(newData); 
  };

  const handleBuyCosmetic = (item) => {
      if (userData?.inventory?.includes(item.id)) return;
      if ((userData?.diamonds || 0) < item.cost) { alert("Diamantes insuficientes!"); return; }
      if(confirm(`Comprar ${item.name} por ${item.cost} Diamantes?`)) {
          const newDiamonds = userData.diamonds - item.cost;
          const newInv = [...(userData.inventory || []), item.id];
          const newData = { ...userData, diamonds: newDiamonds, inventory: newInv };
          updateUserProfile(newData); playSound('buy');
      }
  };
  const handleEquipCosmetic = (item) => {
      if (!userData?.inventory?.includes(item.id)) return;
      const newEquipped = { ...userData.equipped, [item.type]: item.id };
      const newData = { ...userData, equipped: newEquipped };
      updateUserProfile(newData); playSound('click');
  };
  
  const handleOpenProfileModal = () => { setProfileForm({ name: userData?.name || '', fullName: userData?.fullName || '', phone: userData?.phone || '', birthDate: userData?.birthDate || '', bio: userData?.bio || '', avatar: userData?.avatar || '' });
  setIsProfileModalOpen(true); playSound('pop'); };
  
  const handleAvatarChange = async (e) => { const file = e.target.files[0];
  if (file) { const resizedImage = await compressImage(file); setProfileForm(prev => ({ ...prev, avatar: resizedImage })); } };
  
  const handleSaveProfile = async () => { 
      const newData = { ...userData, ...profileForm };
      await updateUserProfile(newData); 
      setIsProfileModalOpen(false);
      playSound('coin'); 
  };
  
  const handleCreatePlan = async () => {
    if (!selectedPlanTemplate) return;
    const generatedQuests = generatePlanQuests(selectedPlanTemplate, planAnswers);
    if (generatedQuests.length === 0) return alert("Preencha os dados corretamente!");
    const batch = writeBatch(db);
    generatedQuests.forEach(q => {
        const newQuestRef = doc(collection(db, 'artifacts', appId, 'users', authUser.uid, 'quests'));
        batch.set(newQuestRef, { ...q, id: newQuestRef.id });
    });
    await batch.commit();
    setIsPlanModalOpen(false); setSelectedPlanTemplate(null); setPlanAnswers({});
    playSound('levelUp'); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000);
  };

  const saveQuestToDb = async (quest) => { if (authUser) { const qId = quest.id ? quest.id.toString() : Date.now().toString();
  await setDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'quests', qId), { ...quest, id: qId }); } };
  const deleteQuestFromDb = async (id) => { if (authUser) await deleteDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'quests', id.toString())); };
  const deleteRewardFromDb = async (id) => { if (authUser) await deleteDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'rewards', id.toString())); };
  const deleteHistoryItem = async (id) => { if (authUser) await deleteDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'history', id.toString())); };
  const saveRewardToDb = async (reward) => { if (authUser) { const rId = reward.id ? reward.id.toString() : Date.now().toString();
  await setDoc(doc(db, 'artifacts', appId, 'users', authUser.uid, 'rewards', rId), { ...reward, id: rId }); } };
  const saveHistoryToDb = async (item) => { if (!authUser) return;
  await addDoc(collection(db, 'artifacts', appId, 'users', authUser.uid, 'history'), { title: item.title, cost: item.cost, date: new Date().toISOString() }); };
  
  const requestDeleteQuest = (id) => { setConfirmation({ isOpen: true, type: 'delete_quest', data: id, title: 'Excluir Meta', message: 'Tem certeza?', actionLabel: 'Excluir' }); playSound('pop'); };
  const requestDeleteReward = (id) => { setConfirmation({ isOpen: true, type: 'delete_reward', data: id, title: 'Excluir Item', message: 'Remover da loja?', actionLabel: 'Excluir' }); playSound('pop'); };
  const requestDeleteHistory = (id) => { setConfirmation({ isOpen: true, type: 'delete_history', data: id, title: 'Excluir Histórico', message: 'Remover este registro?', actionLabel: 'Excluir' }); playSound('pop'); };
  const requestBuyReward = (reward) => { if ((userData?.gold || 0) < reward.cost) return alert("Ouro insuficiente!");
  setConfirmation({ isOpen: true, type: 'buy_reward', data: reward, title: 'Resgatar', message: `Gastar ${reward.cost} ouro?`, actionLabel: 'Comprar' }); playSound('pop'); };
  
  const handleOpenAddModal = () => {
      setEditingQuestId(null);
      setNewQuest({ 
        type: 'checklist', title: '', category: 'health', difficulty: 'easy', sprint: 'sprint1', frequency: 'once', hasSubtasks: false, tempSubtask: '', progressTarget: '', progressUnit: '', metric: 'custom', objectiveId: null, isPublic: false 
      });
      setCreationStep('select'); 
      setIsAddModalOpen(true);
      playSound('pop');
  };

  const handleEditQuest = (quest) => {
      setEditingQuestId(quest.id);
      setNewQuest({ 
          type: quest.type, 
          title: quest.title, 
          category: quest.category, 
          difficulty: quest.difficulty, 
          sprint: quest.sprint, 
          frequency: quest.frequency, 
          progressTarget: quest.progress?.target || '', 
          progressUnit: quest.progress?.unit || '', 
          metric: quest.metric || 'custom', 
          objectiveId: quest.objectiveId || null,
          isPublic: quest.isPublic || false
      });
      setCreationStep('manual'); 
      setIsAddModalOpen(true); 
      playSound('pop');
  };

  const handleTogglePriority = async (quest) => { const newPriority = !quest.isPriority; await saveQuestToDb({ ...quest, isPriority: newPriority }); playSound('click'); };

  const executeConfirmation = () => {
    if (confirmation.type === 'delete_quest') deleteQuestFromDb(confirmation.data);
    else if (confirmation.type === 'delete_reward') deleteRewardFromDb(confirmation.data);
    else if (confirmation.type === 'delete_history') deleteHistoryItem(confirmation.data);
    else if (confirmation.type === 'buy_reward') { updateUserStats(0, -confirmation.data.cost); saveHistoryToDb(confirmation.data); playSound('buy'); }
    setConfirmation({ ...confirmation, isOpen: false });
  };
  
  const handleSaveQuest = async () => { 
    if (!newQuest.title.trim()) return; 
    
    const subtasksArray = newQuest.type === 'checklist' ?
      newSubtasksList.map((title, index) => { let existingSub = null; if(editingQuestId) { const oldQuest = quests.find(q => q.id === editingQuestId); existingSub = oldQuest?.subtasks?.find(s => s.title === title); } return { id: existingSub ? existingSub.id : `st_${Date.now()}_${index}`, title, completed: existingSub ? existingSub.completed : false }; }) : [];
    
    const progressObj = newQuest.type === 'progressive' ? { current: editingQuestId ? (quests.find(q => q.id === editingQuestId)?.progress?.current || 0) : 0, target: parseFloat(newQuest.progressTarget) || 100, unit: newQuest.progressUnit || 'un' } : null;
    
    const questData = { 
        id: editingQuestId || Date.now().toString(), 
        type: newQuest.type, 
        title: newQuest.title, 
        category: newQuest.category, 
        difficulty: newQuest.difficulty, 
        sprint: newQuest.sprint, 
        frequency: newQuest.frequency || 'once', 
        completed: false, 
        subtasks: subtasksArray, 
        progress: progressObj, 
        metric: newQuest.metric, 
        objectiveId: editingQuestId ? (quests.find(q => q.id === editingQuestId).objectiveId || null) : (newQuest.objectiveId || null), 
        createdAt: editingQuestId ? quests.find(q => q.id === editingQuestId).createdAt : Date.now(), 
        isPriority: editingQuestId ? quests.find(q => q.id === editingQuestId).isPriority : false,
        isPublic: newQuest.isPublic 
    }; 
    
    await saveQuestToDb(questData); 

    if (newQuest.isPublic) {
        try {
            await setDoc(doc(db, 'public_quests', questData.id), {
                id: questData.id,
                uid: authUser.uid,
                authorName: userData.name || 'Viajante',
                authorAvatar: userData.avatar || '',
                title: questData.title,
                difficulty: questData.difficulty,
                category: questData.category,
                completed: false,
                incentives: [],
                createdAt: new Date().toISOString()
            });
        } catch(e) { console.error("Erro ao criar meta pública", e); }
    } else {
        try { await deleteDoc(doc(db, 'public_quests', questData.id)); } catch(e) {}
    }

    setIsAddModalOpen(false); 
    playSound('coin'); 
};

  const handleSaveReward = () => { if(!newReward.title.trim()) return; const rId = editingRewardId || Date.now().toString(); saveRewardToDb({ id: rId, title: newReward.title, cost: parseInt(newReward.cost)||0 }); setIsRewardModalOpen(false); playSound('coin'); };
  
  const handleCompleteQuest = async (id, e) => { 
      const quest = quests.find(q => q.id === id);
      if (quest.completed) return; 
      const diffData = DIFFICULTIES[quest.difficulty]; 
      updateUserStats(diffData.xp, diffData.gold, true); 
      saveQuestToDb({...quest, completed: true}); 
      
      if (quest.isPublic) {
          try { await updateDoc(doc(db, 'public_quests', quest.id), { completed: true }); } catch(e) {}
      }

      try {
        await addDoc(collection(db, 'social_posts'), {
            authorId: authUser.uid,
            authorName: userData.name || 'Viajante',
            authorAvatar: userData.avatar || '',
            type: 'quest',
            title: `Completou: ${quest.title}`,
            xp: diffData.xp,
            timestamp: new Date().toISOString(),
            likes: []
        });
      } catch(e) { console.error("Erro post social", e); }

      if (quest.difficulty === 'epic') { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); } 
  };
  
  const handleResetQuest = (id) => { const quest = quests.find(q => q.id === id); const diffData = DIFFICULTIES[quest.difficulty]; updateUserStats(-diffData.xp, -diffData.gold); saveQuestToDb({...quest, completed: false}); };
  
  const handleUpdateProgress = async () => { 
      if (!updatingProgressQuest || !progressAmount) return; 
      const amt = parseFloat(progressAmount); 
      const q = updatingProgressQuest; 
      if(q && amt) { 
          const diff = progressMode === 'add' ? amt : -amt; 
          const newCurr = Math.max(0, (q.progress?.current || 0) + diff); 
          const complete = newCurr >= q.progress.target; 
          const qData = DIFFICULTIES[q.difficulty]; 
          const xpReward = Math.floor((amt / q.progress.target) * qData.xp); 
          const goldReward = Math.floor((amt / q.progress.target) * qData.gold); 
          
          if(progressMode === 'add') { updateUserStats(Math.max(1, xpReward), Math.max(1, goldReward), true); } 
          else { updateUserStats(-Math.max(1, xpReward), -Math.max(1, goldReward)); } 
          
          saveQuestToDb({ ...q, completed: complete, progress: { ...q.progress, current: newCurr } }); 
          
          if (complete && !q.completed) {
             if (q.isPublic) { try { await updateDoc(doc(db, 'public_quests', q.id), { completed: true }); } catch(e) {} }
             try {
                await addDoc(collection(db, 'social_posts'), {
                    authorId: authUser.uid,
                    authorName: userData.name || 'Viajante',
                    authorAvatar: userData.avatar || '',
                    type: 'quest',
                    title: `Concluiu a meta: ${q.title}`,
                    xp: qData.xp,
                    timestamp: new Date().toISOString(),
                    likes: []
                });
             } catch(e) { console.error("Erro post social", e); }
          }

          setIsProgressModalOpen(false); 
          playSound('coin'); 
      } 
  };
  
  const themeClasses = { appBg: theme === 'dark' ? (currentThemeBase.palette === 'matrix' ? 'bg-black' : currentThemeBase.palette === 'midas' ? 'bg-stone-950' : 'bg-slate-950') : 'bg-slate-50', headerBg: theme === 'dark' ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : 'bg-white/80 backdrop-blur-xl border-b border-slate-200', sidebarBg: theme === 'dark' ? 'bg-black/60 backdrop-blur-xl border-r border-white/10' : 'bg-white/80 backdrop-blur-xl border-r border-slate-200', cardBg: theme === 'dark' ? 'bg-white/5 border-white/10 backdrop-blur-sm' : 'bg-white border-slate-200 shadow-sm', navBg: theme === 'dark' ? 'bg-black/80 backdrop-blur-md border-t border-white/10' : 'bg-white/90 backdrop-blur-md border-t border-slate-200', textMain: theme === 'dark' ? 'text-slate-100' : 'text-slate-900', textMuted: theme === 'dark' ? 'text-slate-400' : 'text-slate-500', titleGradient: theme === 'dark' ? `text-transparent bg-clip-text bg-gradient-to-r from-${currentThemeBase.palette}-400 to-${currentThemeBase.palette}-600` : `text-transparent bg-clip-text bg-gradient-to-r from-${currentThemeBase.palette}-600 to-${currentThemeBase.palette}-800`, inputBg: theme === 'dark' ? 'bg-white/10 border-white/10 text-white focus:border-white/30' : 'bg-white border-slate-300 text-slate-900 focus:border-slate-400' };
  const modalClasses = { innerBg: theme === 'dark' ? 'bg-slate-900/90 border-white/10 text-white backdrop-blur-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xl', btnInactive: TC.btnSec, label: `text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`, input: themeClasses.inputBg };
  const totalSpent = history.reduce((acc, item) => acc + item.cost, 0);
  const equippedBorderId = userData?.equipped?.border;
  const borderItem = COSMETIC_ITEMS.find(c => c.id === equippedBorderId);
  const borderClassRender = borderItem ? borderItem.className : '';

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-purple-500 font-bold"><Loader2 className="animate-spin mr-2" /> Carregando Legacy 26...</div>;

  if (!authUser) { return ( <div className={`min-h-screen flex items-center justify-center p-6 ${themeClasses.appBg} ${themeClasses.textMain}`}><div className={`max-w-md w-full p-8 rounded-3xl border ${themeClasses.cardBg} relative overflow-hidden`}><div className={`absolute inset-0 opacity-10 bg-gradient-to-br from-${currentThemeBase.palette}-500/20 to-transparent pointer-events-none`}></div><button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="absolute top-4 right-4 p-2 rounded-full border border-slate-700 opacity-50 hover:opacity-100 transition-opacity active:scale-95">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><div className="text-center mb-8 mt-2"><h1 className={`text-4xl font-black mb-2 ${TC.title}`} style={{ fontFamily: "'Orbitron', sans-serif" }}>LEGACY 26</h1><p className={themeClasses.textMuted}>{isSignUp ? "Crie seu perfil." : "Bem-vindo de volta."}</p></div>{authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm"><AlertTriangle size={16} /> {authError}</div>}
  <form onSubmit={handleAuthSubmit} className="space-y-4">
    {isSignUp && <div><label className="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500">Nome de Exibição</label><input type="text" required className={`w-full p-3 rounded-xl border ${themeClasses.inputBg}`} value={formName} onChange={e => setFormName(e.target.value)} /></div>}
    <div><label className="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500">Email</label><input type="email" required className={`w-full p-3 rounded-xl border ${themeClasses.inputBg}`} value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
    <div><label className="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500">Senha</label><input type="password" required className={`w-full p-3 rounded-xl border ${themeClasses.inputBg}`} value={formPassword} onChange={e => setFormPassword(e.target.value)} /></div>
    <button type="submit" disabled={authLoading} className={`w-full py-3 font-bold rounded-xl mt-6 active:scale-95 transition-transform shadow-lg ${TC.btn}`}>{authLoading ? <Loader2 className="animate-spin mx-auto"/> : (isSignUp ? "CRIAR" : "ENTRAR")}</button>
  </form>
  <div className="mt-4 flex items-center gap-4"><div className="h-px flex-1 bg-slate-700/50"></div><span className="text-xs text-slate-500">OU</span><div className="h-px flex-1 bg-slate-700/50"></div></div><button onClick={googleLogin} disabled={authLoading} className={`w-full py-3 border rounded-xl font-bold mt-4 flex items-center justify-center gap-2 active:scale-95 transition-transform ${theme==='dark'?'border-slate-700 hover:bg-slate-800 bg-slate-900':'border-slate-300 hover:bg-slate-50 bg-white'}`}><Chrome size={18} /> Google</button><div className="mt-6 text-center"><button onClick={() => setIsSignUp(!isSignUp)} className="text-sm hover:underline text-slate-500">{isSignUp ? "Já tem conta? Login" : "Criar conta"}</button></div></div></div> ); }

  return (
    <div key={authUser?.uid} className={`min-h-screen font-sans selection:bg-${currentThemeBase.palette}-500/30 selection:text-${currentThemeBase.palette}-900 transition-colors duration-300 ${themeClasses.appBg} ${themeClasses.textMain} flex flex-col md:flex-row relative overflow-hidden`} style={{ fontFamily: currentThemeBase.font }}>
      
      {isMatrixEffect && theme === 'dark' && <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/1/17/Matrix_code.gif')] bg-cover z-0 mix-blend-screen"></div>}
      
      <FloatingText texts={floatingTexts} />
      <Confetti active={showConfetti} />
      {dbError && (<div className="bg-red-600 text-white text-center p-2 text-sm font-bold animate-pulse fixed top-0 w-full z-[120]">⚠️ ERRO: Firebase bloqueado.</div>)}
      
      <aside className={`hidden md:flex flex-col w-64 h-full fixed top-0 left-0 border-r ${themeClasses.sidebarBg} p-6 z-40`}>
          <div className="mb-10">
             <h1 className={`text-3xl font-black tracking-widest ${TC.title}`}>LEGACY 26</h1>
             <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold">RPG de Hábitos</p>
          </div>

          <nav className="flex-1 space-y-3">
            <button onClick={() => { playSound('tab'); setActiveTab('quests');
            }} className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'quests' ?
            `${TC.btn} shadow-lg` : `${TC.btnSec}`}`}><Target size={20} /> Metas</button>
            <button onClick={() => { playSound('tab');
            setActiveTab('shop'); }} className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'shop' ?
            `${TC.btn} shadow-lg` : `${TC.btnSec}`}`}><ShoppingBag size={20} /> Loja</button>
            <button onClick={() => { playSound('tab');
            setActiveTab('dashboard'); }} className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ?
            `${TC.btn} shadow-lg` : `${TC.btnSec}`}`}><LayoutDashboard size={20} /> Painel</button>
            <button onClick={() => { playSound('tab'); setActiveTab('community'); }} className={`w-full flex items-center gap-3 font-bold px-4 py-3 rounded-xl transition-all ${activeTab === 'community' ? `${TC.btn} shadow-lg` : `${TC.btnSec}`}`}>
                <Users size={20} /> Comunidade
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800/50">
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`flex items-center gap-3 text-sm font-bold transition-colors ${themeClasses.textMuted} hover:text-white`}>
                {theme === 'dark' ?
                <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ?
                'Modo Claro' : 'Modo Escuro'}
             </button>
          </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen z-10 md:ml-64">
          
          <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 md:px-6 py-3 shadow-sm flex items-center justify-between ${themeClasses.headerBg}`}>
       
             <div className="md:hidden flex items-center gap-2">
                <span className={`text-xl font-black tracking-widest ${TC.title}`}>L26</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-auto w-full md:w-auto justify-end">
                <div ref={xpBarRef} className="w-24 md:w-48 relative group cursor-default hidden md:block">
                    <div className="flex justify-between text-[10px] font-bold mb-1 opacity-70">
                        <span className="hidden md:inline">XP {userData?.xp}</span>
                        <span>Nv.
                        {userData?.level}</span>
                    </div>
                    <ProgressBar current={userData?.xp} max={userData?.xpToNextLevel} colorClass={TC.bar} theme={theme} height="h-2" />
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${theme === 'dark' ?
                'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-orange-100 border-orange-200 text-orange-600'}`} title="Ofensiva">
                    <Flame size={16} className="fill-current" />
                    <span className="text-sm font-bold">{userData?.streak ||
                    0}</span>
                </div>

                <div className="h-8 w-px bg-slate-700/20 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                    <div ref={goldRef} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${theme === 'dark' ?
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-yellow-100 border-yellow-200 text-yellow-600'}`} title="Ouro">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                        <span className="text-sm font-bold">{userData?.gold}</span>
                    </div>
                 
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${theme === 'dark' ?
                    'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-cyan-100 border-cyan-200 text-cyan-600'}`} title="Diamantes">
                        <Gem size={16} />
                        <span className="text-sm font-bold">{userData?.diamonds ||
                        0}</span>
                    </div>
                </div>

                <div onClick={handleOpenProfileModal} className={`w-10 h-10 rounded-full bg-slate-800 cursor-pointer overflow-hidden ${borderClassRender} ring-2 ring-slate-700 hover:ring-${currentThemeBase.palette}-500 transition-all ml-2 flex-shrink-0`}>
                    {userData?.avatar ?
                    <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={18} className="text-slate-400 m-auto mt-2.5" />}
                </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
            {activeTab === 'quests' && (
              <div className="space-y-8 animate-fadeIn">
                <Tasks 
                    quests={quests}
                    activeSprint={activeSprint}
                    setActiveSprint={setActiveSprint}
                    theme={theme}
                    TC={TC}
                    themeClasses={themeClasses}
                    currentThemeBase={currentThemeBase}
                    handleEditQuest={handleEditQuest}
                    handleTogglePriority={handleTogglePriority}
                    requestDeleteQuest={requestDeleteQuest}
                    handleCompleteQuest={handleCompleteQuest}
                    handleResetQuest={handleResetQuest}
                    setUpdatingProgressQuest={setUpdatingProgressQuest}
                    setEditingQuestId={setEditingQuestId}
                    setIsAddModalOpen={setIsAddModalOpen}
                    setProgressAmount={setProgressAmount}
                    setProgressMode={setProgressMode}
                    setIsProgressModalOpen={setIsProgressModalOpen}
                    onAddQuest={handleOpenAddModal} 
                />
              </div>
            )}
            
            {activeTab === 'shop' && (
              <Shop 
                shopTab={shopTab}
                setShopTab={setShopTab}
                rewards={rewards}
                history={history}
                userData={userData}
                theme={theme}
                TC={TC}
                themeClasses={themeClasses}
                currentThemeBase={currentThemeBase}
                handleBuyCosmetic={handleBuyCosmetic}
                handleEquipCosmetic={handleEquipCosmetic}
                requestBuyReward={requestBuyReward}
                requestDeleteReward={requestDeleteReward}
                requestDeleteHistory={requestDeleteHistory}
                setEditingRewardId={setEditingRewardId}
                setIsRewardModalOpen={setIsRewardModalOpen}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard 
                userData={userData}
                quests={quests}
                xpHistory={xpHistory}
                totalSpent={totalSpent}
                theme={theme}
                TC={TC}
                themeClasses={themeClasses}
                currentThemeBase={currentThemeBase}
              />
            )}

            {activeTab === 'community' && (
              <Community 
                theme={theme}
                TC={TC}
                themeClasses={themeClasses}
                currentThemeBase={currentThemeBase}
              />
            )}
          </main>
      </div>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 px-6 py-4 flex justify-around z-50 ${themeClasses.navBg} pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t ${theme==='dark'?'border-slate-800':'border-slate-200'}`}>
        <button onClick={() => { playSound('tab');
        setActiveTab('quests'); }} className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform ${activeTab === 'quests' ?
        TC.text : themeClasses.textMuted}`}><Target size={24} /><span className="text-[10px] font-bold">Metas</span></button>
        <button onClick={() => { playSound('tab'); setActiveTab('shop');
        }} className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform ${activeTab === 'shop' ?
        TC.text : themeClasses.textMuted}`}><ShoppingBag size={24} /><span className="text-[10px] font-bold">Loja</span></button>
        <button onClick={() => { playSound('tab'); setActiveTab('dashboard');
        }} className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform ${activeTab === 'dashboard' ?
        TC.text : themeClasses.textMuted}`}><LayoutDashboard size={24} /><span className="text-[10px] font-bold">Painel</span></button>
        <button onClick={() => { playSound('tab'); setActiveTab('community'); }} className={`flex flex-col items-center gap-1.5 active:scale-95 transition-transform ${activeTab === 'community' ? TC.text : themeClasses.textMuted}`}>
            <Users size={24} /><span className="text-[10px] font-bold">Social</span>
        </button>
      </nav>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Seu Perfil" theme={theme} modalClasses={modalClasses}>
          <div className="space-y-8">
                <div className="flex justify-center relative group my-4">
                  <div className={`w-36 h-36 rounded-full bg-slate-800 overflow-hidden ${borderClassRender} flex items-center justify-center relative ring-4 ring-slate-700/50 shadow-2xl`}>
                      {(profileForm.avatar || userData?.avatar) ?
                      <img src={profileForm.avatar || userData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={56} className="text-slate-400" />}
                      <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"><Camera size={36} className="text-white drop-shadow-md" /></label>
                      <input id="avatar-upload" type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  </div>
              </div>

              <div className="text-center mb-6">
                  <div className="flex justify-between text-xs font-bold mb-1 opacity-70">
                        <span>XP {userData?.xp}</span>
                        <span>Nível {userData?.level}</span>
                  </div>
                  <ProgressBar current={userData?.xp} max={userData?.xpToNextLevel} colorClass={TC.bar} theme={theme} height="h-3" />
              </div>
              
              <div className="space-y-5">
                  <div>
                    <label className={modalClasses.label}>Nome de Usuário</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 
                        font-bold">@</span>
                        <input type="text" className={`w-full p-4 pl-8 rounded-2xl border text-lg font-bold ${modalClasses.input}`} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                    </div>
                  </div>
                  <div><label className={modalClasses.label}>Nome</label><input type="text" className={`w-full 
                  p-4 rounded-2xl border font-medium ${modalClasses.input}`} value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} placeholder="Nome Completo" /></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className={modalClasses.label}>Telefone</label><input type="text" className={`w-full p-4 rounded-2xl border ${modalClasses.input}`} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="(XX) XXXXX-XXXX" /></div>
                      <div>
                          <label className={modalClasses.label}>Nascimento</label>
                          <div className={`relative flex items-center w-full p-4 rounded-2xl border ${modalClasses.input}`}>
                              <Calendar size={20} className={`mr-3 ${themeClasses.textMuted}`} />
                              <input type="date" className={`bg-transparent border-none outline-none w-full p-0 font-medium ${theme === 'dark' ?
                              'text-white [color-scheme:dark]' : 'text-slate-900 [color-scheme:light]'}`} value={profileForm.birthDate} onChange={e => setProfileForm({...profileForm, birthDate: e.target.value})} />
                          </div>
                      </div>
                  </div>
                  <div><label className={modalClasses.label}>Bio</label><textarea className={`w-full p-4 rounded-2xl 
                  border ${modalClasses.input}`} rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} placeholder="Escreva sua lenda..." /></div>
              </div>
              <button onClick={handleSaveProfile} className={`w-full font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform ${TC.btn}`}>SALVAR ALTERAÇÕES</button>

              {/* Botões movidos para o final */}
              <div className={`flex justify-between items-center p-2 rounded-2xl border ${modalClasses.innerBg}`}>
                    <button onClick={() => { playSound('click');
                    setTheme(theme === 'dark' ? 'light' : 'dark'); }} className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold transition-all active:scale-95 ${theme === 'dark' ?
                    'bg-slate-800 text-yellow-400' : 'bg-white text-slate-900 shadow-sm border border-slate-200'}`}>{theme === 'dark' ?
                    <><Sun size={20} /> Modo Claro</> : <><Moon size={20} /> Modo Escuro</>}</button>
                    <div className="w-px h-10 bg-slate-500/20 mx-2"></div>
                    <button onClick={() => logout()} className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all active:scale-95"><LogOut size={20} /> Sair</button>
               </div>
          </div>
      </Modal>

      {/* --- Resto dos modais mantido igual --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={creationStep === 'select' ? "Criar Nova Missão" : (editingQuestId ? 'Editar Meta' : 'Nova Meta')} theme={theme} modalClasses={modalClasses}>
        
        {/* PASSO 1: SELEÇÃO */}
        {creationStep === 'select' && (
            <div className="space-y-4">
                <button 
                    onClick={() => setCreationStep('manual')}
                    className={`w-full p-6 rounded-3xl border flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                    <div className={`p-4 rounded-2xl ${TC.iconBg} ${TC.text}`}><PenTool size={28} /></div>
                    <div className="text-left">
                        <div className="text-lg font-black">Manual</div>
                        <div className={`text-xs ${themeClasses.textMuted}`}>Criar do zero, do seu jeito.</div>
                    </div>
                </button>

                <button 
                    onClick={() => {
                        setIsAddModalOpen(false);
                        setSelectedPlanTemplate(null);
                        setIsPlanModalOpen(true);
                    }}
                    className={`w-full p-6 rounded-3xl border flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'}`}
                >
                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg`}><Sparkles size={28} /></div>
                    <div className="text-left">
                        <div className="text-lg font-black">Assistente IA</div>
                        <div className={`text-xs ${themeClasses.textMuted}`}>Gerar plano personalizado.</div>
                    </div>
                </button>
            </div>
        )}

        {/* PASSO 2: MANUAL */}
        {creationStep === 'manual' && (
            <div className="space-y-6">
                <div className={`flex p-1.5 rounded-2xl border ${modalClasses.innerBg}`}>
                    <button onClick={() => { playSound('click');
                    setNewQuest({...newQuest, type: 'checklist'}); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${newQuest.type === 'checklist' ?
                    `${TC.btn} shadow-md` : `${themeClasses.textMuted} hover:bg-black/5`}`}>Checklist</button>
                    <button onClick={() => { playSound('click');
                    setNewQuest({...newQuest, type: 'progressive'}); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${newQuest.type === 'progressive' ?
                    `${TC.btn} shadow-md` : `${themeClasses.textMuted} hover:bg-black/5`}`}>Progresso</button>
                </div>
                
                <input type="text" placeholder="Título da Missão" className={`w-full p-5 rounded-2xl border focus:outline-none text-lg font-bold ${modalClasses.input}`} value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} autoFocus />
                
                {/* --- CHECKBOX PÚBLICA --- */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div onClick={() => setNewQuest({...newQuest, isPublic: !newQuest.isPublic})} className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${newQuest.isPublic ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                        {newQuest.isPublic && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold">Meta Pública</div>
                        <div className="text-[10px] opacity-50">Seus amigos poderão ver e incentivar.</div>
                    </div>
                </div>

                <div><label className={modalClasses.label}>Dificuldade</label><div className="grid grid-cols-4 gap-3">{Object.entries(DIFFICULTIES).map(([k, v]) => ( <button key={k} onClick={() => { playSound('click'); setNewQuest({...newQuest, difficulty: k}); }} className={`p-3 rounded-xl border text-xs font-bold transition-all active:scale-95 ${newQuest.difficulty === k ? `${v.color} ${v.border} ${theme==='dark'?v.bg:'bg-white'}` : modalClasses.btnInactive}`}>{v.label}</button> ))}</div></div>
                <div><label className={modalClasses.label}>Frequência</label><div className="grid grid-cols-4 gap-2">{Object.entries(FREQUENCIES).map(([k, v]) => ( <button key={k} onClick={() => { playSound('click');
                setNewQuest({...newQuest, frequency: k}); }} className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all active:scale-95 ${newQuest.frequency === k ?
                `${TC.text} border-current bg-current/10` : modalClasses.btnInactive}`}><v.icon size={18} /> {v.label}</button> ))}</div></div>
                
                <div>
                <label className={modalClasses.label}>Categoria</label>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(CATEGORIES).map(([k, v]) => ( 
                    <button key={k} onClick={() => { playSound('click'); setNewQuest({...newQuest, category: k}); }} className={`flex-shrink-0 px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${newQuest.category === k ? `${v.color} border-current ${theme==='dark'?v.bg:'bg-white'}` : modalClasses.btnInactive}`}>
                        <v.icon size={16} /> {v.label}
                    </button> 
                    ))}
                </div>
                </div>

                <div>
                    <label className={modalClasses.label}>Período</label>
                    <div className="flex flex-col gap-3">
                        {Object.values(SPRINTS).map(s => ( 
                            <button key={s.id} onClick={() => { playSound('click');
                            setNewQuest({...newQuest, sprint: s.id}); }} className={`p-4 rounded-2xl border text-left transition-all active:scale-95 flex justify-between items-center ${newQuest.sprint === s.id ?
                            `${TC.text} border-current bg-current/10` : modalClasses.btnInactive}`}>
                                <div><div className="text-sm font-bold">{s.title}</div><div className={`text-xs mt-1 ${themeClasses.textMuted}`}>{s.range}</div></div>
                                {newQuest.sprint === s.id && <CheckCircle2 size={18} className="fill-current" />}
                            </button> 
                    ))}
                    </div>
                </div>
                
                {newQuest.type === 'progressive' && (
                    <div className={`p-5 rounded-2xl border ${modalClasses.innerBg} space-y-4`}>
                        <div>
                            <label className={modalClasses.label}>O que vamos medir?</label>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {Object.entries(METRICS).map(([key, data]) => (
                                    <button 
                                        key={key} 
                                        onClick={() => { playSound('click'); setNewQuest({...newQuest, metric: key, progressUnit: data.unit}); }} 
                                        className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 border ${newQuest.metric === key ? `${TC.text} border-current bg-current/10` : modalClasses.btnInactive}`}
                                    >
                                        <data.icon size={16} />
                                        {data.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold opacity-70 mb-2 block">Quanto quer atingir?</label>
                                <input 
                                    type="number" 
                                    className={`w-full bg-transparent border-b-2 border-slate-500/30 py-2 focus:outline-none text-2xl font-black ${themeClasses.textMain} focus:border-current`} 
                                    value={newQuest.progressTarget} 
                                    onChange={e => setNewQuest({...newQuest, progressTarget: e.target.value})} 
                                    placeholder="1000" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold opacity-70 mb-2 block">Unidade</label>
                                <input 
                                    type="text" 
                                    className={`w-full bg-transparent border-b-2 border-slate-500/30 py-2 focus:outline-none text-lg font-bold ${themeClasses.textMain} focus:border-current`} 
                                    value={newQuest.progressUnit} 
                                    onChange={e => setNewQuest({...newQuest, progressUnit: e.target.value})} 
                                    placeholder="ex: kg, km..." 
                                />
                            </div>
                        </div>

                        {(newQuest.progressTarget || newQuest.progressUnit) && (
                            <div className={`text-center text-xs opacity-60 mt-2 p-2 rounded-lg border border-dashed border-slate-500/30`}>
                                Como vai aparecer: <strong>0 / {newQuest.progressTarget || '?'} {newQuest.progressUnit || '?'}</strong>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={handleSaveQuest} className={`w-full font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all ${TC.btn}`}>{editingQuestId ?
                'SALVAR ALTERAÇÕES' : 'CRIAR MISSÃO'}</button>
            </div>
        )}
      </Modal>

      <Modal isOpen={isPlanModalOpen} onClose={() => { setIsPlanModalOpen(false); setSelectedPlanTemplate(null); }} title="Assistente de Planos" theme={theme} modalClasses={modalClasses}>
        {!selectedPlanTemplate ? (
            <div className="grid grid-cols-1 gap-4">
                {PLAN_TEMPLATES && Object.values(PLAN_TEMPLATES).map(template => (
                    <button key={template.id} onClick={() => { setSelectedPlanTemplate(template.id); playSound('click'); }} className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-4 ${modalClasses.btnInactive}`}>
                        <div className={`p-3 rounded-xl ${template.color.replace('text-', 'bg-')}/10 ${template.color}`}>
                            <template.icon size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-lg">{template.label}</div>
                            <div className={`text-xs ${themeClasses.textMuted}`}>{template.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => setSelectedPlanTemplate(null)} className={`p-2 rounded-xl border ${modalClasses.btnInactive}`}><ChevronRight className="rotate-180" size={20}/></button>
                    <h3 className="font-bold text-xl">{PLAN_TEMPLATES[selectedPlanTemplate].label}</h3>
                </div>
                
                {PLAN_TEMPLATES[selectedPlanTemplate].questions.map(q => (
                    <div key={q.id}>
                        <label className={modalClasses.label}>{q.label}</label>
                        {q.type === 'number' && (
                            <input 
                                type="number" 
                                className={`w-full p-4 rounded-2xl border ${modalClasses.input}`}
                                placeholder={q.placeholder}
                                onChange={(e) => setPlanAnswers({...planAnswers, [q.id]: e.target.value})}
                            />
                        )}
                        {q.type === 'select' && (
                            <select 
                                className={`w-full p-4 rounded-2xl border ${modalClasses.input}`}
                                onChange={(e) => setPlanAnswers({...planAnswers, [q.id]: e.target.value})}
                            >
                                <option value="" className="text-slate-900 bg-white">Selecione...</option>
                                {q.options.map(opt => (
                                    <option key={opt.value} value={opt.value} className="text-slate-900 bg-white">{opt.label}</option>
                                ))}
                            </select>
                        )}
                    </div>
                ))}

                <button onClick={handleCreatePlan} className={`w-full font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform ${TC.btn}`}>
                    GERAR PLANO AGORA
                </button>
            </div>
        )}
      </Modal>

      <Modal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} title="Nova Recompensa" theme={theme} modalClasses={modalClasses}><div className="space-y-6"><div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs font-bold mb-4">💡 Dica de Preço: Pequeno (30-50), Médio (100-200), Grande (300+)</div><input type="text" placeholder="Título" className={`w-full p-4 rounded-2xl border text-lg font-bold ${modalClasses.input}`} value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})} autoFocus /><input type="number" placeholder="Custo (Ouro)" className={`w-full p-4 rounded-2xl border text-lg font-bold ${modalClasses.input}`} value={newReward.cost} onChange={e => setNewReward({...newReward, cost: e.target.value})} /><button onClick={handleSaveReward} className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-yellow-500/20">CRIAR RECOMPENSA</button></div></Modal>
      
      <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Atualizar Progresso" theme={theme} modalClasses={modalClasses}><div className="space-y-6"><div className={`flex gap-2 p-1.5 rounded-2xl ${modalClasses.innerBg}`}><button onClick={() => setProgressMode('add')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${progressMode==='add' ?
      'bg-green-600 text-white shadow-md' : `${themeClasses.textMuted} hover:bg-black/5`}`}>+ Adicionar</button><button onClick={() => setProgressMode('remove')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${progressMode==='remove' ?
      'bg-red-600 text-white shadow-md' : `${themeClasses.textMuted} hover:bg-black/5`}`}>- Remover</button></div><input type="number" placeholder="Valor" className={`w-full p-5 rounded-2xl border text-2xl font-black text-center ${modalClasses.input}`} value={progressAmount} onChange={e => setProgressAmount(e.target.value)} autoFocus /><button onClick={handleUpdateProgress} className={`w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-transform shadow-lg ${progressMode==='add' ?
      'bg-green-600 hover:bg-green-500 shadow-green-600/20' : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'}`}>CONFIRMAR</button></div></Modal>
      
      {levelUpModal && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"><div className="text-center animate-bounce"><h2 className={`text-7xl font-black ${TC.title} mb-6 drop-shadow-2xl`} style={{ fontFamily: "'Orbitron', sans-serif" }}>LEVEL UP!</h2><div className="text-3xl text-white font-bold mb-10">Você alcançou o Nível {userData?.level}</div><div className="flex justify-center"><button onClick={() => setLevelUpModal(false)} className="bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-2xl">CONTINUAR JORNADA</button></div></div></div>)}
      {streakModal && (<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-bounce"><div className="text-center"><h2 className="text-6xl font-black text-orange-500 mb-4 drop-shadow-2xl">OFENSIVA!</h2><Flame size={100} className="mx-auto text-orange-500 mb-6 animate-pulse filter drop-shadow-lg" /><div className="text-3xl 
      text-white font-bold mb-4">{userData?.streak} DIAS SEGUIDOS</div><div className="text-xl text-slate-300">A lenda continua...</div><button onClick={() => setStreakModal(false)} className="mt-12 bg-white text-black px-10 py-4 rounded-full font-bold active:scale-95 transition-transform shadow-2xl">FECHAR</button></div></div>)}
      {confirmation.isOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
              <div className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-slideUp ${modalClasses.innerBg} border`}>
                  <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-red-500/10 rounded-full text-red-500"><AlertTriangle size={24} /></div>
                      <h3 className="text-lg font-bold">{confirmation.title}</h3>
                  </div>
                  <p className={`mb-8 text-sm leading-relaxed ${themeClasses.textMuted}`}>{confirmation.message}</p>
                  <div className="flex gap-4">
                      <button onClick={() => setConfirmation({ ...confirmation, isOpen: false })} className={`flex-1 py-3.5 rounded-2xl font-bold transition-colors active:scale-95 ${modalClasses.btnInactive}`}>Cancelar</button>
                      <button onClick={executeConfirmation} className="flex-1 py-3.5 rounded-2xl font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-colors active:scale-95">{confirmation.actionLabel}</button>
                  </div>
              </div>
          </div>
      )}
      
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Cinzel:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
      *::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0;
      } to { opacity: 1; } } @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1;
      } 100% { transform: translateY(-50px) scale(1.5); opacity: 0; } } .animate-float-up { animation: floatUp 2s ease-out forwards;
      } @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1;
      } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; } .animate-slideUp { animation: slideUp 0.3s ease-out;
      }`}</style>
    </div>
  );
}