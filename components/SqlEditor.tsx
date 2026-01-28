
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
    <div className="flex flex-col h-full panel-metal overflow-hidden bg-slate-900/60 border-slate-700/50 shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-pulse"></div>
      <div className="px-8 py-5 bg-slate-800/60 border-b border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/40 border border-yellow-500/20"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/20"></div>
            </div>
            <span className="font-game text-[10px] text-orange-400 tracking-[0.3em] font-black uppercase italic opacity-80">DECRYPT_CONSOLE_V.4.2</span>
         </div>
         <button
            onClick={onRun}
            disabled={disabled || !value.trim()}
            className={`btn-gadget px-12 py-3 text-[12px] tracking-[0.2em] ${
              disabled || !value.trim() ? 'opacity-30 cursor-not-allowed grayscale' : ''
            }`}
          >
            {disabled ? 'DECRYPTING...' : 'EXECUTE_HACK'}
         </button>
      </div>
      <div className="flex-1 relative bg-black/40 p-1">
         <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="-- Scrivi qui il codice per violare le difese del database..."
            className="w-full h-full p-8 bg-transparent font-mono text-xl text-blue-200 outline-none resize-none placeholder-blue-900/30 leading-relaxed caret-blue-400 selection:bg-blue-500/30"
            spellCheck={false}
         />
      </div>
      <div className="px-6 py-2 bg-slate-900/80 border-t border-white/5 flex justify-between">
         <span className="text-[9px] font-game text-slate-500 tracking-widest uppercase italic font-black">Status: Awaiting Command</span>
         <span className="text-[9px] font-game text-blue-400/60 tracking-widest uppercase italic font-black">Mode: {type}</span>
      </div>
    </div>
  );
};

export default SqlEditor;
