import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { AssessmentResult, UserInfo, AIInsights } from '../types';
import {
  Trophy,
  Target,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Twitter,
  Linkedin,
  ShoppingBag,
  Sparkles,
  Link as LinkIcon,
  Download,
  Copy,
  Check
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
// Native browser print is used for maximum CSS fidelity and reliability

interface ResultsDashboardProps {
  result: AssessmentResult;
  user: UserInfo;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, user }) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pillarScores: result.pillarScores,
            totalScore: result.totalScore,
            readinessLevel: result.readinessLevel,
            context: { role: user.role, industry: user.industry }
          })
        });

        const apiResult = await response.json();
        
        if (response.ok && apiResult.success) {
          setInsights(apiResult.data);
        } else {
          throw new Error(apiResult.error?.message || 'Failed to fetch AI insights');
        }
      } catch (err: any) {
        console.error(err);
        setError(`Diagnostic Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [result, user]);

  const shareText = `I scored ${result.totalScore}% (${result.readinessLevel}) on the AI Readiness Test — better than ${result.percentile}% of users. How AI-ready are you? Check it out at ${window.location.origin}`;

  const shareOnX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.origin;
    const linkedInText = `I just tested my AI readiness.\n\nScore: ${result.totalScore}% (${result.readinessLevel})\n\nApparently I'm ahead of ${result.percentile}% of users.\n\nCurious where you rank?\nTake the test here: ${url}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(linkedInText)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Small timeout to ensure any hover states or micro-animations are settled
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#050505',
        logging: false,
        onclone: (clonedDoc) => {
          // Additional cleanup on the clone
          const noExportElements = clonedDoc.querySelectorAll('.no-export, .no-print');
          noExportElements.forEach(el => (el as HTMLElement).style.display = 'none');
          
          // Ensure the root container in the clone doesn't have extra padding that might cause breaks
          const reportEl = clonedDoc.querySelector('[data-report-root="true"]') as HTMLElement;
          if (reportEl) {
            reportEl.style.padding = '0';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Scale back to normal size
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Alamia-AI-Readiness-${user.name.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      // Fallback to print if canvas fails
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Explorer': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Beginner': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Practitioner': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'AI Operator': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 md:p-12">
      <div className="max-w-6xl mx-auto" ref={reportRef} data-report-root="true">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12 no-export">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Your AI Readiness Score</h1>
            <p className="text-zinc-400 text-sm md:text-base">Analysis for <span className="text-white font-medium">{user.name}</span> • {new Date().toLocaleDateString()}</p>
          </div>
            <div className="flex flex-col items-end gap-1 no-print">
              <button
                onClick={downloadPdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isExporting ? 'Generating...' : 'Save AI Report (PDF)'}
              </button>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Scores */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Main Score Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 md:opacity-10 pointer-events-none">
                <Trophy className="w-24 h-24 md:w-32 md:h-32" />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-zinc-800 md:hidden"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-zinc-800 hidden md:block"
                    />
                    {/* Mobile Progress */}
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="72"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={452.39}
                      initial={{ strokeDashoffset: 452.39 }}
                      animate={{ strokeDashoffset: 452.39 - (452.39 * result.totalScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-emerald-500 md:hidden"
                    />
                    {/* Desktop Progress */}
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={552.92}
                      initial={{ strokeDashoffset: 552.92 }}
                      animate={{ strokeDashoffset: 552.92 - (552.92 * result.totalScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-emerald-500 hidden md:block"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold">{result.totalScore}%</span>
                    <span className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest">Total Score</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <span className={`inline-block px-4 py-1 rounded-full border text-xs md:text-sm font-bold mb-4 ${getLevelColor(result.readinessLevel)}`}>
                    {result.readinessLevel}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    You are {['A', 'E', 'I', 'O', 'U'].includes(result.readinessLevel[0]) ? 'an' : 'a'} {result.readinessLevel}
                  </h2>
                  <p className="text-emerald-400 font-bold text-base md:text-lg mb-4">
                    You are ahead of {result.percentile}% of users who took this test.
                  </p>
                  <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                    You've taken the first step toward AI mastery. Your score of {result.totalScore}% indicates you have a solid foundation, but there are key areas where you can unlock massive productivity gains.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar Breakdown */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: 'Strategy', score: result.pillarScores.Strategy, icon: <Target className="w-5 h-5" /> },
                { name: 'Skills', score: result.pillarScores.Skills, icon: <Cpu className="w-5 h-5" /> },
                { name: 'Workflows', score: result.pillarScores.Workflows, icon: <Layers className="w-5 h-5" /> },
                { name: 'Systems', score: result.pillarScores.Systems, icon: <Zap className="w-5 h-5" /> }
              ].map((pillar) => (
                <div key={pillar.name} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3 text-emerald-500">
                      {pillar.icon}
                      <span className="font-bold">{pillar.name}</span>
                    </div>
                    <span className="font-mono font-bold">{pillar.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${pillar.score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights Section */}
            <div className="p-6 md:p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">AI Diagnostic Report</h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-zinc-500 animate-pulse">Alamia AI is analyzing your productivity profile...</p>
                </div>
              ) : error ? (
                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              ) : insights && (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Summary</h3>
                    <p className="text-zinc-300 leading-relaxed text-base md:text-lg">{insights.summary}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Strengths
                      </h3>
                      <ul className="space-y-3">
                        {insights.strengths.map((s, i) => (
                          <li key={i} className="text-zinc-400 text-sm flex gap-3">
                            <span className="text-emerald-500">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Capability Gaps
                      </h3>
                      <ul className="space-y-3">
                        {insights.capability_gaps.map((g, i) => (
                          <li key={i} className="text-zinc-400 text-sm flex gap-3">
                            <span className="text-yellow-500">•</span>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Recommended Next Steps</h3>
                    <div className="space-y-4">
                      {insights.recommended_actions.map((action, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <p className="text-zinc-300 text-sm">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Recommendation */}
          <div className="space-y-8 no-print">
            {/* Viral Share Block */}
            <div className="p-6 md:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Share your AI score</h3>
              <p className="text-zinc-400 text-xs md:text-sm mb-6">Challenge your colleagues to beat your score.</p>

              <div className="space-y-3">
                <button
                  onClick={shareOnX}
                  className="w-full py-4 bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <Twitter className="w-5 h-5" />
                  Share on X
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="w-full py-4 bg-[#0077B5] hover:bg-[#00669c] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <Linkedin className="w-5 h-5" />
                  Share on LinkedIn
                </button>
                <button
                  onClick={copyLink}
                  className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Link Copied!' : 'Copy Result Link'}
                </button>
              </div>

              <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                Hundreds of professionals have taken this test today
              </p>
            </div>

            {/* Digital Product Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-emerald-500 text-black relative overflow-hidden shadow-2xl shadow-emerald-500/20">
              <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
                <ShoppingBag className="w-24 h-24 md:w-32 md:h-32" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <span className="px-3 py-1 rounded-full bg-black text-emerald-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Recommended for you</span>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <div className="h-6 md:h-8 bg-black/10 rounded-lg animate-pulse" />
                    <div className="h-16 md:h-20 bg-black/10 rounded-lg animate-pulse" />
                    <div className="h-10 md:h-12 bg-black/10 rounded-lg animate-pulse" />
                  </div>
                ) : insights && (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{insights.product_recommendation.name}</h3>
                    <p className="text-black/70 text-xs md:text-sm mb-6 leading-relaxed">
                      {insights.product_recommendation.description}
                    </p>

                    <div className="space-y-3 mb-6 md:mb-8">
                      {insights.product_recommendation.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs md:text-sm font-medium">
                          <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                          {benefit}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-50">One-time payment</span>
                        <span className="text-2xl md:text-3xl font-bold">{insights.product_recommendation.price}</span>
                      </div>
                      <button className="flex-1 py-3 md:py-4 bg-black text-emerald-500 font-bold rounded-xl hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
                        Get Instant Access
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 text-center">
              <h3 className="text-xl font-bold mb-4">Stay AI-Ready</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Get weekly AI workflow tips and tool reviews delivered to your inbox.
              </p>
              <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                Join 10k+ Readers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
