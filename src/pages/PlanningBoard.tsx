import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant
} from '@xyflow/react';
import type { Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus } from 'lucide-react';
import { useStore } from '../store';
import NoteNode from '../components/NoteNode';

export default function PlanningBoard() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore();

  const nodeTypes = useMemo(() => ({
    note: NoteNode,
  }), []);

  const handleAddNote = () => {
    const newNode: Node = {
      id: crypto.randomUUID(),
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: { label: `Note ${nodes.length + 1}`, content: '' },
      type: 'note',
      dragHandle: '.drag-handle' // Only allow dragging from header
    };
    addNode(newNode);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planning Board</h1>
          <p className="text-gray-400">Connect notes and string them together like a detective.</p>
        </div>
        <button
          onClick={handleAddNote}
          className="bg-surface hover:bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Note
        </button>
      </header>

      <div className="flex-1 border border-gray-800 rounded-2xl overflow-hidden bg-[#0f1115]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          colorMode="dark"
          fitView
        >
          <Controls />
          <MiniMap nodeStrokeColor="#8b5cf6" nodeColor="#1e1e24" maskColor="rgba(0,0,0,0.5)" />
          <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#2e303a" />
        </ReactFlow>
      </div>
    </div>
  );
}
