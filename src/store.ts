import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = 'Coding' | 'Health' | 'Studies' | 'Social' | 'Body';

import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

export interface Task {
  id: string;
  title: string;
  category: Category;
  type: 'streak' | 'description';
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
}

interface AppState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // React Flow State
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeData: (id: string, data: any) => void;
  addNode: (node: Node) => void;

  exportData: () => string;
  importData: (jsonData: string) => void;
  
  // Settings / Profile
  githubUsername: string;
  setGithubUsername: (username: string) => void;
  syncGithubActivity: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: crypto.randomUUID() },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      // React Flow State
      nodes: [],
      edges: [],
      onNodesChange: (changes) =>
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
        })),
      onEdgesChange: (changes) =>
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
        })),
      onConnect: (connection) =>
        set((state) => ({
          edges: addEdge(connection, state.edges),
        })),
      updateNodeData: (id, data) =>
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id === id) {
              return { ...node, data: { ...node.data, ...data } };
            }
            return node;
          }),
        })),
      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
        })),

      exportData: () => {
        const state = get();
        return JSON.stringify({ 
          tasks: state.tasks, 
          githubUsername: state.githubUsername,
          nodes: state.nodes,
          edges: state.edges
        });
      },
      importData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          set({ 
            tasks: parsed.tasks || [], 
            githubUsername: parsed.githubUsername || '',
            nodes: parsed.nodes || [],
            edges: parsed.edges || []
          });
        } catch (e) {
          console.error("Failed to import data", e);
        }
      },
      githubUsername: '',
      setGithubUsername: (username) => set({ githubUsername: username }),
      
      syncGithubActivity: async () => {
        const { githubUsername, tasks, addTask, updateTask } = get();
        if (!githubUsername) return;

        try {
          const response = await fetch(`https://api.github.com/users/${githubUsername}/events/public`);
          if (!response.ok) return;
          
          const events = await response.json();
          
          // Find all unique dates in the recent events that have Push or PR events
          const activeDates = new Set<string>();
          events.forEach((event: any) => {
            if (event.type === 'PushEvent' || event.type === 'PullRequestEvent') {
              const dateStr = event.created_at.split('T')[0];
              activeDates.add(dateStr);
            }
          });

          // For each active date, ensure a completed GitHub Activity task exists
          activeDates.forEach((dateStr) => {
            const existingTask = get().tasks.find(t => t.title === 'GitHub Activity' && t.date === dateStr);
            if (existingTask) {
              if (!existingTask.completed) updateTask(existingTask.id, { completed: true });
            } else {
              addTask({
                title: 'GitHub Activity',
                category: 'Coding',
                type: 'streak',
                description: 'Automated GitHub Sync',
                completed: true,
                date: dateStr
              });
            }
          });
        } catch (error) {
          console.error("Failed to sync GitHub activity", error);
        }
      },
    }),
    {
      name: 'mytrackai-storage', // local storage key
    }
  )
);
