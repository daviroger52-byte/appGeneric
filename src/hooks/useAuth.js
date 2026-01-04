import { useState, useEffect } from 'react';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, writeBatch, enableNetwork, collection, query, where, getDocs 
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getTodayStr } from '../utils/helpers';

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

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const getWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const oneJan = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const dayOfYear = ((date - oneJan + 86400000) / 86400000);
    return Math.ceil((dayOfYear + oneJan.getUTCDay()) / 7);
  };

  // --- FUNÇÃO CRÍTICA PARA A PESQUISA FUNCIONAR ---
  const syncPublicProfile = async (uid, data) => {
    if (!data) return;
    try {
        const publicData = {
            uid: uid,
            name: data.name || 'Viajante',
            fullName: data.fullName || '',
            avatar: data.avatar || '',
            bio: data.bio || '',
            level: data.level || 1,
            border: data.equipped?.border || null,
            lastActive: new Date().toISOString()
        };
        // O merge: true garante que não apagamos dados se já existirem
        await setDoc(doc(db, 'public_profiles', uid), publicData, { merge: true });
        console.log("✅ Perfil público sincronizado para:", data.name);
    } catch (e) {
        console.error("❌ Erro ao sincronizar perfil público:", e);
    }
  };

  const checkDailyRoutine = async (uid, currentData) => {
      const todayString = getTodayStr(); 
      const today = new Date(); 
      
      if (!currentData || !uid) return;

      if (currentData.lastLoginDate !== todayString) {
          try {
            const batch = writeBatch(db);
            const userRef = doc(db, 'artifacts', appId, 'users', uid, 'profile', 'main');
            
            const lastLoginDate = new Date(currentData.lastLoginDate || todayString); 
            
            const qSnapshotDaily = await getDocs(query(collection(db, 'artifacts', appId, 'users', uid, 'quests'), where('frequency', '==', 'daily')));
            qSnapshotDaily.forEach(doc => { if (doc.data().completed) batch.update(doc.ref, { completed: false }); });

            if (getWeekNumber(today) !== getWeekNumber(lastLoginDate)) {
                const qSnapshotWeekly = await getDocs(query(collection(db, 'artifacts', appId, 'users', uid, 'quests'), where('frequency', '==', 'weekly')));
                qSnapshotWeekly.forEach(doc => { if (doc.data().completed) batch.update(doc.ref, { completed: false }); });
            }

            if (lastLoginDate.getMonth() !== today.getMonth()) {
                const qSnapshotMonthly = await getDocs(query(collection(db, 'artifacts', appId, 'users', uid, 'quests'), where('frequency', '==', 'monthly')));
                qSnapshotMonthly.forEach(doc => { if (doc.data().completed) batch.update(doc.ref, { completed: false }); });
            }

            batch.update(userRef, { lastLoginDate: todayString, dailyTaskDone: false });
            await batch.commit();
          } catch (e) {
              console.error("Erro na rotina diária:", e);
          }
      }
  };

  const seedInitialData = async (uid) => {
      // Placeholder
  };

  useEffect(() => {
    try { enableNetwork(db); } catch(e) {}
    
    let unsubProfile = () => {}; 

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubProfile(); // Limpa listener anterior
      
      if (currentUser) {
        setUser(currentUser);
        
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'main');
        
        unsubProfile = onSnapshot(userRef, (snap) => {
          setDbError(false);
          if (snap.exists()) {
              const data = snap.data();
              // Validações de segurança para evitar undefined
              if (!data.inventory) data.inventory = ['theme_default'];
              if (!data.equipped) data.equipped = { theme: 'theme_default', border: null };
              if (data.diamonds === undefined) data.diamonds = 40;
              if (data.gold === undefined) data.gold = 100;
              
              setUserData(data);
              checkDailyRoutine(currentUser.uid, data);
              
              // >>> AQUI ESTÁ A CORREÇÃO DA PESQUISA <<<
              // Sincroniza sempre que carregar o perfil
              syncPublicProfile(currentUser.uid, data);

          } else {
             // Cria perfil padrão se não existir
             const initialData = { name: currentUser.displayName || 'Viajante', level: 1, xp: 0, xpToNextLevel: 100, gold: 100, diamonds: 40, streak: 0, inventory: ['theme_default'], equipped: { theme: 'theme_default', border: null }, fullName: '', phone: '', birthDate: '', bio: '' };
             setUserData(initialData);
             setDoc(userRef, initialData);
             syncPublicProfile(currentUser.uid, initialData);
          }
          setLoading(false);
        }, (error) => { 
            console.error("Erro perfil:", error);
            if (error.code === 'permission-denied') setDbError(true);
            setLoading(false); 
        });

      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubProfile();
    };
  }, []);

  const login = async (email, password) => {
    setAuthError(''); setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError("Erro ao autenticar. Verifique seus dados.");
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setAuthError(''); setAuthLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const initialData = { name: name || 'Viajante', level: 1, xp: 0, xpToNextLevel: 100, gold: 100, diamonds: 40, streak: 0, lastLoginDate: getTodayStr(), inventory: ['theme_default'], equipped: { theme: 'theme_default', border: null }, fullName: '', phone: '', birthDate: '', bio: '' };
      
      await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'main'), initialData);
      await seedInitialData(cred.user.uid);
      await syncPublicProfile(cred.user.uid, initialData);

    } catch (error) {
      setAuthError("Erro ao criar conta.");
    } finally {
      setAuthLoading(false);
    }
  };

  const googleLogin = async () => {
    setAuthError(''); setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'artifacts', appId, 'users', res.user.uid, 'profile', 'main');
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
         const initialData = { name: res.user.displayName || 'Viajante', avatar: res.user.photoURL || '', phone: res.user.phoneNumber || '', email: res.user.email, emailVerified: res.user.emailVerified, createdAt: res.user.metadata.creationTime, level: 1, xp: 0, xpToNextLevel: 100, gold: 100, diamonds: 40, streak: 0, lastLoginDate: getTodayStr(), inventory: ['theme_default'], equipped: { theme: 'theme_default', border: null }, fullName: '', birthDate: '', bio: '' };
         await setDoc(userRef, initialData);
         await seedInitialData(res.user.uid);
         await syncPublicProfile(res.user.uid, initialData);
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') setAuthError("Erro Google.");
    } finally {
      setAuthLoading(false);
    }
  };

  // --- SOLUÇÃO DO CRASH: RELOAD NO LOGOUT ---
  const logout = async () => {
      try {
          await signOut(auth);
          // O Reload é obrigatório para limpar o Singleton do Firestore da memória
          // e evitar o erro "Unexpected state" ao trocar de usuário.
          window.location.reload(); 
      } catch (e) {
          console.error("Erro ao sair:", e);
          window.location.reload(); // Reload mesmo se der erro
      }
  };

  const updateUserProfile = async (newData, profileForm = null) => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), newData);
    setUserData(newData);
    await syncPublicProfile(user.uid, newData);
  };

  return {
    user,
    userData,
    loading,
    dbError,
    authError,
    authLoading,
    login,
    signup,
    googleLogin,
    logout,
    updateUserProfile,
    setUserData, 
    db, 
    appId 
  };
}