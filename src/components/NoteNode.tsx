import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useStore } from '../store';

export default function NoteNode({ id, data }: NodeProps) {
  const { updateNodeData } = useStore();
  const [content, setContent] = useState(data.content || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    updateNodeData(id, { content: e.target.value });
  };

  return (
    <div className="bg-[#fff9c4] text-black w-48 min-h-48 rounded shadow-lg flex flex-col overflow-hidden border border-yellow-400 font-sans group">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-500 opacity-0 group-hover:opacity-100" />
      
      <div className="bg-yellow-300 px-2 py-1 flex items-center justify-between cursor-move drag-handle">
        <span className="text-xs font-semibold text-yellow-800">{data.label || 'Note'}</span>
      </div>
      
      <textarea
        className="flex-1 bg-transparent resize-none p-2 outline-none text-sm leading-relaxed"
        value={content}
        onChange={handleChange}
        placeholder="Type here..."
      />

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-500 opacity-0 group-hover:opacity-100" />
    </div>
  );
}
