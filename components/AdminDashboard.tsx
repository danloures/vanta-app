
import React, { useState } from 'react';
import { ICONS, BRAZIL_STATES } from '../constants';
import { Event, TicketBatch, TicketVariation, StaffMember, GuestListRule, PromoterLimit } from '../types';

interface AdminDashboardProps {
  events: Event[];
  setEvents: (events: Event[]) => void;
  onExit: () => void;
}

type AdminMenu = 
  | 'DASHBOARD' | 'INTELLIGENCE' | 'CURADORIA' 
  | 'EVENTOS' | 'NOVO EVENTO' | 'CHECK-IN' | 'SCANNER QR' | 'LISTAS/RSVP'
  | 'VENDAS' | 'FLUXO DE CAIXA' | 'RELATÓRIOS'
  | 'HUBS' | 'BASE MEMBROS'
  | 'WHITE LABEL' | 'SISTEMA';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ events, setEvents, onExit }) => {
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // MOCK OPERATOR / PERMISSIONS
  const LOCKED_LOCATION = "BOSQUE BAR, JOCKEY CLUB";

  // FORM STATE
  const getInitialVariation = (): TicketVariation => ({
    id: Math.random().toString(36).substr(2, 9),
    area: 'Pista',
    gender: 'Unisex',
    price: 0
  });

  const getInitialBatch = (id: string, name: string): TicketBatch => ({
    id,
    name,
    limit: 100,
    soldCount: 0,
    validUntil: '',
    variations: [getInitialVariation()]
  });

  const [formEvent, setFormEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    image: '',
    state: '',
    city: '',
    location: LOCKED_LOCATION,
    startDate: '',
    startTime: '',
    endTime: '',
    isListEnabled: false,
    guestListRules: [],
    batches: [getInitialBatch('b1', 'Lote 1')],
    staff: []
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEvent.image || !formEvent.title || !formEvent.startDate || !formEvent.startTime || !formEvent.endTime) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const newEvent: Event = {
      ...formEvent,
      id: formEvent.id || `e${Date.now()}`,
      rsvps: 0,
      guests: [],
      capacity: formEvent.batches?.reduce((acc, b) => acc + b.limit, 0) || 0,
      communityId: 'c1', 
      creatorId: 'vanta_master'
    } as Event;

    setEvents([newEvent, ...events]);
    alert("Protocolo VANTA: Sessão publicada com sucesso.");
    setActiveMenu('EVENTOS');
  };

  const addBatch = () => {
    const nextId = (formEvent.batches?.length || 0) + 1;
    setFormEvent({
      ...formEvent,
      batches: [...(formEvent.batches || []), getInitialBatch(`b${nextId}`, `Lote ${nextId}`)]
    });
  };

  const addVariation = (batchIndex: number) => {
    const newBatches = [...(formEvent.batches || [])];
    newBatches[batchIndex].variations.push(getInitialVariation());
    setFormEvent({ ...formEvent, batches: newBatches });
  };

  const updateVariation = (batchIndex: number, varIndex: number, field: keyof TicketVariation, value: any) => {
    const newBatches = [...(formEvent.batches || [])];
    newBatches[batchIndex].variations[varIndex] = { ...newBatches[batchIndex].variations[varIndex], [field]: value };
    setFormEvent({ ...formEvent, batches: newBatches });
  };

  const addGuestRule = () => {
    const newRule: GuestListRule = {
      id: `r${Date.now()}`,
      area: 'Pista',
      gender: 'Unisex',
      type: 'VIP',
      value: 0
    };
    setFormEvent({
      ...formEvent,
      isListEnabled: true,
      guestListRules: [...(formEvent.guestListRules || []), newRule]
    });
  };

  const addStaff = () => {
    const newStaff: StaffMember = {
      id: `s${Date.now()}`,
      email: '',
      role: 'PROMOTER',
      promoterLimits: []
    };
    setFormEvent({
      ...formEvent,
      staff: [...(formEvent.staff || []), newStaff]
    });
  };

  const updateStaffPromoterLimit = (staffIndex: number, ruleId: string, limit: number) => {
    const newStaff = [...(formEvent.staff || [])];
    const limits = [...(newStaff[staffIndex].promoterLimits || [])];
    const existingIndex = limits.findIndex(l => l.ruleId === ruleId);
    
    if (existingIndex > -1) {
      limits[existingIndex] = { ...limits[existingIndex], limit };
    } else {
      limits.push({ ruleId, limit });
    }
    
    newStaff[staffIndex] = { ...newStaff[staffIndex], promoterLimits: limits };
    setFormEvent({ ...formEvent, staff: newStaff });
  };

  const renderNewEventForm = () => {
    const currentState = BRAZIL_STATES.find(s => s.sigla === formEvent.state);

    return (
      <form onSubmit={handlePublish} className="animate-in slide-in-from-bottom duration-500 space-y-16 max-w-5xl pb-40">
        <h2 className="text-5xl font-serif italic tracking-tighter text-[#d4af37] uppercase">CRIAR NOVO EVENTO</h2>

        <section className="bg-zinc-900/20 p-10 rounded-[3rem] border border-white/5 space-y-10">
          <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] border-b border-white/5 pb-4">01. Informações Importantes</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-4">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Foto do Evento (640x640)</label>
              <div 
                onClick={() => { const url = prompt("URL da foto (Quadrada 640x640):"); if(url) setFormEvent({...formEvent, image: url}); }}
                className="aspect-square bg-zinc-900 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all"
              >
                {formEvent.image ? (
                  <img src={formEvent.image} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <ICONS.Plus className="w-6 h-6 text-zinc-700 mb-2" />
                    <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">UPLOAD 640x640</span>
                  </>
                )}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Nome do Evento</label>
                <input required value={formEvent.title} onChange={e => setFormEvent({...formEvent, title: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[11px] text-white uppercase outline-none focus:border-white/20" placeholder="EX: VANTA MANSION" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Descrição do Evento</label>
                <textarea required value={formEvent.description} onChange={e => setFormEvent({...formEvent, description: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-3xl p-6 text-[11px] text-white uppercase outline-none focus:border-white/20 h-40 resize-none leading-relaxed" placeholder="DETALHES DA SESSÃO..." />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-900/20 p-10 rounded-[3rem] border border-white/5 space-y-10">
          <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] border-b border-white/5 pb-4">02. Local, Data e Hora</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Estado</label>
              <select required value={formEvent.state} onChange={e => setFormEvent({...formEvent, state: e.target.value, city: ''})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[10px] text-white uppercase outline-none appearance-none">
                <option value="">Selecione</option>
                {BRAZIL_STATES.map(s => <option key={s.sigla} value={s.sigla}>{s.nome}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Cidade</label>
              <select required disabled={!formEvent.state} value={formEvent.city} onChange={e => setFormEvent({...formEvent, city: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[10px] text-white uppercase outline-none appearance-none disabled:opacity-20">
                <option value="">Selecione</option>
                {currentState?.cidades.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Local (Travado)</label>
              <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest">{LOCKED_LOCATION}</div>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Data de Início</label>
              <input required type="date" value={formEvent.startDate} onChange={e => setFormEvent({...formEvent, startDate: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[10px] text-white outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Hora de Início</label>
              <input required type="time" value={formEvent.startTime} onChange={e => setFormEvent({...formEvent, startTime: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[10px] text-white outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Hora de Término</label>
              <input required type="time" value={formEvent.endTime} onChange={e => setFormEvent({...formEvent, endTime: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[10px] text-white outline-none" />
            </div>
          </div>
        </section>

        <section className="bg-zinc-900/20 p-10 rounded-[3rem] border border-white/5 space-y-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">03. Engenharia de Lotes</h3>
            <button type="button" onClick={addBatch} className="text-[8px] font-black text-[#d4af37] uppercase tracking-widest border border-[#d4af37]/20 px-4 py-2 rounded-full hover:bg-[#d4af37] hover:text-black transition-all">+ Adicionar Lote</button>
          </div>
          <div className="space-y-12">
            {formEvent.batches?.map((batch, bIdx) => (
              <div key={batch.id} className="p-8 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-2">Nome do Lote</label>
                    <input value={batch.name} readOnly className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-[10px] text-white font-black uppercase outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-2">Limite (Convites)</label>
                    <input type="number" value={batch.limit} onChange={e => {
                      const nb = [...(formEvent.batches || [])];
                      nb[bIdx].limit = parseInt(e.target.value) || 0;
                      setFormEvent({...formEvent, batches: nb});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-[10px] text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-zinc-600 uppercase tracking-widest ml-2">Válido Até</label>
                    <input type="date" value={batch.validUntil} onChange={e => {
                      const nb = [...(formEvent.batches || [])];
                      nb[bIdx].validUntil = e.target.value;
                      setFormEvent({...formEvent, batches: nb});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-[10px] text-white outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Variações</span>
                    <button type="button" onClick={() => addVariation(bIdx)} className="text-[7px] font-black text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10">+ Variar</button>
                  </div>
                  <div className="space-y-3">
                    {batch.variations.map((v, vIdx) => (
                      <div key={v.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/30 p-4 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                          <label className="text-[6px] font-black text-zinc-700 uppercase tracking-widest">Área</label>
                          <select value={v.area} onChange={e => updateVariation(bIdx, vIdx, 'area', e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-[9px] text-white uppercase outline-none">
                            <option value="Pista">Pista</option>
                            <option value="VIP">VIP</option>
                            <option value="Camarote">Camarote</option>
                            <option value="Outro">Outro</option>
                          </select>
                          {v.area === 'Outro' && (
                            <input value={v.customArea || ''} onChange={e => updateVariation(bIdx, vIdx, 'customArea', e.target.value)} placeholder="Defina a área..." className="w-full mt-2 bg-zinc-800 border border-white/5 rounded-lg p-3 text-[9px] text-white uppercase" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[6px] font-black text-zinc-700 uppercase tracking-widest">Gênero</label>
                          <select value={v.gender} onChange={e => updateVariation(bIdx, vIdx, 'gender', e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-[9px] text-white uppercase outline-none">
                            <option value="Unisex">Unisex</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[6px] font-black text-zinc-700 uppercase tracking-widest">Valor (R$)</label>
                          <input type="number" step="0.01" value={v.price} onChange={e => updateVariation(bIdx, vIdx, 'price', parseFloat(e.target.value) || 0)} className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-[9px] text-white outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-zinc-900/20 p-10 rounded-[3rem] border border-white/5 space-y-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">04. Listas</h3>
            <button type="button" onClick={addGuestRule} className={`text-[8px] font-black uppercase tracking-widest px-6 py-2 rounded-full transition-all ${formEvent.isListEnabled ? 'bg-emerald-500 text-black' : 'border border-white/10 text-white hover:bg-white/5'}`}>
              {formEvent.isListEnabled ? 'Listas Ativas' : 'Liberar Listas'}
            </button>
          </div>
          {formEvent.isListEnabled && (
            <div className="space-y-4">
              {formEvent.guestListRules?.map((rule, idx) => (
                <div key={rule.id} className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/40 p-6 rounded-3xl border border-white/5 items-end">
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-zinc-700 uppercase tracking-widest ml-2">Área</label>
                    <input value={rule.area} onChange={e => {
                      const nr = [...(formEvent.guestListRules || [])];
                      nr[idx].area = e.target.value;
                      setFormEvent({...formEvent, guestListRules: nr});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-[10px] text-white uppercase" placeholder="EX: VIP" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-zinc-700 uppercase tracking-widest ml-2">Gênero</label>
                    <select value={rule.gender} onChange={e => {
                      const nr = [...(formEvent.guestListRules || [])];
                      nr[idx].gender = e.target.value as any;
                      setFormEvent({...formEvent, guestListRules: nr});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-[10px] text-white uppercase outline-none">
                      <option value="Unisex">Unisex</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-zinc-700 uppercase tracking-widest ml-2">Tipo</label>
                    <select value={rule.type} onChange={e => {
                      const nr = [...(formEvent.guestListRules || [])];
                      nr[idx].type = e.target.value as any;
                      setFormEvent({...formEvent, guestListRules: nr});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-[10px] text-white uppercase outline-none">
                      <option value="VIP">VIP</option>
                      <option value="CONSUMO">CONSUMO</option>
                      <option value="ENTRADA">ENTRADA</option>
                      <option value="MEIA">MEIA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] font-black text-zinc-700 uppercase tracking-widest ml-2">Valor (R$)</label>
                    <input type="number" step="0.01" value={rule.value} onChange={e => {
                      const nr = [...(formEvent.guestListRules || [])];
                      nr[idx].value = parseFloat(e.target.value) || 0;
                      setFormEvent({...formEvent, guestListRules: nr});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-[10px] text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-zinc-900/20 p-10 rounded-[3rem] border border-white/5 space-y-10">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">05. Staff</h3>
            <button type="button" onClick={addStaff} className="text-[8px] font-black text-[#d4af37] uppercase tracking-widest border border-[#d4af37]/20 px-4 py-2 rounded-full hover:bg-[#d4af37] hover:text-black transition-all">+ Adicionar Staff</button>
          </div>
          <div className="space-y-6">
            {formEvent.staff?.map((staff, sIdx) => (
              <div key={staff.id} className="p-8 bg-zinc-950/60 border border-white/5 rounded-[2.5rem] space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">E-mail Cadastrado</label>
                    <input type="email" value={staff.email} onChange={e => {
                      const ns = [...(formEvent.staff || [])];
                      ns[sIdx] = { ...ns[sIdx], email: e.target.value };
                      setFormEvent({...formEvent, staff: ns});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[11px] text-white outline-none" placeholder="EX: PROMOTER@VANTA.COM" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Cargo</label>
                    <select value={staff.role} onChange={e => {
                      const ns = [...(formEvent.staff || [])];
                      ns[sIdx] = { ...ns[sIdx], role: e.target.value as any };
                      setFormEvent({...formEvent, staff: ns});
                    }} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-[10px] text-white uppercase outline-none appearance-none">
                      <option value="PROMOTER">VANTA PROMOTER</option>
                      <option value="SOCIO">VANTA SÓCIO</option>
                      <option value="PORTARIA">VANTA PORTARIA</option>
                    </select>
                  </div>
                </div>

                {staff.role === 'PROMOTER' && formEvent.guestListRules?.length ? (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">LIMITES POR REGRA</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formEvent.guestListRules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{rule.area} ({rule.gender} - {rule.type})</span>
                          <input 
                            type="number" 
                            placeholder="QNT"
                            value={staff.promoterLimits?.find(l => l.ruleId === rule.id)?.limit || ''}
                            onChange={e => updateStaffPromoterLimit(sIdx, rule.id, parseInt(e.target.value) || 0)}
                            className="w-16 bg-zinc-900 border border-white/5 rounded-lg p-2 text-center text-[10px] text-white" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <button type="submit" className="w-full py-10 bg-[#d4af37] text-black font-black rounded-full uppercase text-[12px] tracking-[0.5em] shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:bg-yellow-500 active:scale-95 transition-all">Salvar e Publicar Evento</button>
      </form>
    );
  };

  const SidebarContent = () => {
    const sections = [
      { title: 'PERFORMANCE', items: [{ id: 'DASHBOARD', icon: '📊' }, { id: 'INTELLIGENCE', icon: '🧠' }, { id: 'CURADORIA', icon: '💎' }] },
      { title: 'OPERAÇÕES', items: [{ id: 'EVENTOS', icon: '📅' }, { id: 'NOVO EVENTO', icon: '➕' }, { id: 'CHECK-IN', icon: '🎟️' }, { id: 'SCANNER QR', icon: '📷' }, { id: 'LISTAS/RSVP', icon: '📝' }] },
      { title: 'FINANCEIRO', items: [{ id: 'VENDAS', icon: '📈' }, { id: 'FLUXO DE CAIXA', icon: '💰' }, { id: 'RELATÓRIOS', icon: '📋' }] },
      { title: 'COMUNIDADE', items: [{ id: 'HUBS', icon: '🏘️' }, { id: 'BASE MEMBROS', icon: '👤' }] },
      { title: 'CONFIGURAÇÕES', items: [{ id: 'WHITE LABEL', icon: '🏷️' }, { id: 'SISTEMA', icon: '⚙️' }] }
    ];

    return (
      <div className="flex flex-col h-full bg-[#07080a] border-r border-white/5 w-full shrink-0 overflow-y-auto no-scrollbar">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center font-serif italic font-bold text-white text-xl shadow-[0_0_20px_rgba(147,51,234,0.3)]">V</div>
            <div>
              <h1 className="text-xs font-black tracking-[0.3em] text-white">GE BACKSTAGE</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">SISTEMA ATIVO</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 py-6 space-y-8">
          {sections.map(section => (
            <div key={section.title} className="space-y-2">
              <h3 className="px-4 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { setActiveMenu(item.id as AdminMenu); setIsSidebarOpen(false); setSelectedEventId(null); }} 
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${activeMenu === item.id ? 'bg-zinc-900/80 text-white shadow-inner border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <span className={`text-sm transition-transform duration-300 ${activeMenu === item.id ? 'scale-110' : 'grayscale opacity-50 group-hover:grayscale-0'}`}>{item.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.id}</span>
                    {activeMenu === item.id && <div className="ml-auto w-1 h-1 bg-[#d4af37] rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 border-t border-white/5">
          <button onClick={onExit} className="w-full py-3 border border-red-900/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500/5 transition-all">Encerrar Terminal</button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#07080a] text-white flex overflow-hidden font-sans z-[600]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[700] bg-black/90 backdrop-blur-sm flex">
          <div className="w-72 h-full animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
          <div className="flex-1" onClick={() => setIsSidebarOpen(false)}></div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar bg-[#050505] relative">
        <header className="lg:hidden p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h2 className="text-[10px] font-black tracking-widest text-[#d4af37]">GE BACKSTAGE</h2>
          <div className="w-10"></div>
        </header>

        <div className="p-8 lg:p-16 max-w-7xl mx-auto min-h-full">
          {activeMenu === 'NOVO EVENTO' ? renderNewEventForm() : (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-8 border border-white/5">
                <span className="text-3xl opacity-20">🔒</span>
              </div>
              <h2 className="text-4xl font-serif italic text-white mb-2 uppercase">{activeMenu}</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.6em] text-zinc-600 max-w-xs mx-auto leading-relaxed">
                Módulo criptografado. Acesso restrito via terminal back-office.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
