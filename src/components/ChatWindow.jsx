import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, User, ChevronLeft } from 'lucide-react'; 
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { playSound } from '../utils/helpers';

const db = getFirestore();

export default function ChatWindow({ currentUser, targetUser, onClose, theme, themeClasses, TC }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  
  // ESTADO PARA CONTROLAR A ALTURA EXATA DA TELA
  const [viewportHeight, setViewportHeight] = useState('100%');
  
  const scrollRef = useRef();
  const inputRef = useRef();

  // --- SOLUÇÃO MÁGICA PARA IOS ---
  // Usa a API visualViewport para detectar o tamanho real da tela quando o teclado abre
  useEffect(() => {
    // Função para atualizar a altura
    const handleResize = () => {
      if (window.visualViewport) {
        // Define a altura como a altura visível atual (descontando teclado)
        setViewportHeight(`${window.visualViewport.height}px`);
        // Opcional: Rola para baixo para garantir visibilidade
        window.scrollTo(0, 0);
      } else {
        setViewportHeight(`${window.innerHeight}px`);
      }
    };

    // Adiciona listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      // Chama uma vez para garantir
      handleResize();
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Trava o scroll do corpo do site
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      // Limpeza
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Inicialização do Chat
  useEffect(() => {
    const initChat = async () => {
      if (!currentUser || !targetUser) return;
      const ids = [currentUser.uid, targetUser.id].sort();
      const convId = `${ids[0]}_${ids[1]}`;
      setConversationId(convId);

      const convRef = doc(db, 'conversations', convId);
      // Verifica sem await bloqueante para UX mais rápida
      getDoc(convRef).then(snap => {
         if (!snap.exists()) {
            setDoc(convRef, {
                participants: ids,
                startedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
         }
      });
    };
    initChat();
  }, [currentUser, targetUser]);

  // Listener de mensagens
  useEffect(() => {
    if (!conversationId) return;
    const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
    });
    return () => unsubscribe();
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;
    const text = newMessage;
    setNewMessage(''); 
    playSound('pop');
    
    // Mantém foco
    if(inputRef.current) inputRef.current.focus();

    try {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text: text, senderId: currentUser.uid, createdAt: serverTimestamp()
      });
      await setDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text, updatedAt: serverTimestamp(), participants: [currentUser.uid, targetUser.id].sort()
      }, { merge: true });
    } catch (e) { console.error(e); }
  };

  return (
    // CONTAINER MESTRE COM POSIÇÃO FIXA E ALTURA CALCULADA VIA JS
    // O 'style={{ height: viewportHeight }}' é o segredo.
    <div 
        className={`fixed left-0 top-0 w-full z-[9999] flex flex-col ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}
        style={{ 
            height: viewportHeight,
            // Fallback para desktop
            maxHeight: '100dvh' 
        }}
    >
      
      {/* 1. HEADER (Fixo) */}
      <div className={`shrink-0 p-3 border-b flex justify-between items-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform"><ChevronLeft size={26} /></button>
          <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
            {targetUser.avatar ? <img src={targetUser.avatar} className="w-full h-full object-cover" /> : <User size={18} className="m-auto mt-2 text-slate-400"/>}
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight">{targetUser.name}</span>
            <span className={`text-[10px] ${themeClasses.textMuted}`}>Online</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
      </div>

      {/* 2. MENSAGENS (Elástico) */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {loading ? (
            <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-slate-500" /></div>
        ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
                <Send size={32} className="mb-2" />
                <p>Mande um oi!</p>
            </div>
        ) : (
            messages.map(msg => {
                const isMe = msg.senderId === currentUser.uid;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-snug ${isMe ? `${TC.bg} text-white rounded-tr-sm` : `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 dark:text-slate-200 rounded-tl-sm`}`}>
                            {msg.text}
                        </div>
                    </div>
                )
            })
        )}
        <div ref={scrollRef} className="h-1" />
      </div>

      {/* 3. INPUT (Fixo no rodapé do container JS) */}
      <div className={`shrink-0 w-full p-3 border-t ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input 
                ref={inputRef}
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mensagem..."
                // Font 16px evita zoom
                style={{ fontSize: '16px' }}
                className={`flex-1 pl-4 pr-3 py-3 rounded-full outline-none ${theme === 'dark' ? 'bg-slate-950 text-white placeholder-slate-500 border border-slate-800' : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200'}`}
            />
            <button type="submit" disabled={!newMessage.trim()} className={`p-3 rounded-full ${TC.btn} disabled:opacity-50 flex-shrink-0 shadow-lg`}>
                <Send size={18} />
            </button>
        </form>
      </div>

    </div>
  );
}