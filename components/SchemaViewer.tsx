
import React from 'react';
import { TableSchema } from '../types';

interface SchemaViewerProps {
  schema: TableSchema[];
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Database_Structure_Log</h3>
      {schema.map((table) => (
        <div key={table.name} className="bg-slate-900/60 rounded-3xl p-6 border border-white/5 shadow-2xl transition-all hover:border-indigo-500/20 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-black text-lg text-indigo-100 italic uppercase tracking-tighter">{table.name}</span>
          </div>
          <div className="space-y-2">
            {table.columns.map((col) => (
              <div key={col.name} className="flex justify-between items-center text-[13px] font-mono p-1 border-b border-white/[0.02]">
                <span className="text-slate-300 font-medium">
                  {col.name}
                  {col.isPrimary && <span className="text-yellow-500 ml-2" title="Primary Key">PK</span>}
                  {col.isForeign && <span className="text-cyan-400 ml-2" title="Foreign Key">FK</span>}
                </span>
                <span className="text-slate-600 uppercase text-[10px] font-black">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchemaViewer;
