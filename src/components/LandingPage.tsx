import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Target, Layers, Cpu } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6 tracking-wider uppercase">
              Free AI Productivity Audit
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Measure Your AI Readiness <br />
              <span className="text-emerald-500">in 5 Minutes</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Discover how effectively you use AI and get personalized recommendations to improve your workflows and productivity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStart}
                className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 overflow-hidden"
              >
                Start the AI Readiness Test
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl border border-zinc-800 transition-all duration-200">
                Learn how scoring works
              </button>
            </div>

            <p className="mt-8 text-zinc-500 text-sm font-medium">
              <span className="text-emerald-500">10,000+</span> professionals have taken this test
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-zinc-950/50 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-400">A professional-grade diagnostic in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Take the AI readiness quiz",
                desc: "Answer 20 targeted questions across 4 core capability pillars.",
                icon: <Target className="w-6 h-6 text-emerald-500" />
              },
              {
                step: "02",
                title: "Get your AI capability score",
                desc: "Get an instant breakdown of your AI maturity and readiness level.",
                icon: <Zap className="w-6 h-6 text-emerald-500" />
              },
              {
                step: "03",
                title: "Receive improvement tips",
                desc: "Receive AI-generated insights and a personalized roadmap for growth.",
                icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-colors group"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    {item.icon}
                  </div>
                  <span className="text-4xl font-bold text-zinc-800 group-hover:text-emerald-500/20 transition-colors">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capability Pillars */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The 4 Pillars of AI Readiness</h2>
            <p className="text-zinc-400">We evaluate your capability across the entire operational spectrum.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Strategy", icon: <Target className="w-5 h-5" />, desc: "Clarity of use cases and alignment with business goals." },
              { title: "Skills", icon: <Cpu className="w-5 h-5" />, desc: "Prompting ability, output evaluation, and iteration." },
              { title: "Workflows", icon: <Layers className="w-5 h-5" />, desc: "Repeatable processes and daily integration." },
              { title: "Systems", icon: <Zap className="w-5 h-5" />, desc: "Tools, automation, governance, and infrastructure." }
            ].map((pillar, i) => (
              <div key={i} className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                  {pillar.icon}
                  <h3 className="font-bold">{pillar.title}</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-24 px-6 bg-emerald-500">
        <div className="max-w-4xl mx-auto text-black">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Why This Matters</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-emerald-500 flex items-center justify-center text-sm">01</span>
                Beyond Basic Usage
              </h3>
              <p className="text-black/80 leading-relaxed">
                Using ChatGPT occasionally isn't an AI strategy. True readiness means moving from experimentation to operational excellence.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-emerald-500 flex items-center justify-center text-sm">02</span>
                Workflow Transformation
              </h3>
              <p className="text-black/80 leading-relaxed">
                The real value of AI lies in how it transforms your workflows, reduces friction, and enables new capabilities that were previously impossible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to benchmark your AI maturity?</h2>
          <p className="text-zinc-400 mb-10 text-lg">
            Join 2,500+ professionals who have used this assessment to guide their AI adoption journey.
          </p>
          <button
            onClick={onStart}
            className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Start the Assessment Now
          </button>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>© 2026 AI Ready Assessment. All rights reserved.</p>
      </footer>
    </div>
  );
};
