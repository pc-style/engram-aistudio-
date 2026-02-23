import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Database, Network, Terminal, RefreshCw, FileText, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end border-b-2 border-[var(--line)] pb-4">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2 flex items-center gap-4">
            <Terminal size={40} />
            ENGRAM
          </h1>
          <p className="font-mono text-sm opacity-60 uppercase tracking-widest">
            Persistent Agent Memory System
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 font-mono text-xs uppercase hover:bg-[var(--ink)] hover:text-[var(--bg)] px-3 py-2 border border-[var(--line)] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Sync
        </button>
      </header>

      <div className="flex gap-4 mb-8">
        <TabButton active={activeTab === 'memories'} onClick={() => setActiveTab('memories')} icon={<Database size={16} />} label="Memories" />
        <TabButton active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} icon={<Network size={16} />} label="Graph" />
        <TabButton active={activeTab === 'bundle'} onClick={() => setActiveTab('bundle')} icon={<Terminal size={16} />} label="Bundle" />
        <TabButton active={activeTab === 'skill'} onClick={() => setActiveTab('skill')} icon={<FileText size={16} />} label="Skill" />
      </div>

      <main>
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
      className={`flex items-center gap-2 px-6 py-3 font-mono text-sm uppercase border border-[var(--line)] transition-colors ${
        active ? 'bg-[var(--ink)] text-[var(--bg)]' : 'hover:bg-black/5'
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
      <form onSubmit={addMemory} className="border border-[var(--line)] p-6 bg-black/5 flex items-end gap-4">
        <div className="flex-1">
          <label className="block font-mono text-xs uppercase tracking-widest mb-2 opacity-60">Memory Content</label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g., Never use implicit any in TypeScript"
            className="brutal-input"
          />
        </div>
        <div className="w-32">
          <label className="block font-mono text-xs uppercase tracking-widest mb-2 opacity-60">Imp ({importance})</label>
          <input
            type="range"
            min="1"
            max="10"
            value={importance}
            onChange={(e) => setImportance(parseInt(e.target.value))}
            className="w-full h-10 accent-[var(--ink)]"
          />
        </div>
        <div className="flex items-center h-[46px] px-4 border border-[var(--line)] bg-transparent">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enforced}
              onChange={(e) => setEnforced(e.target.checked)}
              className="accent-[var(--ink)] w-4 h-4"
            />
            <span className="font-mono text-xs uppercase tracking-widest">Enforced</span>
          </label>
        </div>
        <button type="submit" className="brutal-button h-[46px]">
          Add
        </button>
      </form>

      <div className="border border-[var(--line)]">
        <div className="data-row bg-black/5 !cursor-default !hover:bg-black/5 !hover:text-[var(--ink)]">
          <div className="col-header">ID</div>
          <div className="col-header">Content</div>
          <div className="col-header">Scope</div>
          <div className="col-header">Importance</div>
          <div className="col-header">Status</div>
          <div className="col-header text-right">Action</div>
        </div>
        {memories.length === 0 ? (
          <div className="p-8 text-center font-mono text-sm opacity-50">No memories stored.</div>
        ) : (
          memories.map(mem => (
            <div key={mem.id} className="data-row group">
              <div className="data-value opacity-50">#{mem.id}</div>
              <div className="font-medium pr-4">{mem.content}</div>
              <div className="data-value text-xs uppercase">{mem.scope}</div>
              <div className="data-value">{mem.importance}/10</div>
              <div>
                <span className={mem.enforced ? 'pill-enforced' : 'pill-advisory'}>
                  {mem.enforced ? 'Enforced' : 'Advisory'}
                </span>
              </div>
              <div className="text-right">
                <button 
                  onClick={() => deleteMemory(mem.id)} 
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
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
      <form onSubmit={addEdge} className="border border-[var(--line)] p-6 bg-black/5 flex items-end gap-4">
        <div className="flex-1">
          <label className="block font-mono text-xs uppercase tracking-widest mb-2 opacity-60">Source</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., AuthService"
            className="brutal-input"
          />
        </div>
        <div className="flex-1">
          <label className="block font-mono text-xs uppercase tracking-widest mb-2 opacity-60">Relation</label>
          <input
            type="text"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            placeholder="e.g., depends on"
            className="brutal-input"
          />
        </div>
        <div className="flex-1">
          <label className="block font-mono text-xs uppercase tracking-widest mb-2 opacity-60">Target</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g., JWTLibrary"
            className="brutal-input"
          />
        </div>
        <button type="submit" className="brutal-button h-[46px]">
          Add
        </button>
      </form>

      <div className="border border-[var(--line)]">
        <div className="data-row-edge bg-black/5 !cursor-default !hover:bg-black/5 !hover:text-[var(--ink)]">
          <div className="col-header">ID</div>
          <div className="col-header">Source</div>
          <div className="col-header">Relation</div>
          <div className="col-header">Target</div>
          <div className="col-header text-right">Action</div>
        </div>
        {edges.length === 0 ? (
          <div className="p-8 text-center font-mono text-sm opacity-50">No graph edges stored.</div>
        ) : (
          edges.map(edge => (
            <div key={edge.id} className="data-row-edge group">
              <div className="data-value opacity-50">#{edge.id}</div>
              <div className="font-bold">{edge.source}</div>
              <div className="data-value italic opacity-70">{edge.relation}</div>
              <div className="font-bold">{edge.target}</div>
              <div className="text-right">
                <button 
                  onClick={() => deleteEdge(edge.id)} 
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
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
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Filter by topic (optional)..."
            className="brutal-input"
          />
        </div>
        <button onClick={generateBundle} className="brutal-button">
          Generate Bundle
        </button>
      </div>

      {bundle && (
        <div className="border border-[var(--line)] bg-[var(--ink)] text-[var(--bg)] p-6 relative">
          <div className="col-header mb-4 opacity-50">Generated Context Bundle</div>
          <button 
            onClick={() => navigator.clipboard.writeText(bundle)}
            className="absolute top-6 right-6 font-mono text-xs uppercase border border-[var(--bg)] px-3 py-1 hover:bg-[var(--bg)] hover:text-[var(--ink)] transition-colors"
          >
            Copy
          </button>
          <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
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
      <div className="border border-[var(--line)] bg-[var(--ink)] text-[var(--bg)] p-6 relative">
        <div className="col-header mb-4 opacity-50">Agent Skill (skill.md)</div>
        <button 
          onClick={() => navigator.clipboard.writeText(skillContent)}
          className="absolute top-6 right-6 font-mono text-xs uppercase border border-[var(--bg)] px-3 py-1 hover:bg-[var(--bg)] hover:text-[var(--ink)] transition-colors"
        >
          Copy
        </button>
        <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
          {skillContent}
        </pre>
      </div>
    </motion.div>
  );
}
