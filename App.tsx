
import React, { useState, useMemo, useEffect } from 'react';
import { SCHEMA_ASTE, SCHEMA_OSPEDALE, getLevelsForSector } from './constants';
import { GameState, Level, DatabaseID, SectorID } from './types';
import SqlEditor from './components/SqlEditor';
import SchemaViewer from './components/SchemaViewer';
import { evaluateSqlCode } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'splash' | 'db_select' | 'sector_select' | 'world' | 'terminal'>('splash');
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [state, setState] = useState<GameState>({
    currentDatabase: null,
    currentSectorId: null,
    currentLevelId: null,
    completedLevels: {
      'aste_basi': [], 'aste_join': [], 'aste_analisi': [], 'aste_trigger': [],
      'ospedale_basi': [], 'ospedale_join': [], 'ospedale_analisi': [], 'ospedale_trigger': []
    },
    userCode: '',
    isEvaluating: false,
    feedback: null,
    isSuccess: null,
    charPos: { x: 50, y: 50 },
    isTraveling: false
  });

  const activeLevels = useMemo(() => {
    if (!state.currentDatabase || !state.currentSectorId) return [];
    const sectorNum = state.currentSectorId === 'basi' ? 1 : state.currentSectorId === 'join' ? 2 : state.currentSectorId === 'analisi' ? 3 : 4;
    return getLevelsForSector(sectorNum, state.currentDatabase);
  }, [state.currentDatabase, state.currentSectorId]);

  const activeSchema = state.currentDatabase === 'aste' ? SCHEMA_ASTE : SCHEMA_OSPEDALE;

  const selectDatabase = (db: DatabaseID) => {
    setState(prev => ({ ...prev, currentDatabase: db, isTraveling: true }));
    setTimeout(() => {
      setState(prev => ({ ...prev, isTraveling: false }));
      setView('sector_select');
    }, 1000);
  };

  const selectSector = (id: SectorID) => {
    setState(prev => ({ ...prev, isTraveling: true }));
    setTimeout(() => {
      setState(prev => ({ ...prev, currentSectorId: id, isTraveling: false, charPos: { x: 50, y: 50 } }));
      setView('world');
    }, 1000);
  };

  const enterLevel = (level: Level) => {
    setState(prev => ({ ...prev, charPos: { x: level.x, y: level.y } }));
    setTimeout(() => {
      setState(prev => ({ ...prev, currentLevelId: level.id, userCode: '', feedback: null, isSuccess: null }));
      setView('terminal');
      setShowTutorial(true);
    }, 500);
  };

  const handleRunCode = async () => {
    const currentLevel = activeLevels.find(l => l.id === state.currentLevelId);
    if (!currentLevel || !state.userCode.trim()) return;
    setState(prev => ({ ...prev, isEvaluating: true, feedback: null, isSuccess: null }));
    const schemaStr = activeSchema.map(t => `${t.name} (${t.columns.map(c => `${c.name} ${c.type}`).join(', ')})`).join('\n');
    try {
      const result = await evaluateSqlCode(currentLevel.prompt, currentLevel.type, state.userCode, schemaStr);
      if (result.success) {
        const key = `${state.currentDatabase}_${state.currentSectorId}`;
        setState(prev => ({
          ...prev, isEvaluating: false, isSuccess: true, feedback: result.feedback,
          completedLevels: { ...prev.completedLevels, [key]: Array.from(new Set([...prev.completedLevels[key], prev.currentLevelId!])) }
        }));
      } else {
        setState(prev => ({ ...prev, isEvaluating: false, isSuccess: false, feedback: result.feedback }));
      }
    } catch (e) {
      setState(prev => ({ ...prev, isEvaluating: false, feedback: "ERRORE CRITICO DI COMUNICAZIONE." }));
    }
  };

  const currentLevel = activeLevels.find(l => l.id === state.currentLevelId);

  const VisualExplanation = ({ level }: { level: Level }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const steps = level.steps;
    const currentStep = steps[stepIndex];

    const [typedCode, setTypedCode] = useState('');

    useEffect(() => {
      if (currentStep.type === 'code' && currentStep.code) {
        let i = 0;
        const interval = setInterval(() => {
          setTypedCode(currentStep.code!.slice(0, i));
          i++;
          if (i > currentStep.code!.length) clearInterval(interval);
        }, 30);
        return () => clearInterval(interval);
      } else {
        setTypedCode('');
      }
    }, [stepIndex, currentStep]);

    return (
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-12 border-4 border-blue-500/40 shadow-[0_0_100px_rgba(56,189,248,0.2)] max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
           <div>
              <h3 className="font-game text-2xl text-blue-400 italic uppercase">Guida Accademica</h3>
              <p className="text-[10px] font-game text-slate-500 tracking-[0.4em] uppercase">Step {stepIndex + 1} di {steps.length}</p>
           </div>
           <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${stepIndex === i ? 'bg-orange-400 w-8' : stepIndex > i ? 'bg-blue-400' : 'bg-slate-700'}`}></div>
              ))}
           </div>
        </div>

        <div className="min-h-[300px] flex flex-col justify-center">
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 key={stepIndex}">
              <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 rounded-lg font-game text-xs mb-6 tracking-widest uppercase font-black">{currentStep.label}</span>
              
              <div className="space-y-6">
                {currentStep.type === 'tables' && (
                  <div className="flex gap-4 justify-center mb-8">
                    {currentStep.highlightedTables?.map(t => (
                      <div key={t} className="px-6 py-4 bg-blue-500/10 border-2 border-blue-500/40 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.1)] flex items-center gap-3 animate-bounce">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z" /></svg>
                        <span className="font-game text-blue-300 text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                )}

                {currentStep.type === 'code' ? (
                  <div className="bg-black/80 p-8 rounded-3xl font-mono text-xl text-blue-300 border border-blue-500/30 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/40 animate-pulse"></div>
                     <pre className="whitespace-pre-wrap leading-relaxed">{typedCode}</pre>
                  </div>
                ) : (
                  <p className="text-2xl md:text-3xl text-blue-100 font-bold italic leading-snug drop-shadow-md">
                    {currentStep.content}
                  </p>
                )}
                
                {currentStep.type === 'logic' && (
                  <div className="mt-8 p-6 bg-slate-800/40 rounded-2xl border border-white/5 italic text-slate-400 text-lg flex items-start gap-4">
                    <span className="text-orange-400 text-2xl">💡</span>
                    <span>{currentStep.content}</span>
                  </div>
                )}
              </div>
           </div>
        </div>

        <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
           <button 
             disabled={stepIndex === 0}
             onClick={() => setStepIndex(s => s - 1)}
             className={`px-8 py-4 rounded-2xl font-game text-sm uppercase border border-white/10 transition-all ${stepIndex === 0 ? 'opacity-0' : 'hover:bg-white/5'}`}
           >
             Indietro
           </button>
           {stepIndex < steps.length - 1 ? (
             <button 
               onClick={() => setStepIndex(s => s + 1)}
               className="btn-gadget px-16 py-4 text-sm"
             >
               Prossimo Passaggio
             </button>
           ) : (
             <button 
               onClick={() => setShowTutorial(false)}
               className="btn-gadget px-16 py-4 text-sm bg-green-500 shadow-green-700"
             >
               Inizia la Sfida!
             </button>
           )}
        </div>
      </div>
    );
  };

  if (state.isTraveling) {
    return (
      <div className="h-screen flex items-center justify-center bg-black overflow-hidden relative">
         <div className="absolute inset-0 z-0 star-container">
            {[...Array(50)].map((_, i) => <div key={i} className="star-travel" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `0.4s` }}></div>)}
         </div>
         <div className="text-center z-10">
            <h2 className="text-3xl font-game text-white italic tracking-[0.8em] animate-pulse">WARP_DRIVE...</h2>
            <div className="h-1 w-64 bg-slate-800 mx-auto mt-6 rounded-full overflow-hidden">
               <div className="h-full bg-blue-400 animate-progress"></div>
            </div>
         </div>
      </div>
    );
  }

  if (view === 'splash') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
        <div className="max-w-2xl text-center z-10 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-8xl md:text-[10rem] font-game font-black text-white italic tracking-tighter mb-4 drop-shadow-[0_0_40px_rgba(56,189,248,0.5)]">CYBER SQL</h1>
          <p className="text-xl font-game text-orange-400 tracking-[0.6em] mb-20 uppercase opacity-90 font-bold">Galactic Academy v5.0</p>
          <button onClick={() => setView('db_select')} className="btn-gadget px-32 py-10 text-4xl shadow-[0_12px_0_#c2410c,0_30px_60px_rgba(251,146,60,0.3)]">BOOT SYSTEM</button>
        </div>
      </div>
    );
  }

  if (view === 'db_select') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] p-8">
        <h2 className="text-5xl font-game text-white italic mb-20 uppercase tracking-[0.1em] text-center drop-shadow-lg">SELEZIONA IL TARGET</h2>
        <div className="flex flex-col md:flex-row gap-16 max-w-6xl w-full">
          {[
            { id: 'aste', label: 'NETWORK ASTE', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', desc: 'Gestionale aste spaziali e oggetti rari di alto valore.' },
            { id: 'ospedale', label: 'CENTRO MEDICO', icon: 'M19 14l-7 7-7-7m14-8l-7 7-7-7', desc: 'Archivio clinico biotecnologico di Nuova Terra.' }
          ].map(db => (
            <button key={db.id} onClick={() => selectDatabase(db.id as DatabaseID)} className="flex-1 group">
              <div className="panel-metal h-[450px] p-16 flex flex-col items-center justify-center gap-10 group-hover:-translate-y-6 transition-all border-slate-700 bg-slate-900/40 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                <div className="w-28 h-28 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-all group-hover:scale-110 shadow-inner border-2 border-blue-500/20">
                  <svg className="w-14 h-14 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={db.icon} /></svg>
                </div>
                <div className="text-center">
                   <h3 className="text-4xl font-game text-white italic uppercase mb-4">{db.label}</h3>
                   <p className="text-sm text-slate-500 uppercase tracking-widest leading-relaxed opacity-80">{db.desc}</p>
                </div>
                <div className="bolt bolt-tl !w-4 !h-4"></div><div className="bolt bolt-br !w-4 !h-4"></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'sector_select') {
    return (
      <div className="h-screen flex flex-col p-12 bg-[#020617] overflow-y-auto">
        <header className="mb-20 flex justify-between items-center border-b border-white/5 pb-10">
           <button onClick={() => setView('db_select')} className="text-sm font-game text-slate-500 uppercase hover:text-white transition-colors tracking-widest flex items-center gap-4 group">
              <svg className="w-6 h-6 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              SISTEMI_CENTRO_CONTROLLO
           </button>
           <h2 className="text-5xl font-game text-white italic uppercase tracking-[0.2em] drop-shadow-md">DOMINIO: {state.currentDatabase?.toUpperCase()}</h2>
           <div className="w-32"></div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-[1400px] mx-auto w-full">
          {[
            { id: 'basi', label: 'MONDO 1: BASI', color: 'orange', desc: 'SELECT, WHERE, ORDER BY' },
            { id: 'join', label: 'MONDO 2: JOIN', color: 'blue', desc: 'RELAZIONI E PONTI DATI' },
            { id: 'analisi', label: 'MONDO 3: ANALISI', color: 'yellow', desc: 'STATISTICHE E AGGREGAZIONI' },
            { id: 'trigger', label: 'MONDO 4: TRIGGER', color: 'red', desc: 'AUTOMAZIONE PL/SQL' }
          ].map((s) => (
            <button key={s.id} onClick={() => selectSector(s.id as SectorID)} className="group">
              <div className="panel-metal h-96 p-12 flex flex-col items-center justify-center gap-10 group-hover:-translate-y-4 transition-transform border-slate-700 bg-slate-900/60 shadow-2xl relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-b from-${s.color}-500/5 to-transparent`}></div>
                <div className={`w-24 h-24 rounded-full border-4 border-${s.color}-500 flex items-center justify-center bg-black/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform`}>
                  <div className={`w-10 h-10 rounded-full bg-${s.color}-500 shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-pulse`}></div>
                </div>
                <div className="text-center relative z-10">
                   <h3 className="text-3xl font-game text-white uppercase tracking-tighter italic mb-4">{s.label}</h3>
                   <p className="text-[11px] text-slate-500 uppercase tracking-[0.4em] font-black leading-relaxed">{s.desc}</p>
                </div>
                <div className="bolt bolt-tr !w-3 !h-3"></div><div className="bolt bolt-bl !w-3 !h-3"></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'world') {
    return (
      <div className="h-screen flex flex-col bg-[#020617] relative overflow-hidden">
        <header className="p-10 flex justify-between items-center z-50">
          <button onClick={() => setView('sector_select')} className="btn-gadget px-12 py-4 text-sm tracking-widest shadow-[0_6px_0_#c2410c]">MAPPA SETTORI</button>
          <div className="panel-metal px-12 py-4 border-blue-500/20 shadow-[0_0_40px_rgba(56,189,248,0.2)]">
            <span className="font-game text-white text-sm tracking-[0.5em] italic uppercase">TARGET_NODES // {state.currentSectorId?.toUpperCase()}</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-16">
          <div className="relative w-full max-w-7xl aspect-[21/9] bg-blue-900/5 rounded-[5rem] border-4 border-white/5 shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
              {[...Array(72)].map((_, i) => <div key={i} className="border border-white/10"></div>)}
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              {activeLevels.map((lvl, i) => i > 0 && (
                <line key={i} x1={`${activeLevels[i-1].x}%`} y1={`${activeLevels[i-1].y}%`} x2={`${lvl.x}%`} y2={`${lvl.y}%`} stroke="#38bdf8" strokeWidth="3" strokeDasharray="12,12" />
              ))}
            </svg>
            <div className="absolute transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) z-20" style={{ left: `${state.charPos.x}%`, top: `${state.charPos.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="w-16 h-16 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.7)]">
                <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            {activeLevels.map((lvl, i) => {
              const key = `${state.currentDatabase}_${state.currentSectorId}`;
              const isDone = state.completedLevels[key]?.includes(lvl.id);
              return (
                <button 
                  key={lvl.id} 
                  onClick={() => enterLevel(lvl)}
                  className="absolute group transition-all duration-300 hover:scale-125"
                  style={{ left: `${lvl.x}%`, top: `${lvl.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-game text-xl ${isDone ? 'bg-green-500 border-green-200 text-white' : 'bg-slate-800 border-orange-500 text-orange-400'} shadow-2xl transition-all group-hover:scale-125`}>
                    {i + 1}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute top-full left-1/2 -translate-x-1/2 mt-5 bg-black/90 px-6 py-2 rounded-2xl text-[11px] font-game text-white whitespace-nowrap border border-white/10 uppercase tracking-widest shadow-2xl backdrop-blur-xl">{lvl.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#020617] p-8 overflow-hidden relative">
      {showTutorial && currentLevel && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-10 animate-in fade-in duration-500">
          <VisualExplanation level={currentLevel} />
        </div>
      )}

      <header className="h-20 flex justify-between items-center mb-8">
        <button onClick={() => setView('world')} className="btn-gadget px-12 py-4 text-xs tracking-widest">MAPPA NODI</button>
        <div className="hologram px-20 py-4 rounded-full border-blue-400/30 shadow-[0_0_50px_rgba(56,189,248,0.2)]">
          <span className="font-game text-blue-300 text-sm tracking-[0.6em] uppercase italic font-black">PROTOCOLLO_DECRIPT_ATTIVO</span>
        </div>
        <button onClick={() => setShowTutorial(true)} className="px-10 py-4 text-xs font-game text-slate-500 uppercase border border-white/10 rounded-2xl hover:bg-white/5 transition-all hover:text-white">GUIDA_LEVEL</button>
      </header>

      <main className="flex-1 flex gap-10 min-h-0 overflow-hidden">
        <aside className="w-[450px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-6">
           {/* OBIETTIVO MISSIONE - STILE PULITO E CARATTERE PIÙ PICCOLO PER CHIAREZZA */}
           <div className="panel-metal p-6 border-slate-700 bg-slate-900/95 shadow-2xl relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-orange-500/80 animate-pulse shadow-[0_0_10px_orange]"></div>
              <h3 className="font-game text-orange-400 text-[9px] mb-3 uppercase tracking-[0.4em] font-black border-b border-orange-500/10 pb-2">MISSION_OBJECTIVE</h3>
              <div className="max-h-[140px] overflow-y-auto custom-scrollbar">
                <p className="text-blue-100 text-sm md:text-base font-bold leading-relaxed tracking-wide">
                  {currentLevel?.prompt}
                </p>
              </div>
              <div className="bolt bolt-tr !w-2 !h-2"></div><div className="bolt bolt-bl !w-2 !h-2"></div>
           </div>
           {/* SCHEMA DATABASE */}
           <SchemaViewer schema={activeSchema} />
        </aside>

        <section className="flex-1 flex flex-col gap-8 min-h-0">
          <div className="flex-1 min-h-0">
             <SqlEditor 
               value={state.userCode}
               onChange={(val) => setState(prev => ({ ...prev, userCode: val }))}
               onRun={handleRunCode}
               disabled={state.isEvaluating}
               type={currentLevel?.type || ''}
             />
          </div>

          <div className={`h-64 panel-metal p-10 flex flex-col transition-all duration-500 ${state.isSuccess ? 'border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.3)]' : state.isSuccess === false ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.3)]' : 'border-slate-800'}`}>
             <div className="flex justify-between items-center mb-6">
                <span className="font-game text-slate-500 text-[11px] uppercase tracking-widest font-black italic">ANALISI_SATELLITARE</span>
                {state.isSuccess && (
                  <button onClick={() => setView('world')} className="btn-gadget px-16 py-4 text-sm bg-green-600 shadow-green-700 animate-pulse">SETTORE_VIOLATO</button>
                )}
             </div>
             <div className="flex-1 overflow-y-auto font-mono text-xl text-blue-100 italic bg-black/50 p-8 rounded-[3rem] border border-white/5 shadow-inner custom-scrollbar">
                {state.isEvaluating ? (
                  <div className="flex items-center justify-center h-full gap-10 opacity-60">
                     <div className="w-6 h-6 bg-orange-500 rounded-full animate-bounce shadow-[0_0_20px_#fb923c]"></div>
                     <div className="w-6 h-6 bg-orange-500 rounded-full animate-bounce delay-150 shadow-[0_0_20px_#fb923c]"></div>
                     <div className="w-6 h-6 bg-orange-500 rounded-full animate-bounce delay-300 shadow-[0_0_20px_#fb923c]"></div>
                  </div>
                ) : state.feedback ? (
                  <div className="animate-in fade-in slide-in-from-bottom-6">
                     <p className={`text-3xl font-game mb-4 italic tracking-tighter ${state.isSuccess ? 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
                        {state.isSuccess ? '>>> ACCESSO_ESEGUITO' : '>>> VIOLAZIONE_FALLITA'}
                     </p>
                     <p className="text-lg opacity-95 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 text-slate-200">{state.feedback}</p>
                  </div>
                ) : <div className="flex items-center justify-center h-full opacity-5 font-game text-6xl uppercase tracking-[1em] font-black italic">SLEEPING...</div>}
             </div>
             <div className="bolt bolt-tl !w-3 !h-3"></div><div className="bolt bolt-br !w-3 !h-3"></div>
          </div>
        </section>
      </main>
      <style>{`
        .star-travel { position: absolute; width: 3px; height: 3px; background: white; box-shadow: 0 0 15px white; animation: warp linear infinite; }
        @keyframes warp { 0% { transform: translateX(0) scaleX(1); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateX(180vw) scaleX(50); opacity: 0; } }
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress { animation: progress 1s linear forwards; }
      `}</style>
    </div>
  );
};

export default App;
