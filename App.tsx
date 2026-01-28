
import React, { useState, useEffect, useCallback } from 'react';
import { LEVELS } from './constants';
import { GameState, Level } from './types';
import SqlEditor from './components/SqlEditor';
import SchemaViewer from './components/SchemaViewer';
import { evaluateSqlCode, getHint } from './services/geminiService';

const GRID_SIZE = 10;
const TILE_SIZE = 75;

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [state, setState] = useState<GameState>({
    currentLevelId: null,
    completedLevels: [],
    userCode: '',
    isEvaluating: false,
    feedback: null,
    isSuccess: null,
    charPos: { x: 2, y: 1 },
    viewMode: 'world'
  });
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const enterLevel = useCallback((level: Level) => {
    const isUnlocked = level.id === 1 || state.completedLevels.includes(level.id - 1);
    if (!isUnlocked) return;

    setState(prev => ({ 
      ...prev, 
      charPos: { x: level.x, y: level.y },
      currentLevelId: level.id, 
      viewMode: 'terminal',
      userCode: '',
      feedback: null,
      isSuccess: null
    }));
    setHint(null);
  }, [state.completedLevels]);

  useEffect(() => {
    if (state.viewMode !== 'world' || !gameStarted) return;

    const handleKey = (e: KeyboardEvent) => {
      const { x, y } = state.charPos;
      let nx = x, ny = y;
      if (e.key === 'ArrowUp') ny = Math.max(0, y - 1);
      if (e.key === 'ArrowDown') ny = Math.min(GRID_SIZE - 1, y + 1);
      if (e.key === 'ArrowLeft') nx = Math.max(0, x - 1);
      if (e.key === 'ArrowRight') nx = Math.min(GRID_SIZE - 1, x + 1);

      if (nx !== x || ny !== y) {
        setState(prev => ({ ...prev, charPos: { x: nx, y: ny } }));
        const levelAtPos = LEVELS.find(l => l.x === nx && l.y === ny);
        if (levelAtPos) enterLevel(levelAtPos);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.charPos, state.viewMode, gameStarted, enterLevel]);

  const currentLevel = state.currentLevelId ? (LEVELS.find(l => l.id === state.currentLevelId) || LEVELS[0]) : null;

  const handleRunCode = async () => {
    if (!currentLevel || !state.userCode.trim()) return;
    setState(prev => ({ ...prev, isEvaluating: true, feedback: null, isSuccess: null }));
    
    const schemaStr = currentLevel.schema.map(t => 
      `${t.name} (${t.columns.map(c => `${c.name} ${c.type}`).join(', ')})`
    ).join('\n');

    try {
      const result = await evaluateSqlCode(
        currentLevel.prompt,
        currentLevel.type,
        state.userCode,
        schemaStr
      );

      setState(prev => ({
        ...prev,
        isEvaluating: false,
        isSuccess: result.success,
        feedback: result.feedback,
        completedLevels: result.success 
          ? Array.from(new Set([...prev.completedLevels, prev.currentLevelId!]))
          : prev.completedLevels
      }));
    } catch (e) {
      setState(prev => ({ ...prev, isEvaluating: false, feedback: "Errore di connessione." }));
    }
  };

  const handleGetHint = async () => {
    if (!currentLevel) return;
    setIsHintLoading(true);
    const schemaStr = currentLevel.schema.map(t => `${t.name} (${t.columns.map(c => c.name).join(', ')})`).join('\n');
    const tip = await getHint(currentLevel.prompt, currentLevel.type, schemaStr, state.userCode);
    setHint(tip);
    setIsHintLoading(false);
  };

  const handleBackToWorld = () => {
    setState(prev => ({ ...prev, viewMode: 'world', currentLevelId: null }));
  };

  if (!gameStarted) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="scanline"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        </div>

        <div className="z-10 text-center max-w-3xl animate-in fade-in zoom-in duration-1000">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-indigo-600 rounded-[2.5rem] md:rounded-[3rem] mx-auto flex items-center justify-center shadow-[0_0_100px_rgba(79,70,229,0.5)] mb-8 md:mb-12 border border-indigo-400/30 transform -rotate-12 hover:rotate-0 transition-transform duration-500 cursor-pointer group">
            <svg className="w-16 h-16 md:w-24 md:h-24 text-white transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15l-2 5L9 9l11 4-5 2zm0 0l4 4m-4-4l-4-4" />
            </svg>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter bg-gradient-to-br from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent italic leading-tight">
            SQL RPG QUEST
          </h1>
          <p className="text-slate-400 text-lg md:text-2xl mb-8 md:mb-12 leading-relaxed font-medium max-w-xl mx-auto">
            Esplora il mondo, hackera i terminali e diventa il Master dei Database.
          </p>
          <button 
            onClick={() => setGameStarted(true)}
            className="group relative px-10 py-4 md:px-16 md:py-6 bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] font-black text-white text-2xl md:text-4xl transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(79,70,229,0.4)] overflow-hidden"
          >
            <span className="relative z-10 uppercase tracking-[0.2em]">GIOCA ORA</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          </button>
        </div>
      </div>
    );
  }

  if (state.viewMode === 'world') {
    return (
      <div className="h-screen bg-slate-950 flex flex-col p-4 md:p-8 items-center justify-center relative overflow-hidden">
        <div className="scanline"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#111827_0%,_#020617_100%)]"></div>
        
        {/* Progress HUD */}
        <div className="fixed top-4 md:top-8 w-full max-w-6xl flex justify-between items-start z-50 px-6 md:px-10">
          <div className="flex flex-col gap-2 md:gap-4">
            <div className="flex flex-wrap gap-2">
              {[1,2,3,4].map(z => {
                const isZoneDone = state.completedLevels.length >= z*6;
                return (
                  <div key={z} className={`px-3 py-1 md:px-5 md:py-2 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black border transition-all ${isZoneDone ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    Z-{z} {isZoneDone ? 'OK' : 'LOC'}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] md:text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">Progression</span>
            <div className="text-xl md:text-3xl font-black text-white font-mono bg-black/40 px-4 py-2 md:px-8 md:py-3 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl">
              {Math.floor((state.completedLevels.length / LEVELS.length) * 100)}%
            </div>
          </div>
        </div>

        {/* Isometric Grid Container */}
        <div className="relative mt-12 md:mt-20 perspective-grid transform scale-[0.7] md:scale-90 lg:scale-100">
          <div className="grid transform rotate-x-[55deg] rotate-z-[45deg]" style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`
          }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const level = LEVELS.find(l => l.x === x && l.y === y);
              const isChar = state.charPos.x === x && state.charPos.y === y;
              const isUnlocked = level ? (level.id === 1 || state.completedLevels.includes(level.id - 1)) : false;
              const isDone = level ? state.completedLevels.includes(level.id) : false;

              return (
                <div 
                  key={i} 
                  onClick={() => level && isUnlocked && enterLevel(level)}
                  className={`relative border border-white/[0.03] transition-all duration-300 isometric-tile ${
                    level ? (isUnlocked ? 'bg-indigo-600/10 cursor-pointer shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900/60 opacity-60') : 'bg-transparent'
                  }`}
                >
                  {isChar && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 transform -rotate-z-[45deg] -rotate-x-[55deg] translate-y-[-45px] pointer-events-none transition-all duration-300">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_25px_50px_rgba(79,70,229,1)] border-4 border-white animate-bounce">
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute top-16 w-10 h-3 bg-black/40 blur-md rounded-full"></div>
                    </div>
                  )}

                  {level && (
                    <div className={`absolute inset-0 flex items-center justify-center z-30 transform -rotate-z-[45deg] -rotate-x-[55deg] translate-y-[-15px] pointer-events-none`}>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl md:rounded-3xl flex items-center justify-center border-2 transition-all shadow-2xl ${
                        isDone ? 'bg-green-600 border-green-300' : isUnlocked ? 'bg-indigo-600 border-indigo-200 animate-pulse' : 'bg-slate-800 border-slate-700 opacity-50'
                      }`}>
                        <span className="text-xs md:text-[14px] font-black text-white">{level.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="fixed bottom-8 md:bottom-12 bg-black/60 backdrop-blur-2xl px-8 py-4 md:px-12 md:py-6 rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex items-center gap-6 md:gap-12 animate-in slide-in-from-bottom-10">
          <div className="flex gap-4 items-center">
            <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,1)]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">KEYS / CLIC</span>
          </div>
          <div className="w-px h-6 md:h-8 bg-white/10"></div>
          <div className="flex gap-4 items-center">
            <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">DONE</span>
          </div>
        </div>
      </div>
    );
  }

  // TERMINAL VIEW
  return (
    <div className="h-screen flex flex-col bg-[#0a0f1d] text-slate-200 overflow-hidden">
      <header className="h-16 md:h-20 border-b border-white/5 bg-slate-900/40 backdrop-blur-2xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
        <button onClick={handleBackToWorld} className="flex items-center gap-4 md:gap-8 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all transform group-active:scale-90 border border-white/5">
             <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-black tracking-widest text-white uppercase italic leading-none">MOD_0{currentLevel?.id}</h1>
            <span className="text-[9px] md:text-[11px] text-indigo-500 font-bold uppercase tracking-[0.3em] animate-pulse">Connected</span>
          </div>
        </button>
        <div className="px-4 py-2 md:px-8 md:py-2.5 bg-indigo-500/10 rounded-xl md:rounded-2xl border border-indigo-500/20 text-[10px] md:text-xs font-black text-indigo-400">
          {currentLevel?.difficulty.toUpperCase()} • ZONA {currentLevel?.zone}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Aside */}
        <aside className="w-72 md:w-[400px] border-r border-white/5 p-6 md:p-8 overflow-y-auto bg-slate-950/40 flex flex-col gap-8 custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white leading-none uppercase italic tracking-tighter">{currentLevel?.title}</h2>
              <div className="h-1 w-16 md:w-20 bg-indigo-600 rounded-full"></div>
            </div>
            
            <div className="p-6 md:p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl md:rounded-[2.5rem] relative shadow-xl">
              <span className="absolute -top-3 left-6 md:left-8 bg-indigo-600 text-[8px] md:text-[10px] px-3 md:px-4 py-1 rounded-full font-black tracking-widest shadow-lg">MANUALE</span>
              <p className="text-indigo-100 text-sm md:text-base leading-relaxed font-medium mt-1">{currentLevel?.tutorial}</p>
            </div>

            <div className="p-6 md:p-8 bg-black/60 border border-white/10 rounded-2xl md:rounded-[2.5rem] shadow-xl relative">
              <h4 className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Protocollo</h4>
              <p className="text-white text-lg md:text-xl italic font-bold leading-tight">"{currentLevel?.prompt}"</p>
            </div>
          </div>

          <SchemaViewer schema={currentLevel?.schema || []} />
        </aside>

        {/* Right Section */}
        <section className="flex-1 flex flex-col p-6 md:p-10 gap-6 md:gap-8 overflow-y-auto custom-scrollbar">
          <div className="min-h-[350px] md:min-h-[450px] flex-grow flex flex-col">
            <SqlEditor 
              value={state.userCode}
              onChange={(val) => setState(prev => ({ ...prev, userCode: val }))}
              onRun={handleRunCode}
              disabled={state.isEvaluating}
              type={currentLevel?.type || ''}
            />
          </div>

          <div className={`min-h-[200px] md:min-h-[250px] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 border transition-all flex flex-col relative overflow-hidden flex-shrink-0 ${
            state.isSuccess === true ? 'bg-green-500/[0.05] border-green-500/30' : 
            state.isSuccess === false ? 'bg-red-500/[0.05] border-red-500/30' :
            'bg-slate-900/60 border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]'
          }`}>
            <div className="flex items-center justify-between mb-6 relative z-10">
               <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${state.isEvaluating ? 'bg-yellow-500 animate-pulse' : 'bg-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`}></div>
                 <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 font-mono">Kernel_System_Output</h3>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={handleGetHint}
                    disabled={isHintLoading || state.isEvaluating}
                    className="px-4 py-2 md:px-6 md:py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black transition-all disabled:opacity-30 uppercase tracking-[0.2em]"
                  >
                    {isHintLoading ? '...' : 'S.O.S_AI'}
                  </button>
                  {state.isSuccess && (
                    <button 
                      onClick={handleBackToWorld}
                      className="px-6 py-2 md:px-10 md:py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl md:rounded-3xl text-xs font-black shadow-[0_20px_50px_rgba(34,197,94,0.4)] flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      CLEAR
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  )}
               </div>
            </div>

            <div className="flex-1 font-mono text-base md:text-lg relative z-10 overflow-y-auto custom-scrollbar">
              {state.isEvaluating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
                   <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 animate-[shimmer_1s_infinite]"></div>
                   </div>
                   <p className="text-[10px] uppercase tracking-[0.4em] animate-pulse">Analyzing_Hack_Sequence...</p>
                </div>
              ) : hint ? (
                <div className="p-6 md:p-8 bg-indigo-500/10 border-l-8 border-indigo-500 rounded-2xl md:rounded-3xl animate-in slide-in-from-left-8">
                  <div className="text-[10px] font-black text-indigo-400 mb-3 uppercase tracking-[0.2em]">HACK_TIP_01:</div>
                  <p className="text-indigo-100 italic text-xl md:text-2xl leading-snug">"{hint}"</p>
                </div>
              ) : state.feedback ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                   <p className={`text-2xl md:text-3xl font-black mb-4 flex items-center gap-4 ${state.isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                      <span>{state.isSuccess ? '>>> OK' : '>>> ERR'}</span>
                   </p>
                   <p className="text-slate-300 leading-relaxed text-base md:text-xl font-medium">{state.feedback}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full opacity-5 pointer-events-none select-none italic text-2xl md:text-4xl font-black uppercase tracking-[0.8em] rotate-[-2deg]">
                  Waiting_Input
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
