
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, UserStatus, MemberLevel, Event, VantaNotification, Conversation, Message, PrivacyLevel, Community, TicketBatch } from './types';
import { BRAND, ICONS, MOCK_EVENTS, BRAZIL_STATES, MOCK_COMMUNITIES } from './constants';
import { Messages } from './components/Messages';
import { AdminDashboard } from './components/AdminDashboard';

const INITIAL_PRIVACY = { profileInfo: 'amigos' as PrivacyLevel, confirmedEvents: 'amigos' as PrivacyLevel, messages: 'amigos' as PrivacyLevel };

const MOCK_USER: User = {
  id: 'vanta_master',
  fullName: 'Vanta Master',
  username: 'vanta.clube',
  email: 'admin@vanta.club',
  instagram: '@vanta.clube',
  status: UserStatus.ADMIN,
  level: MemberLevel.BLACK,
  avatar: 'https://picsum.photos/200/200?random=admin',
  bio: 'Acesso é a nova moeda de luxo.',
  gallery: ['https://picsum.photos/600/600?random=g1', 'https://picsum.photos/600/600?random=g2'],
  isVantaPlus: true,
  privacy: INITIAL_PRIVACY,
  joinedAt: Date.now(),
  vantaMoments: 42,
  friends: ['u3'],
  friendRequestsSent: [],
  friendRequestsReceived: [],
  confirmedEventsIds: ['e1']
};

