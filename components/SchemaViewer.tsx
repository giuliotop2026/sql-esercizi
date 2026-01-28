
import React from 'react';
import { TableSchema } from '../types';

interface SchemaViewerProps {
  schema: TableSchema[];
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  return (
    <div className="space-y-8 py-2">
      <div className="flex items-center gap-4 mb-4">
         <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_#38bdf8]"></div>
         <span className="font-game text-sm text-blue-300 tracking-[0.4em] uppercase font-black italic">DATABASE_SCHEMA</span>
      </div>
      <div className="space-y-6">
        {schema.map((table) => (
          <div key={table.name} className="bg-[#0f172a] rounded-[1.5rem] border-2 border-slate-700 hover:border-blue-400/60 transition-all p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <span className="font-game text-xl text-blue-400 uppercase tracking-tighter italic font-black drop-shadow-md">
                {table.name}
              </span>
            </div>
            
            <div className="space-y-2">
              {table.columns.map((col) => (
                <div key={col.name} className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] rounded px-1 transition-colors">
                  <div className="flex items-center gap-2">
                     <span className={`font-bold ${col.isPrimary ? 'text-orange-400' : 'text-slate-100'}`}>
                        {col.name}
                     </span>
                     <div className="flex gap-1">
                        {col.isPrimary && (
                          <span className="text-[9px] bg-orange-600/90 text-white px-1.5 py-0.5 rounded font-black">PK</span>
                        )}
                        {col.isForeign && (
                          <span className="text-[9px] bg-blue-600/90 text-white px-1.5 py-0.5 rounded font-black">FK</span>
                        )}
                     </div>
                  </div>
                  <span className="text-slate-400 text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaViewer;
