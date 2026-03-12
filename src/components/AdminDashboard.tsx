import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  Building2,
  Briefcase,
  Target,
  Trash2
} from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  email: string;
  role: string;
  industry: string;
  scores: {
    totalScore: number;
    readinessLevel: string;
    pillarScores: Record<string, number>;
  };
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');

  useEffect(() => {
    const savedPass = sessionStorage.getItem('admin_gate_pass');
    if (savedPass) {
      fetchLeads(savedPass);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/leads', {
        headers: { 'Authorization': `Bearer ${password}` }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setLeads(result.data);
        sessionStorage.setItem('admin_gate_pass', password);
        setIsAuthenticated(true);
      } else {
        setError(result.error?.message || 'Invalid administrative password');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Connection error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (pass: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/leads', {
        headers: { 'Authorization': `Bearer ${pass}` }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setLeads(result.data);
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem('admin_gate_pass');
        setIsAuthenticated(false);
        if (pass) setError(result.error?.message || 'Session expired');
      }
    } catch (err) {
      setError('Connection error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
    
    const pass = sessionStorage.getItem('admin_gate_pass');
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${pass}` }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setLeads(leads.filter(l => l.id !== id));
      } else {
        alert(result.error?.message || 'Failed to delete lead.');
      }
    } catch (err) {
      alert('Connection error occurred while deleting.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Industry', 'Total Score', 'Readiness', 'Strategy', 'Skills', 'Workflows', 'Systems', 'Date'];
    const rows = leads.map(l => [
      l.name,
      l.email,
      l.role,
      l.industry,
      l.scores.totalScore,
      l.scores.readinessLevel,
      l.scores.pillarScores.Strategy,
      l.scores.pillarScores.Skills,
      l.scores.pillarScores.Workflows,
      l.scores.pillarScores.Systems,
      new Date(l.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Alamia_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => 
    (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterIndustry === 'All' || l.industry === filterIndustry)
  );

  const industries = ['All', ...new Set(leads.map(l => l.industry))];

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Admin Access</h2>
          <p className="text-zinc-400 text-center mb-8 text-sm">Protected administrative portal for lead management.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                className="w-full px-5 py-4 bg-black border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
                required
              />
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all"
            >
              Verify Identity
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold tracking-widest uppercase">Secured Area</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Lead Dashboard</h1>
          <p className="text-zinc-400">Manage professional data and export results for the Alamia ecosystem.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-bold transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_gate_pass');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl font-bold transition-all text-sm"
          >
            <Lock className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Leads', value: leads.length, icon: <Users className="w-5 h-5" />, color: 'emerald' },
          { label: 'Avg Score', value: leads.length ? Math.round(leads.reduce((a, b) => a + b.scores.totalScore, 0) / leads.length) : 0, icon: <Target className="w-5 h-5" />, color: 'blue' },
          { label: 'Industries', value: industries.length - 1, icon: <Building2 className="w-5 h-5" />, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm font-medium">{stat.label}</span>
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-500`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search leads by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
          >
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800">
                <th className="px-6 py-4 text-sm font-bold text-zinc-400">Lead</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-400">Details</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-400">Readiness</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-400">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white mb-0.5">{lead.name}</span>
                      <span className="text-zinc-500 text-sm flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-zinc-300 text-sm font-medium flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3 h-3" />
                        {lead.role}
                      </span>
                      <span className="text-zinc-500 text-sm flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" />
                        {lead.industry}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-emerald-500/20" 
                          style={{ height: `${lead.scores.totalScore}%` }}
                        />
                        <span className="text-xs font-bold relative z-10">{lead.scores.totalScore}%</span>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        lead.scores.totalScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
                        lead.scores.totalScore >= 60 ? 'bg-blue-500/10 text-blue-500' :
                        'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {lead.scores.readinessLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-500 text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                    {loading ? 'Retrieving professional data...' : 'No leads matching your criteria found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