const MOCK_ALL_USERS: User[] = [
  MOCK_USER,
  {
    id: 'u2',
    fullName: 'Mariana Andrade',
    username: 'mari.andrade',
    email: 'mariana@vanta.com',
    instagram: '@mariandrade',
    status: UserStatus.APPROVED,
    level: MemberLevel.GOLD,
    avatar: 'https://picsum.photos/200/200?random=12',
    bio: 'Lifestyle & Curadoria.',
    gallery: ['https://picsum.photos/600/600?random=g3'],
    isVantaPlus: false,
    privacy: { ...INITIAL_PRIVACY, confirmedEvents: 'todos' },
    joinedAt: Date.now(),
    vantaMoments: 15,
    friends: [],
    friendRequestsSent: [],
    friendRequestsReceived: [],
    confirmedEventsIds: ['e1']
  },
  {
    id: 'u3',
    fullName: 'Guilherme Santos',
    username: 'gui.santos',
    email: 'guilherme@vanta.com',
    instagram: '@guisantos',
    status: UserStatus.APPROVED,
    level: MemberLevel.BLACK,
    avatar: 'https://picsum.photos/200/200?random=15',
    isVantaPlus: true,
    gallery: [],
    privacy: { ...INITIAL_PRIVACY, confirmedEvents: 'todos' },
    joinedAt: Date.now(),
    vantaMoments: 28,
    friends: ['vanta_master'],
    friendRequestsSent: [],
    friendRequestsReceived: [],
    confirmedEventsIds: ['e1']
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'search' | 'messages' | 'profile'>('home');
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventViewMode, setEventViewMode] = useState<'details' | 'tickets' | 'community'>('details');
  const [showRSVPList, setShowRSVPList] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginView, setLoginView] = useState<'landing' | 'form' | 'signup' | 'forgot-password' | 'reset-password'>('landing');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const [selectedCity, setSelectedCity] = useState<string>('São Paulo');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mapPermissionRequested, setMapPermissionRequested] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedMapDate, setSelectedMapDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [searchType, setSearchType] = useState<'eventos' | 'amigos'>('eventos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedUserProfile, setViewedUserProfile] = useState<User | null>(null);
  const [showFriendRequestSentPopup, setShowFriendRequestSentPopup] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<VantaNotification[]>([
    { id: '1', title: 'Novo evento na sua região!', subtitle: 'Confira THE BLACK MANSION agora.', type: 'event', eventId: 'e1' },
    { id: '2', title: 'Guilherme te adicionou', subtitle: 'Clique para ver o perfil.', type: 'info', target: 'profile' },
  ]);

  const [currentIndicaIndex, setCurrentIndicaIndex] = useState(0);
  const vantaIndicaEvents = useMemo(() => events.filter(e => e.city === selectedCity), [events, selectedCity]);

  useEffect(() => {
    if (activeTab === 'home' && vantaIndicaEvents.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndicaIndex((prev) => (prev + 1) % vantaIndicaEvents.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, vantaIndicaEvents]);

  const availableCities = useMemo(() => {
    const cities = new Set(events.map(e => e.city));
    return Array.from(cities).sort();
  }, [events]);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentUser(MOCK_USER);
      setIsProcessing(false);
    }, 1500);
  };

  const requestGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setMapPermissionRequested(true);
        },
        (error) => {
          console.error("Erro geolocalização:", error);
          alert("Por favor, habilite a localização nas configurações do seu navegador.");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleNotificationClick = (n: VantaNotification) => {
    setShowNotifications(false);
    if (n.type === 'message' && n.fromUserId) {
      setActiveTab('messages');
    } else if (n.type === 'friend_request' && n.fromUserId) {
      const user = MOCK_ALL_USERS.find(u => u.id === n.fromUserId);
      if (user) setViewedUserProfile(user);
    } else if (n.eventId) {
      const ev = events.find(e => e.id === n.eventId);
      if (ev) setSelectedEvent(ev);
    } else if (n.target === 'profile') {
      setActiveTab('profile');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const eventsToday = useMemo(() => 
    events.filter(e => e.city === selectedCity && e.startDate === todayStr),
    [events, selectedCity, todayStr]
  );
  const upcomingEvents = useMemo(() => 
    events.filter(e => e.city === selectedCity && e.startDate !== todayStr),
    [events, selectedCity, todayStr]
  );

  const mapEvents = useMemo(() => 
    events.filter(e => e.startDate === selectedMapDate),
    [events, selectedMapDate]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    if (searchType === 'amigos') {
      return MOCK_ALL_USERS.filter(u => 
        u.id !== currentUser?.id && (
          u.fullName.toLowerCase().includes(query) || 
          u.username.toLowerCase().includes(query)
        )
      );
    } else {
      return events.filter(e => e.title.toLowerCase().includes(query));
    }
  }, [searchQuery, searchType, events, currentUser]);

  const handleAddFriend = (targetUser: User) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? {
      ...prev,
      friendRequestsSent: [...(prev.friendRequestsSent || []), targetUser.id]
    } : null);
    setShowFriendRequestSentPopup(true);
  };

  const handleSendMessage = (targetUser: User) => {
    setActiveTab('messages');
    setViewedUserProfile(null);
    let existingConv = conversations.find(c => c.participantId === targetUser.id);
    if (existingConv) {
      setActiveConversationId(existingConv.id);
    } else {
      const newConv: Conversation = {
        id: `c${Date.now()}`,
        participantId: targetUser.id,
        lastMessage: '',
        timestamp: Date.now(),
        unreadCount: 0,
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }
  };

  const quickDatesMap = useMemo(() => {
    const items = [];
    const numToPick = 4;
    for (let i = 0; i < numToPick - 1; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      items.push({
        iso,
        day: d.getDate(),
        label: i === 0 ? 'HOJE' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
        hasEvents: events.some(e => e.startDate === iso)
      });
    }
    return items;
  }, [events]);

  const handleEditGallery = (index: number, action: 'add' | 'remove') => {
    if (!currentUser) return;
    if (action === 'remove') {
      const newGallery = [...currentUser.gallery];
      newGallery.splice(index, 1);
      setCurrentUser({...currentUser, gallery: newGallery});
    } else {
      const url = prompt("Cole a URL da imagem:");
      if (!url) return;
      if (url.includes('obscene') || url.includes('nude') || url.includes('blood')) {
        alert("VANTA SAFETY: Esta imagem não é permitida.");
        return;
      }
      if (currentUser.gallery.length < 5) {
        setCurrentUser({...currentUser, gallery: [...currentUser.gallery, url]});
      }
    }
  };

  const handleDeleteProfile = () => {
    if (deletePassword === '1234') {
       alert("Sentimos muito em ver você partir.");
       setCurrentUser(null);
       setIsDeletingProfile(false);
       setLoginView('landing');
    } else {
       alert("Senha incorreta.");
    }
  };

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset: number) => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1));
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const total = daysInMonth(calendarMonth);
    const offset = startDayOfMonth(calendarMonth);
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= total; i++) {
      const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        iso,
        day: i,
        hasEvents: events.some(e => e.startDate === iso)
      });
    }
    return days;
  }, [calendarMonth, events]);

  // Função para abrir página de evento
  const openEventPage = (e: Event) => {
    setSelectedEvent(e);
    setEventViewMode('details');
  };

  // Função para alternar RSVP
  const handleToggleRSVP = (event: Event) => {
    if (!currentUser) return;
    const isConfirmed = currentUser.confirmedEventsIds.includes(event.id);
    if (isConfirmed) {
      setCurrentUser({
        ...currentUser,
        confirmedEventsIds: currentUser.confirmedEventsIds.filter(id => id !== event.id)
      });
    } else {
      setCurrentUser({
        ...currentUser,
        confirmedEventsIds: [...currentUser.confirmedEventsIds, event.id]
      });
    }
  };

  // Filtrar usuários para a lista de RSVP pública
  const rsvpPublicUsers = useMemo(() => {
    if (!selectedEvent) return [];
    // Busca todos os usuários que confirmaram esse evento e tem privacidade pública
    return MOCK_ALL_USERS.filter(u => 
      u.confirmedEventsIds.includes(selectedEvent.id) && u.privacy.confirmedEvents === 'todos'
    );
  }, [selectedEvent]);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-black z-[500] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 scale-110">
          <img src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1500" className="w-full h-full object-cover grayscale brightness-[0.2] animate-ken-burns" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black"></div>
        </div>
        {loginView === 'landing' && (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 animate-in fade-in duration-1000">
            <div className="text-center flex flex-col items-center">
              <h1 className="text-6xl font-serif font-bold text-white tracking-tight mb-3 italic">VANTA</h1>
              <p className="text-[#d4af37] text-[9px] font-black uppercase tracking-[0.7em] mb-1.5">estilo de vida é acesso.</p>
              <p className="text-[#C0C0C0] text-[8px] font-black uppercase tracking-[0.5em] opacity-60">voce merece o melhor</p>
            </div>
            <div className="absolute bottom-20 w-full max-w-[320px] px-6 space-y-3">
              <button onClick={() => setLoginView('form')} className="w-full py-5 bg-white text-black font-black rounded-full uppercase text-[10px] tracking-[0.4em] shadow-xl">Entrar</button>
              <button onClick={() => setLoginView('signup')} className="w-full py-5 bg-transparent border border-white/10 text-white font-black rounded-full uppercase text-[9px] tracking-[0.4em]">Solicitar Acesso</button>
            </div>
          </div>
        )}
        {loginView === 'form' && (
          <div className="relative z-10 w-full max-w-sm px-8 animate-in fade-in duration-500 flex flex-col items-center">
            <h1 className="text-5xl font-serif font-bold text-white tracking-tight mb-12 italic">VANTA</h1>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input required className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-6 text-white text-[10px] uppercase outline-none" placeholder="E-MAIL" type="email" />
              <input required className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-6 text-white text-[10px] uppercase outline-none" type="password" placeholder="SENHA" />
              <button disabled={isProcessing} type="submit" className="w-full py-6 bg-white text-black font-black rounded-full uppercase text-[11px] tracking-[0.4em] shadow-lg disabled:opacity-50 mt-4">Entrar</button>
            </form>
            <div className="mt-8">
              <button type="button" onClick={() => setLoginView('landing')} className="text-zinc-500 text-[8px] uppercase tracking-widest font-black">Voltar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isAdminMode) return <AdminDashboard events={events} setEvents={setEvents} onExit={() => setIsAdminMode(false)} />;

  const hasAdminPermission = [
    UserStatus.ADMIN, 
    UserStatus.VANTA_PROD, 
    UserStatus.VANTA_SOCIO, 
    UserStatus.VANTA_PROMOTER, 
    UserStatus.VANTA_PORTARIA
  ].includes(currentUser.status);

  return (
    <div className="h-full w-full flex flex-col bg-black relative selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* TABS CONTENT */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'home' && (
          <div className="h-full flex flex-col animate-in fade-in duration-500">
            <header className="px-6 pt-16 pb-8 flex justify-between items-center z-20 sticky top-0 bg-black/50 backdrop-blur-md safe-top">
              <button onClick={() => setActiveTab('profile')} className="w-10 h-10 rounded-full border border-[#d4af37]/40 p-0.5 overflow-hidden active:scale-90 transition-transform">
                <img src={currentUser.avatar} className="w-full h-full object-cover rounded-full" alt="Profile" />
              </button>
              <button onClick={() => setShowCitySelector(true)} className="flex flex-col items-center group">
                <span className="text-[7px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-1 italic">ESTOU EM</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white font-black uppercase tracking-[0.4em]">{selectedCity}</span>
                  <div className="w-2 h-2 border-r border-b border-zinc-600 rotate-45 mb-1"></div>
                </div>
              </button>
              <button onClick={() => setShowNotifications(true)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative active:scale-90 transition-transform">
                <ICONS.Bell className="w-5 h-5 text-white" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
              <section className="px-6 mb-12">
                <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-6 italic">VANTA INDICA</h2>
                <div className="relative aspect-[16/10] w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900/20">
                  {vantaIndicaEvents.map((e, idx) => (
                    <div key={e.id} onClick={() => openEventPage(e)} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentIndicaIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                      <img src={e.image} className="w-full h-full object-cover" alt={e.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                      <div className="absolute bottom-10 left-10 right-10">
                        <p className="text-[7px] text-[#d4af37] font-black uppercase tracking-[0.4em] mb-2">CURADORIA EXCLUSIVA</p>
                        <h3 className="text-4xl font-serif italic text-white leading-none tracking-tighter">{e.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {eventsToday.length > 0 && (
                <section className="px-6 mb-12 animate-in slide-in-from-left">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> HOJE EM {selectedCity.toUpperCase()}
                  </h2>
                  <div className="space-y-4">
                    {eventsToday.map(e => (
                      <div key={e.id} onClick={() => openEventPage(e)} className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] flex items-center gap-6 group cursor-pointer shadow-xl">
                        <img src={e.image} className="w-20 h-20 rounded-3xl object-cover" alt={e.title} />
                        <div className="flex-1">
                          <p className="text-[8px] text-emerald-400 font-black uppercase mb-1">ACONTECENDO AGORA</p>
                          <h4 className="text-2xl font-serif italic text-white tracking-tighter">{e.title}</h4>
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">{e.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="px-6 space-y-10">
                <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] italic">PRÓXIMOS</h2>
                <div className="space-y-5">
                  {upcomingEvents.map(e => (
                    <div key={e.id} onClick={() => openEventPage(e)} className="p-6 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] flex items-center gap-6 group cursor-pointer">
                      <img src={e.image} className="w-16 h-16 rounded-2xl object-cover" alt={e.title} />
                      <div className="flex-1">
                        <p className="text-[8px] text-[#d4af37] font-black uppercase mb-1">{e.startDate}</p>
                        <h4 className="text-xl font-serif italic text-white tracking-tighter">{e.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-full relative bg-[#050505] flex flex-col overflow-hidden">
            {!mapPermissionRequested ? (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-10 bg-black/95 backdrop-blur-3xl">
                <div className="text-center space-y-12 max-w-sm">
                  <ICONS.MapPin className="w-10 h-10 text-[#d4af37] mx-auto" />
                  <h3 className="text-4xl font-serif italic text-white">Eventos próximos</h3>
                  <button onClick={requestGeolocation} className="w-full py-8 bg-white text-black font-black rounded-full uppercase text-[12px] tracking-[0.6em] shadow-2xl active:scale-95 transition-all">Autorizar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 relative overflow-hidden bg-[#070707]">
                  {userLocation && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                      <div className="w-20 h-20 rounded-full border-4 border-[#d4af37] p-1 shadow-[0_0_50px_rgba(212,175,55,0.4)] bg-black overflow-hidden relative">
                        <img src={currentUser.avatar} className="w-full h-full object-cover rounded-full" alt="Me" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 z-20">
                    {mapEvents.map((e, idx) => (
                      <div key={e.id} onClick={() => openEventPage(e)} className="absolute cursor-pointer animate-in zoom-in" style={{ top: `${30 + (idx * 20)}%`, left: `${20 + (idx * 40)}%` }}>
                        <div className="w-20 h-20 p-1.5 bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                          <img src={e.image} className="w-full h-full object-cover rounded-[1.5rem]" alt={e.title} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-20 left-4 right-4 z-40">
                    <div className="flex gap-2 w-full justify-center">
                      {quickDatesMap.map((item) => (
                        <button key={item.iso} onClick={() => setSelectedMapDate(item.iso)} className={`flex-1 aspect-square max-w-[80px] rounded-2xl flex flex-col items-center justify-center transition-all border ${selectedMapDate === item.iso ? 'bg-white text-black border-white shadow-lg' : 'bg-black/60 border-white/5 text-zinc-500'}`}>
                          <span className="text-[6px] font-black uppercase tracking-widest">{item.label}</span>
                          <span className="text-lg font-serif italic font-bold">{item.day}</span>
                        </button>
                      ))}
                      <button onClick={() => setShowFullCalendar(true)} className="flex-1 aspect-square max-w-[80px] rounded-2xl bg-black/60 border border-white/5 text-zinc-500 flex flex-col items-center justify-center tracking-widest text-[6px] font-black uppercase">VER MAIS</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* BUSCAR */}
        {activeTab === 'search' && (
          <div className="h-full flex flex-col bg-black p-10 pt-20 safe-top">
             <h1 className="text-5xl font-serif italic text-[#d4af37] tracking-tighter mb-8">Buscar</h1>
             <div className="flex gap-4 mb-8">
               <button onClick={() => setSearchType('eventos')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl border ${searchType === 'eventos' ? 'bg-white text-black' : 'border-white/5'}`}>Eventos</button>
               <button onClick={() => setSearchType('amigos')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl border ${searchType === 'amigos' ? 'bg-white text-black' : 'border-white/5'}`}>Amigos</button>
             </div>
             <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="BUSCAR..." className="w-full bg-zinc-900/40 border border-white/5 rounded-full p-6 text-[10px] text-white outline-none" />
             <div className="mt-8 space-y-4 overflow-y-auto no-scrollbar flex-1 pb-40">
                {searchResults.map((u: any) => (
                  <div key={u.id} onClick={() => searchType === 'amigos' ? setViewedUserProfile(u) : openEventPage(u)} className="p-4 bg-zinc-900/20 border border-white/5 rounded-3xl flex items-center gap-4 cursor-pointer">
                    <img src={u.avatar || u.image} className="w-12 h-12 rounded-full object-cover" alt="Result" />
                    <div><h4 className="text-lg font-serif italic text-white">{u.fullName || u.title}</h4></div>
                  </div>
                ))}
             </div>
          </div>
        )}
        
        {activeTab === 'messages' && (
          <Messages currentUser={currentUser} allUsers={MOCK_ALL_USERS} conversations={conversations} setConversations={setConversations} activeConversationId={activeConversationId} setActiveConversationId={setActiveConversationId} onUserClick={setViewedUserProfile} />
        )}

        {activeTab === 'profile' && (
           <div className="h-full flex flex-col items-center p-8 pt-32 pb-40 overflow-y-auto no-scrollbar safe-top">
              <div className={`w-32 h-32 rounded-full p-1 mb-10 ${currentUser.isVantaPlus ? 'border-2 border-[#d4af37]' : 'border border-white/10'}`}>
                <img src={currentUser.avatar} className="w-full h-full object-cover rounded-full" alt="Me" />
              </div>
              <div className="text-center space-y-2 mb-12">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-5xl font-serif italic text-white tracking-tighter">{currentUser.fullName}</h2>
                  {currentUser.isVantaPlus && <ICONS.Star className="w-5 h-5 text-[#d4af37]" />}
                </div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em]">@{currentUser.username}</p>
              </div>
              {currentUser.bio && <p className="text-[11px] text-zinc-400 italic text-center max-w-xs mb-10 px-4 uppercase tracking-wider">{currentUser.bio}</p>}
              {currentUser.gallery.length > 0 && (
                <div className="w-full grid grid-cols-2 gap-2 mb-12 px-4">
                  {currentUser.gallery.map((img, idx) => <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-2xl"><img src={img} className="w-full h-full object-cover" alt="Gallery" /></div>)}
                </div>
              )}
              
              <div className="w-full max-w-xs space-y-4">
                {hasAdminPermission && (
                  <button 
                    onClick={() => setIsAdminMode(true)} 
                    className="w-full py-5 bg-[#d4af37] text-black text-[10px] font-black uppercase rounded-full tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 transition-all"
                  >
                    Painel Administrativo
                  </button>
                )}
                <button 
                  onClick={() => setIsEditingProfile(true)} 
                  className="w-full py-5 bg-white text-black text-[10px] font-black uppercase rounded-full tracking-widest hover:bg-[#d4af37] transition-all"
                >
                  Editar Perfil
                </button>
              </div>
           </div>
        )}
      </main>

      {/* PÁGINA DE EVENTO DETALHADA */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[700] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          {eventViewMode === 'details' && (
            <>
              {/* Header Imagem */}
              <div className="relative h-[45vh] flex-shrink-0">
                <img src={selectedEvent.image} className="w-full h-full object-cover" alt={selectedEvent.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                <button onClick={() => setSelectedEvent(null)} className="absolute top-14 left-8 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white"><ICONS.ArrowLeft className="w-5 h-5" /></button>
              </div>

              {/* Informações */}
              <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar pb-40">
                <div className="space-y-4">
                  <div 
                    onClick={() => {
                      const comm = MOCK_COMMUNITIES.find(c => c.id === selectedEvent.communityId);
                      if (comm) { setSelectedCommunity(comm); setEventViewMode('community'); }
                    }}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <span className="text-[9px] text-[#d4af37] font-black uppercase tracking-[0.4em] group-hover:underline italic">
                      {selectedEvent.location}
                    </span>
                    <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                      Signed by {MOCK_ALL_USERS.find(u => u.id === selectedEvent.creatorId)?.fullName}
                    </span>
                  </div>
                  <h2 className="text-5xl font-serif text-white italic tracking-tighter leading-tight">{selectedEvent.title}</h2>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest mb-1">DATA</span>
                      <span className="text-[10px] text-zinc-300 font-black uppercase">{new Date(selectedEvent.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
                    </div>
                    <div className="w-px h-6 bg-white/5"></div>
                    <div className="flex flex-col">
                      <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest mb-1">TIME</span>
                      <span className="text-[10px] text-zinc-300 font-black uppercase">{selectedEvent.startTime} — {selectedEvent.endTime}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-zinc-400 leading-relaxed uppercase tracking-wider">{selectedEvent.description}</p>

                {/* RSVP Community Section */}
                <div className="space-y-4">
                  <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">CONFIRMADOS ({selectedEvent.rsvps})</h3>
                  <div className="flex items-center gap-4">
                    <div onClick={() => setShowRSVPList(true)} className="flex -space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                      {rsvpPublicUsers.slice(0, 4).map((u, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                          <img src={u.avatar} className="w-full h-full object-cover" alt="Guest" />
                        </div>
                      ))}
                      {selectedEvent.rsvps > 4 && (
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white">
                          +{selectedEvent.rsvps - 4}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleToggleRSVP(selectedEvent)}
                      className={`px-6 py-3 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                        currentUser.confirmedEventsIds.includes(selectedEvent.id) 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-white/5 border border-white/10 text-white'
                      }`}
                    >
                      {currentUser.confirmedEventsIds.includes(selectedEvent.id) ? 'PRESENÇA CONFIRMADA' : 'CONFIRMAR PRESENÇA'}
                    </button>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-4 pt-4">
                  <button 
                    onClick={() => setEventViewMode('tickets')}
                    className="w-full py-6 bg-white text-black font-black rounded-full uppercase text-[11px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
                  >
                    Comprar Ingressos
                  </button>
                  {selectedEvent.isListEnabled && (
                    <button className="w-full py-6 bg-transparent border border-white/10 text-white font-black rounded-full uppercase text-[9px] tracking-[0.4em]">
                      Nome na Lista
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {eventViewMode === 'tickets' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
              <header className="p-8 border-b border-white/5 flex items-center gap-4 safe-top">
                <button onClick={() => setEventViewMode('details')} className="text-zinc-500"><ICONS.ArrowLeft className="w-6 h-6" /></button>
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Ingressos</h2>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar pb-40">
                <div className="flex gap-6 items-center">
                  <img src={selectedEvent.image} className="w-24 h-24 rounded-[2rem] object-cover" alt="Event thumb" />
                  <div>
                    <h3 className="text-2xl font-serif italic text-white leading-tight">{selectedEvent.title}</h3>
                    <p className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest mt-1">{selectedEvent.location}</p>
                  </div>
                </div>

                {/* Lotes de Ingressos */}
                <div className="space-y-10">
                  {selectedEvent.batches.map((batch: TicketBatch, bIdx: number) => {
                    const isSoldOut = batch.soldCount >= batch.limit;
                    return (
                      <div key={batch.id} className={`space-y-6 ${isSoldOut ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                        <div className="flex justify-between items-end border-b border-white/5 pb-3">
                          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.5em]">{batch.name.toUpperCase()}</h4>
                          {isSoldOut && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Lote Encerrado</span>}
                        </div>
                        <div className="space-y-4">
                          {batch.variations.map((v, vIdx) => (
                            <div key={v.id} className="p-6 bg-zinc-900/40 border border-white/5 rounded-[2rem] flex justify-between items-center group active:scale-[0.98] transition-all">
                              <div>
                                <p className="text-[12px] font-serif italic text-white tracking-tighter">{v.gender} — {v.area}</p>
                                <p className="text-[10px] text-zinc-500 font-black mt-1">R$ {v.price},00</p>
                              </div>
                              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-700 group-hover:bg-white group-hover:text-black transition-all">
                                <ICONS.Plus className="w-4 h-4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {eventViewMode === 'community' && selectedCommunity && (
            <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300 overflow-hidden">
               <header className="relative h-[35vh] flex-shrink-0">
                  <img src={selectedCommunity.image} className="w-full h-full object-cover grayscale" alt="Community" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-black/20"></div>
                  <button onClick={() => setEventViewMode('details')} className="absolute top-14 left-8 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white"><ICONS.ArrowLeft className="w-5 h-5" /></button>
                  <div className="absolute bottom-10 left-10">
                    <h2 className="text-4xl font-serif italic text-white tracking-tighter">{selectedCommunity.name}</h2>
                    <p className="text-[9px] text-[#d4af37] font-black uppercase tracking-[0.4em] mt-1 italic">CURADORIA VANTA</p>
                  </div>
               </header>
               <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar pb-40">
                 <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-widest italic">{selectedCommunity.description}</p>
                 <div className="space-y-6">
                    <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">SESSÕES DISPONÍVEIS</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {events.filter(e => selectedCommunity.eventIds.includes(e.id)).map(e => (
                        <div key={e.id} onClick={() => openEventPage(e)} className="p-4 bg-zinc-900/20 border border-white/5 rounded-3xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all">
                          <img src={e.image} className="w-14 h-14 rounded-2xl object-cover" alt="Ev" />
                          <div>
                            <h4 className="text-[14px] font-serif italic text-white">{e.title}</h4>
                            <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-0.5">{e.startDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Pop-up de Lista de RSVP (Confirmados) */}
      {showRSVPList && (
        <div className="fixed inset-0 z-[1400] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
          <header className="px-8 pt-16 pb-8 flex justify-between items-center border-b border-white/5 safe-top">
             <button onClick={() => setShowRSVPList(false)} className="text-zinc-500"><ICONS.ArrowLeft className="w-6 h-6" /></button>
             <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Confirmados</h2>
             <div className="w-6"></div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-40">
             {rsvpPublicUsers.map(user => (
               <div 
                key={user.id} 
                onClick={() => { setViewedUserProfile(user); setShowRSVPList(false); }}
                className="p-5 bg-zinc-900/30 border border-white/5 rounded-3xl flex items-center gap-4 active:scale-95 transition-all cursor-pointer"
              >
                 <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt="User" />
                 <div>
                   <h4 className="text-[12px] font-serif italic text-white">{user.fullName}</h4>
                   <p className="text-[8px] text-[#d4af37] font-black uppercase tracking-widest">{user.level}</p>
                 </div>
               </div>
             ))}
             {rsvpPublicUsers.length === 0 && (
               <div className="h-40 flex items-center justify-center text-zinc-700 uppercase font-black text-[9px] tracking-widest italic">Nenhum perfil público confirmado.</div>
             )}
          </div>
          <div className="p-10 safe-bottom">
            <button onClick={() => setShowRSVPList(false)} className="w-full py-6 bg-zinc-900 text-white font-black rounded-full uppercase text-[10px] tracking-widest border border-white/5">Fechar Lista</button>
          </div>
        </div>
      )}

      {/* Main Nav */}
      <nav className="h-28 glass border-t border-white/5 flex justify-around items-center px-6 safe-bottom z-[150] fixed bottom-0 left-0 right-0">
        {[
          { id: 'home', label: 'Início', icon: ICONS.Home },
          { id: 'map', label: 'Mapa', icon: ICONS.MapPin },
          { id: 'search', label: 'Buscar', icon: ICONS.Search },
          { id: 'messages', label: 'Mensagens', icon: ICONS.Message },
          { id: 'profile', label: 'Perfil', icon: ICONS.User }
        ].map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id as any); setViewedUserProfile(null); setSelectedEvent(null); }} className={`flex flex-col items-center justify-center gap-2 flex-1 h-full transition-all duration-300 ${activeTab === item.id ? 'text-white' : 'text-zinc-700'}`}>
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-[#d4af37]' : ''}`} />
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${activeTab === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* City Selector Modal */}
      {showCitySelector && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xs space-y-6">
            <h3 className="text-center text-[10px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-8 italic">Mudar Localidade</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              {availableCities.map(city => (
                <button key={city} onClick={() => { setSelectedCity(city); setShowCitySelector(false); }} className={`w-full p-6 rounded-3xl text-[11px] font-black uppercase transition-all ${selectedCity === city ? 'bg-white text-black' : 'bg-white/5 text-white border border-white/5'}`}>{city}</button>
              ))}
            </div>
            <button onClick={() => setShowCitySelector(false)} className="w-full text-[8px] font-black text-zinc-600 uppercase tracking-[0.5em] pt-4">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
