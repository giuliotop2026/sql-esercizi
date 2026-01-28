
import React from 'react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  disabled: boolean;
  type: string;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ value, onChange, onRun, disabled, type }) => {
  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] rounded-[2rem] md:rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] group transition-all hover:border-indigo-500/40">
      <div className="flex items-center justify-between px-6 md:px-10 py-4 md:py-6 bg-slate-900/60 border-b border-white/5">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#ff5f56] shadow-[0_0_10px_rgba(255,95,86,0.3)]"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#ffbd2e] shadow-[0_0_10px_rgba(255,189,46,0.3)]"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#27c93f] shadow-[0_0_10px_rgba(39,201,63,0.3)]"></div>
          </div>
          <div className="h-5 md:h-6 w-px bg-white/10"></div>
          <span className="text-[10px] md:text-[12px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black">{type.slice(0, 10)}_SHELL</span>
        </div>
        <button
          onClick={onRun}
          disabled={disabled || !value.trim()}
          className={`px-6 py-2 md:px-10 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-black transition-all transform active:scale-95 flex items-center gap-2 md:gap-3 uppercase tracking-widest ${
            disabled || !value.trim() 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5 opacity-50' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/30'
          }`}
        >
          {disabled ? 'PROCESS...' : 'ESEGUI'}
          {!disabled && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          )}
        </button>
      </div>
      <div className="flex-1 relative">
        <div className="absolute top-4 md:top-8 left-4 md:left-8 flex flex-col items-center gap-1.5 md:gap-3 pointer-events-none opacity-20">
          {[...Array(30)].map((_, i) => (
            <span key={i} className="text-[10px] md:text-[12px] font-mono text-slate-500 font-bold">{i + 1}</span>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="-- Inserisci query SQL o Trigger PL/SQL..."
          className="w-full h-full pl-14 md:pl-20 pr-6 md:pr-10 py-4 md:py-8 bg-transparent font-mono text-[16px] md:text-[18px] text-indigo-300 outline-none resize-none placeholder-slate-800 leading-relaxed caret-indigo-400"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default SqlEditor;
