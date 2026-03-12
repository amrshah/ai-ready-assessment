import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserInfo } from '../types';
import { Mail, User, Building2, Globe, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface LeadFormProps {
  onSubmit: (info: UserInfo) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserInfo>({
    name: '',
    email: '',
    role: '',
    industry: '',
    sendReport: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Artificial delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Assessment Complete</h2>
          <p className="text-zinc-400">Enter your details to unlock your full AI Readiness Report and personalized roadmap.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                required
                type="email"
                placeholder="john@company.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Your Role</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Founder"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Industry</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tech"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer" onClick={() => setFormData({ ...formData, sendReport: !formData.sendReport })}>
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.sendReport ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'}`}>
              {formData.sendReport && <CheckCircle2 className="w-3 h-3 text-black" />}
            </div>
            <span className="text-sm text-zinc-400">Email me my full AI readiness report.</span>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Results...
              </>
            ) : (
              <>
                Generate My Report
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-zinc-600 uppercase tracking-widest no-print">
          Your data is secure and will never be shared.
        </p>
      </motion.div>
    </div>
  );
};
