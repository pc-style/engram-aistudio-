import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Network, Package, FileText, Plus, Trash2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';

type Memory = {
  id: number;
  content: string;
  scope: 'global' | 'project' | 'session';
  importance: number;
  enforced: boolean;
};

type Edge = {
  id: number;
  source: string;
  relation: string;
  target: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'memories' | 'graph' | 'bundle' | 'skill'>('memories');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain size={18} />
            </div>
            <h1 className="font-medium tracking-tight text-lg">Engram</h1>
          </div>
          <nav className="flex items-center gap-1">
            <TabButton active={activeTab === 'memories'} onClick={() => setActiveTab('memories')} icon={<Brain size={16} />} label="Memories" />
            <TabButton active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} icon={<Network size={16} />} label="Graph" />
            <TabButton active={activeTab === 'bundle'} onClick={() => setActiveTab('bundle')} icon={<Package size={16} />} label="Bundle" />
            <TabButton active={activeTab === 'skill'} onClick={() => setActiveTab('skill')} icon={<FileText size={16} />} label="Skill" />
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {activeTab === 'memories' && <MemoriesView />}
        {activeTab === 'graph' && <GraphView />}
        {activeTab === 'bundle' && <BundleView />}
        {activeTab === 'skill' && <SkillView />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MemoriesView() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [content, setContent] = useState('');
  const [importance, setImportance] = useState(5);
  const [enforced, setEnforced] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    const res = await fetch('/api/memories');
    const data = await res.json();
    setMemories(data);
  };

  const addMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, scope: 'project', importance, enforced })
    });
    setContent('');
    setImportance(5);
    setEnforced(false);
    fetchMemories();
  };

  const deleteMemory = async (id: number) => {
    await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    fetchMemories();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-2">Project Memories</h2>
        <p className="text-zinc-400">Store preferences, rules, and facts about your project.</p>
      </div>

      <form onSubmit={addMemory} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Memory Content</label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g., Never use implicit any in TypeScript"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Importance ({importance})</label>
            <input
              type="range"
              min="1"
              max="10"
              value={importance}
              onChange={(e) => setImportance(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-5">
            <input
              type="checkbox"
              checked={enforced}
              onChange={(e) => setEnforced(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-zinc-950"
            />
            <span className="text-sm font-medium text-zinc-300">Enforced Rule</span>
          </label>
          <button type="submit" className="mt-5 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Add Memory
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {memories.map(memory => (
          <div key={memory.id} className="group flex items-start justify-between bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-4 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-md ${memory.enforced ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-400'}`}>
                {memory.enforced ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
              </div>
              <div>
                <p className="text-zinc-200 text-sm leading-relaxed">{memory.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 font-mono">
                  <span>ID: {memory.id}</span>
                  <span>•</span>
                  <span>IMP: {memory.importance}/10</span>
                  <span>•</span>
                  <span className="uppercase">{memory.scope}</span>
                </div>
              </div>
            </div>
            <button onClick={() => deleteMemory(memory.id)} className="text-zinc-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {memories.length === 0 && (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            No memories stored yet. Add one above.
          </div>
        )}
      </div>
    </motion.div>
  );
}

function GraphView() {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [source, setSource] = useState('');
  const [relation, setRelation] = useState('');
  const [target, setTarget] = useState('');

  useEffect(() => {
    fetchEdges();
  }, []);

  const fetchEdges = async () => {
    const res = await fetch('/api/edges');
    const data = await res.json();
    setEdges(data);
  };

  const addEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !relation.trim() || !target.trim()) return;
    await fetch('/api/edges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, relation, target })
    });
    setSource('');
    setRelation('');
    setTarget('');
    fetchEdges();
  };

  const deleteEdge = async (id: number) => {
    await fetch(`/api/edges/${id}`, { method: 'DELETE' });
    fetchEdges();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-2">Architecture Graph</h2>
        <p className="text-zinc-400">Map out relationships between components, services, and concepts.</p>
      </div>

      <form onSubmit={addEdge} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Source</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., AuthService"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Relation</label>
          <input
            type="text"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            placeholder="e.g., depends on"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Target</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g., JWTLibrary"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <button type="submit" className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center h-[38px] transition-colors">
          <Plus size={16} />
        </button>
      </form>

      <div className="space-y-3">
        {edges.map(edge => (
          <div key={edge.id} className="group flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-4 transition-colors">
            <div className="flex items-center gap-4 font-mono text-sm">
              <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{edge.source}</span>
              <span className="text-zinc-500">──({edge.relation})──&gt;</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{edge.target}</span>
            </div>
            <button onClick={() => deleteEdge(edge.id)} className="text-zinc-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {edges.length === 0 && (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            No edges stored yet. Add one above.
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BundleView() {
  const [topic, setTopic] = useState('');
  const [bundle, setBundle] = useState('');

  const generateBundle = async () => {
    const res = await fetch(`/api/bundle${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`);
    const data = await res.json();
    setBundle(data.bundle);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-2">Context Bundle</h2>
        <p className="text-zinc-400">Generate a token-optimized context block to paste into an agent's prompt.</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Filter by topic (optional)..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        <button onClick={generateBundle} className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
          <Package size={16} />
          Generate Bundle
        </button>
      </div>

      {bundle && (
        <div className="relative group">
          <div className="absolute right-4 top-4">
            <button 
              onClick={() => navigator.clipboard.writeText(bundle)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
          <pre className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed">
            {bundle}
          </pre>
        </div>
      )}
    </motion.div>
  );
}

function SkillView() {
  const [skillContent, setSkillContent] = useState('');

  useEffect(() => {
    fetch('/skill.md')
      .then(res => res.text())
      .then(text => setSkillContent(text))
      .catch(() => setSkillContent('Error loading skill.md'));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-2">Agent Skill</h2>
        <p className="text-zinc-400">The built-in instructions for AI agents. Paste this into your system prompt or CLAUDE.md.</p>
      </div>

      <div className="relative">
        <div className="absolute right-4 top-4">
          <button 
            onClick={() => navigator.clipboard.writeText(skillContent)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
        <pre className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {skillContent}
        </pre>
      </div>
    </motion.div>
  );
}
