import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, AlertCircle, Target, Users, 
  ShieldCheck, Zap, Calculator, Building, CheckCircle2, 
  BarChart3, Info, PieChart, ArrowRightLeft, BriefcaseBusiness, 
  Lightbulb, Layers, Megaphone, MonitorSmartphone, Headset, 
  MapPin, Activity, Coins, Sparkles, Bot, Loader2, X, Wand2
} from 'lucide-react';

// Utility for formatting INR
const formatINR = (value) => {
  if (!isFinite(value) || isNaN(value)) return 'N/A';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

// Static color map to prevent Tailwind from purging dynamically constructed classes
const COLOR_MAP = {
  indigo: { fill: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', thumb: 'border-indigo-500' },
  blue: { fill: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', thumb: 'border-blue-500' },
  emerald: { fill: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', thumb: 'border-emerald-500' },
  rose: { fill: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', thumb: 'border-rose-500' },
  slate: { fill: 'bg-slate-500', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100', thumb: 'border-slate-500' },
  orange: { fill: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', thumb: 'border-orange-500' },
};

// Sleek, minimal slider component
const SliderField = ({ label, value, min, max, step, onChange, formatPrefix = '', formatSuffix = '', helperText, color = 'indigo', icon: Icon }) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const styles = COLOR_MAP[color] || COLOR_MAP.indigo;
  
  return (
    <div className="mb-6 group">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-semibold text-slate-700 tracking-tight flex items-center gap-1.5">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          {label}
        </label>
        <span className={`text-sm font-bold ${styles.text} ${styles.bg} px-2.5 py-1 rounded-md border ${styles.border} transition-colors shadow-sm`}>
          {formatPrefix}{value.toLocaleString('en-IN')}{formatSuffix}
        </span>
      </div>
      
      {/* Removed overflow-hidden so the custom thumb doesn't get clipped */}
      <div className="relative h-2 w-full bg-slate-200 rounded-full shadow-inner flex items-center my-3">
        {/* Custom filled track */}
        <div 
          className={`absolute top-0 left-0 h-full ${styles.fill} rounded-full pointer-events-none`}
          style={{ width: `${percentage}%` }}
        />
        {/* Custom thumb */}
        <div 
          className={`absolute h-5 w-5 bg-white border-2 ${styles.thumb} rounded-full shadow pointer-events-none z-10 transition-transform group-hover:scale-110`}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
        {/* Invisible native input for interaction */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>
      {helperText && <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{helperText}</p>}
    </div>
  );
};

// Component for the Unit Mix Visualization
const UnitMixBar = ({ mix }) => {
  const total = mix.bhk1 + mix.bhk2 + mix.bhk3 + mix.bhk4;
  const p1 = (mix.bhk1 / total) * 100;
  const p2 = (mix.bhk2 / total) * 100;
  const p3 = (mix.bhk3 / total) * 100;
  const p4 = (mix.bhk4 / total) * 100;

  return (
    <div className="mt-6">
      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>Inventory Mix</span>
        <span>{total} Total Relative Weight</span>
      </div>
      <div className="h-3 w-full flex rounded-full overflow-hidden shadow-inner">
        {p1 > 0 && <div style={{ width: `${p1}%` }} className="bg-slate-300 transition-all" title={`1 BHK: ${p1.toFixed(0)}%`} />}
        {p2 > 0 && <div style={{ width: `${p2}%` }} className="bg-blue-400 transition-all" title={`2 BHK: ${p2.toFixed(0)}%`} />}
        {p3 > 0 && <div style={{ width: `${p3}%` }} className="bg-indigo-500 transition-all" title={`3 BHK: ${p3.toFixed(0)}%`} />}
        {p4 > 0 && <div style={{ width: `${p4}%` }} className="bg-violet-600 transition-all" title={`4+ BHK: ${p4.toFixed(0)}%`} />}
      </div>
      <div className="flex gap-4 mt-3 text-[10px] uppercase font-bold text-slate-500">
        {p1 > 0 && <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> 1BHK ({p1.toFixed(0)}%)</div>}
        {p2 > 0 && <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> 2BHK ({p2.toFixed(0)}%)</div>}
        {p3 > 0 && <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> 3BHK ({p3.toFixed(0)}%)</div>}
        {p4 > 0 && <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600"></span> 4+BHK ({p4.toFixed(0)}%)</div>}
      </div>
    </div>
  );
};

export default function App() {
  const [showPitch, setShowPitch] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState("");

  const [scenarioPrompt, setScenarioPrompt] = useState("");
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [genError, setGenError] = useState(false);

  // --- 1. INVENTORY & PROJECT STATE ---
  const [totalUnits, setTotalUnits] = useState(500);
  const [avgTicketSizeCr, setAvgTicketSizeCr] = useState(1.5);
  const [avgCarpetAreaSqft, setAvgCarpetAreaSqft] = useState(850);
  const [timelineMonths, setTimelineMonths] = useState(18);
  const [mix, setMix] = useState({ bhk1: 10, bhk2: 50, bhk3: 30, bhk4: 10 });

  // --- 2. COMMERCIALS ---
  const [commissionPct, setCommissionPct] = useState(4.5);
  const [performanceBonusPct, setPerformanceBonusPct] = useState(0.5);
  const [cpSharePct, setCpSharePct] = useState(1.5); 

  // --- 3. PERSONNEL (Monthly) ---
  const [presalesCount, setPresalesCount] = useState(10);
  const [presalesSalaryL, setPresalesSalaryL] = useState(0.3);
  const [salesCount, setSalesCount] = useState(15);
  const [salesSalaryL, setSalesSalaryL] = useState(0.6);
  const [leadershipCount, setLeadershipCount] = useState(3);
  const [leadershipSalaryL, setLeadershipSalaryL] = useState(1.5);

  // --- 4. MARKETING & OVERHEADS (Monthly) ---
  const [digitalMarketingL, setDigitalMarketingL] = useState(8); 
  const [offlineMarketingL, setOfflineMarketingL] = useState(4); // Print, OOH, Radio
  const [techCrmL, setTechCrmL] = useState(0.5); // LeadSquared, Salesforce
  const [officeTravelL, setOfficeTravelL] = useState(1.5); 

  // --- 5. ONE-TIME SETUP COSTS ---
  const [experienceCenterL, setExperienceCenterL] = useState(30); // Site office setup
  const [launchEventsL, setLaunchEventsL] = useState(15); // CP meets, kickoffs

  const handleMixChange = (key, val) => setMix(prev => ({ ...prev, [key]: val }));

  // --- CALCULATIONS ENGINE ---
  const financials = useMemo(() => {
    // Topline
    const projectValue = totalUnits * avgTicketSizeCr * 10000000;
    const totalCarpetArea = totalUnits * avgCarpetAreaSqft;
    const baseRevenue = projectValue * (commissionPct / 100);
    const bonusRevenue = projectValue * (performanceBonusPct / 100);
    const grossRevenue = baseRevenue + bonusRevenue;
    
    // Leakage (Broker Payout)
    const cpPayout = projectValue * (cpSharePct / 100);
    const netRevenue = grossRevenue - cpPayout; // What mandate company keeps
    
    // Monthly OPEX
    const personnelCostMo = (presalesCount * presalesSalaryL + salesCount * salesSalaryL + leadershipCount * leadershipSalaryL) * 100000;
    const marketingCostMo = (digitalMarketingL + offlineMarketingL) * 100000;
    const overheadCostMo = (techCrmL + officeTravelL) * 100000;
    const totalMonthlyOpex = personnelCostMo + marketingCostMo + overheadCostMo;
    
    const totalOpex = totalMonthlyOpex * timelineMonths;
    const totalOneTime = (experienceCenterL + launchEventsL) * 100000;
    const totalCost = totalOpex + totalOneTime;
    
    // Profitability
    const netProfit = netRevenue - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;
    
    // Break-even Analysis
    const effectiveNetMarginPct = (commissionPct + performanceBonusPct - cpSharePct) / 100;
    const requiredSalesValueToBreakEven = effectiveNetMarginPct > 0 ? totalCost / effectiveNetMarginPct : Infinity;
    const breakEvenUnits = requiredSalesValueToBreakEven / (avgTicketSizeCr * 10000000);
    const breakEvenPercentage = (breakEvenUnits / totalUnits) * 100;

    // Unit Economics
    const totalMarketingSpend = (marketingCostMo * timelineMonths) + totalOneTime; // Includes events & setup as acquisition cost
    const impliedCAC = totalUnits > 0 ? totalMarketingSpend / totalUnits : 0; 

    return {
      projectValue, totalCarpetArea, grossRevenue, baseRevenue, bonusRevenue, cpPayout, netRevenue,
      totalCost, personnelCostMo, marketingCostMo, overheadCostMo, totalMonthlyOpex, totalOneTime,
      netProfit, roi, profitMargin,
      breakEvenUnits, breakEvenPercentage, requiredSalesValueToBreakEven, effectiveNetMarginPct,
      impliedCAC, totalMarketingSpend
    };
  }, [
    totalUnits, avgTicketSizeCr, avgCarpetAreaSqft, timelineMonths,
    commissionPct, performanceBonusPct, cpSharePct,
    presalesCount, presalesSalaryL, salesCount, salesSalaryL, leadershipCount, leadershipSalaryL,
    digitalMarketingL, offlineMarketingL, techCrmL, officeTravelL,
    experienceCenterL, launchEventsL
  ]);

  // --- DYNAMIC INSIGHTS ENGINE ---
  const insights = useMemo(() => {
    let flags = [];
    if (financials.effectiveNetMarginPct <= 0) {
      flags.push({ type: 'danger', text: 'Critical Math Failure: Broker payouts exceed your builder commission. Guaranteed loss regardless of sales.' });
    }
    if (financials.breakEvenPercentage > 50) {
      flags.push({ type: 'warning', text: `High Risk Velocity: You must sell ${Math.ceil(financials.breakEvenUnits)} units (${financials.breakEvenPercentage.toFixed(1)}%) just to cover OPEX. Average mandate safety net is < 35%.` });
    }
    if (financials.impliedCAC > (avgTicketSizeCr * 10000000 * 0.015)) {
      flags.push({ type: 'warning', text: `High CAC: Your implied Marketing Cost per Acquisition is ${formatINR(financials.impliedCAC)}, which is >1.5% of ticket size. Re-evaluate marketing mix.` });
    }
    if (financials.totalMonthlyOpex > (financials.grossRevenue / timelineMonths) * 0.7) {
      flags.push({ type: 'danger', text: 'Burn Rate Alert: Monthly OPEX is dangerously close to your average monthly gross revenue generation. Minimal room for market slumps.' });
    }
    if (financials.roi > 150) {
      flags.push({ type: 'success', text: 'Stellar Economics: If assumptions hold, ROI exceeds 150%. Highly lucrative mandate parameters.' });
    }
    return flags;
  }, [financials, avgTicketSizeCr, timelineMonths]);

  // --- AI SCENARIO GENERATOR ---
  const handleGenerateScenario = async () => {
    if (!scenarioPrompt.trim()) return;
    setIsGeneratingScenario(true);
    setGenError(false);
    
    const apiKey = "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const promptText = `You are an elite real estate underwriter. Based on this project description: "${scenarioPrompt}", predict and generate realistic mandate underwriting parameters.
    Respond ONLY with a raw, valid JSON object (no markdown, no formatting, no text outside the JSON).
    {
      "totalUnits": (number),
      "avgTicketSizeCr": (number, e.g. 1.5),
      "avgCarpetAreaSqft": (number),
      "timelineMonths": (number),
      "mix": { "bhk1": (number), "bhk2": (number), "bhk3": (number), "bhk4": (number) },
      "commissionPct": (number),
      "performanceBonusPct": (number),
      "cpSharePct": (number),
      "presalesCount": (number),
      "salesCount": (number),
      "leadershipCount": (number),
      "digitalMarketingL": (number, monthly in Lakhs),
      "offlineMarketingL": (number, monthly in Lakhs),
      "techCrmL": (number, monthly in Lakhs),
      "experienceCenterL": (number, one time setup in Lakhs),
      "launchEventsL": (number, one time in Lakhs)
    }`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    try {
      let response;
      let delay = 1000;
      for (let i = 0; i < 5; i++) {
        response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
        if (response.ok) break;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (jsonText) {
         // Failsafe cleanup
         jsonText = jsonText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
         const params = JSON.parse(jsonText);
         
         if(params.totalUnits) setTotalUnits(params.totalUnits);
         if(params.avgTicketSizeCr) setAvgTicketSizeCr(params.avgTicketSizeCr);
         if(params.avgCarpetAreaSqft) setAvgCarpetAreaSqft(params.avgCarpetAreaSqft);
         if(params.timelineMonths) setTimelineMonths(params.timelineMonths);
         if(params.mix) setMix(params.mix);
         if(params.commissionPct) setCommissionPct(params.commissionPct);
         if(params.performanceBonusPct !== undefined) setPerformanceBonusPct(params.performanceBonusPct);
         if(params.cpSharePct !== undefined) setCpSharePct(params.cpSharePct);
         if(params.presalesCount) setPresalesCount(params.presalesCount);
         if(params.salesCount) setSalesCount(params.salesCount);
         if(params.leadershipCount !== undefined) setLeadershipCount(params.leadershipCount);
         if(params.digitalMarketingL) setDigitalMarketingL(params.digitalMarketingL);
         if(params.offlineMarketingL !== undefined) setOfflineMarketingL(params.offlineMarketingL);
         if(params.techCrmL) setTechCrmL(params.techCrmL);
         if(params.experienceCenterL) setExperienceCenterL(params.experienceCenterL);
         if(params.launchEventsL) setLaunchEventsL(params.launchEventsL);
         
         setScenarioPrompt(""); 
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
      setGenError(true);
      setTimeout(() => setGenError(false), 3000);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  // --- AI CO-PILOT ENGINE ---
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setShowAiModal(true);
    setAiReport("");

    const apiKey = ""; // The execution environment provides the key at runtime
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const promptText = `Analyze this real estate mandate deal:
    - Project Value: ₹${(financials.projectValue / 10000000).toFixed(2)} Cr
    - Builder Commission: ${commissionPct}% + ${performanceBonusPct}% Bonus
    - Broker Payout (Leakage): ${cpSharePct}%
    - Total Monthly OPEX: ₹${(financials.totalMonthlyOpex / 100000).toFixed(2)} Lakhs over ${timelineMonths} months
    - Setup & Launch Cost: ₹${(financials.totalOneTime / 100000).toFixed(2)} Lakhs
    - Projected Net Profit: ₹${(financials.netProfit / 10000000).toFixed(2)} Cr
    - ROI: ${financials.roi.toFixed(1)}%
    - Break-even Units: ${Math.ceil(financials.breakEvenUnits)} out of ${totalUnits} (${financials.breakEvenPercentage.toFixed(1)}%)
    - Implied CAC: ₹${financials.impliedCAC.toLocaleString('en-IN', {maximumFractionDigits:0})} per unit.

    Give a brutally honest, punchy 3-bullet point strategic recommendation for the Mandate firm's CEO. Tell them whether to sign this term sheet, negotiate, or walk away. Keep it under 100 words. Format with markdown.`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: "You are an elite, aggressive real estate underwriter analyzing mandate deals. You are sharp, direct, and focused strictly on risk, burn rate, and margins. Do not use pleasantries." }] }
    };

    try {
      let response;
      let delay = 1000;
      // Exponential backoff retry
      for (let i = 0; i < 5; i++) {
        response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
        if (response.ok) break;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No insights generated.";
      setAiReport(text);
    } catch (err) {
      setAiReport("⚠️ Quantum AI is currently unavailable or experiencing high traffic. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 font-sans selection:bg-indigo-200 selection:text-indigo-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-2 ring-indigo-50">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">Quantum<span className="text-indigo-600 font-light">Mandate</span></h1>
              <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mt-1">Enterprise Risk & P&L Engine</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPitch(!showPitch)}
            className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 px-5 py-2.5 rounded-full border border-slate-200 hover:border-indigo-200 shadow-sm"
          >
            <Lightbulb className="w-4 h-4" />
            Strategic Rationale
          </button>
        </div>
      </header>

      {/* VALUE PROPOSITION DRAWER */}
      {showPitch && (
        <div className="bg-slate-900 text-white border-b border-slate-800 animate-in slide-in-from-top-4 duration-300 shadow-2xl relative z-40">
          <div className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400"><BriefcaseBusiness className="w-5 h-5"/> Underwriting for Mandates</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">Stop signing terms based on top-line vanity. This engine forces you to account for pre-sales headcount, tech stack, and experience center setups to reveal true net margins and absolute break-even units.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400"><Users className="w-5 h-5"/> Broker Transition Protection</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">Moving from pure brokerage to sole-selling? A 5% commission sounds huge until you realize you bear the digital marketing CAC and CP payouts. Protect your downside before taking the plunge.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400"><Building className="w-5 h-5"/> Developer Empathy Math</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">Use this tool to show builders exactly *why* you need a 5% mandate. Visually prove how much capital you are risking on marketing and salaries to sell their inventory.</p>
            </div>
          </div>
        </div>
      )}

      {/* Removed "items-start" from this grid container so the 5-column right pane
        stretches full height. This prevents the sticky dashboard from scrolling out of view.
      */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE WORKSPACE (7 Cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* AI SCENARIO BUILDER */}
          <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-1 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="bg-slate-950 rounded-[22px] p-6 relative z-10 border border-indigo-500/20">
              <div className="flex items-start gap-4 flex-col md:flex-row">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                  <Wand2 className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-grow w-full">
                  <h2 className="text-lg font-bold text-white mb-1 tracking-tight">AI Auto-Build Scenario</h2>
                  <p className="text-sm text-slate-400 mb-4 font-medium">Describe the project. Quantum AI will instantly predict and set all 15+ benchmark parameters below.</p>
                  
                  <div className="flex gap-2 relative flex-col sm:flex-row">
                    <input 
                      type="text" 
                      value={scenarioPrompt}
                      onChange={(e) => setScenarioPrompt(e.target.value)}
                      placeholder="e.g. 800 luxury villas in Goa, highly dependent on outside brokers..."
                      className="w-full bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateScenario(); }}
                      disabled={isGeneratingScenario}
                    />
                    <button
                      onClick={handleGenerateScenario}
                      disabled={isGeneratingScenario || !scenarioPrompt.trim()}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 flex-shrink-0 w-full sm:w-auto
                        ${genError ? 'bg-rose-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-500'}`}
                    >
                      {isGeneratingScenario ? <Loader2 className="w-4 h-4 animate-spin" /> : (genError ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />)}
                      <span className="">
                        {isGeneratingScenario ? 'Building...' : (genError ? 'Failed!' : 'Generate')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEC 1: INVENTORY MODELING */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 ring-1 ring-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg"><Layers className="w-6 h-6 text-blue-600" /></div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Project & Inventory Model</h2>
                <p className="text-sm text-slate-500 font-medium">Total scale and unit economics.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <SliderField label="Total Number of Units" value={totalUnits} min={50} max={2000} step={10} onChange={setTotalUnits} formatSuffix=" Units" color="blue" icon={Building}/>
              <SliderField label="Avg Ticket Size (Per Unit)" value={avgTicketSizeCr} min={0.2} max={10} step={0.1} onChange={setAvgTicketSizeCr} formatPrefix="₹ " formatSuffix=" Cr" color="blue" icon={Coins}/>
              <div className="md:col-span-2 mt-2">
                <SliderField label="Avg Carpet Area" value={avgCarpetAreaSqft} min={300} max={5000} step={50} onChange={setAvgCarpetAreaSqft} formatSuffix=" Sq.Ft" color="slate" icon={MapPin}/>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-700 tracking-tight mb-4">Unit Typology Weighting (Visual Mix)</p>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">1 BHK</label>
                  <input type="number" value={mix.bhk1} onChange={(e) => handleMixChange('bhk1', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-semibold mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">2 BHK</label>
                  <input type="number" value={mix.bhk2} onChange={(e) => handleMixChange('bhk2', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-semibold mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">3 BHK</label>
                  <input type="number" value={mix.bhk3} onChange={(e) => handleMixChange('bhk3', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-semibold mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">4+ BHK</label>
                  <input type="number" value={mix.bhk4} onChange={(e) => handleMixChange('bhk4', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-semibold mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <UnitMixBar mix={mix} />
            </div>
            
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calculated Project Value</p>
                <p className="text-xl font-black text-slate-800">{formatINR(financials.projectValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Saleable Area</p>
                <p className="text-xl font-black text-slate-800">{(financials.totalCarpetArea).toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-500">Sq.Ft</span></p>
              </div>
            </div>
          </section>

          {/* SEC 2: COMMERCIALS */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 ring-1 ring-slate-100 hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg"><Target className="w-6 h-6 text-emerald-600" /></div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Mandate Commercials</h2>
                <p className="text-sm text-slate-500 font-medium">Inflows and direct broker leakages.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <SliderField label="Builder Base Commission" value={commissionPct} min={1} max={15} step={0.1} onChange={setCommissionPct} formatSuffix="%" helperText="Fixed mandate fee." color="emerald" />
              <SliderField label="Performance/Target Bonus" value={performanceBonusPct} min={0} max={5} step={0.1} onChange={setPerformanceBonusPct} formatSuffix="%" helperText="Kicker for speed/volume." color="emerald" />
            </div>
            <div className="pt-4 mt-2">
              <SliderField label="Channel Partner (CP) Payout" value={cpSharePct} min={0} max={10} step={0.1} onChange={setCpSharePct} formatSuffix="%" helperText="Brokerage passed to market network." color="rose" />
            </div>
          </section>

          {/* SEC 3: HUMAN RESOURCES */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 ring-1 ring-slate-100 hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg"><Users className="w-6 h-6 text-indigo-600" /></div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Resource & Personnel OPEX</h2>
                <p className="text-sm text-slate-500 font-medium">Monthly headcount burn.</p>
              </div>
            </div>
            
            <SliderField label="Project Selling Timeline" value={timelineMonths} min={3} max={48} step={1} onChange={setTimelineMonths} formatSuffix=" Months" helperText="Total months carrying these costs." color="indigo" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-slate-100 mt-2">
              <div>
                <SliderField label="Pre-Sales / Call Center Count" value={presalesCount} min={0} max={100} step={1} onChange={setPresalesCount} color="indigo" icon={Headset}/>
                <SliderField label="Pre-Sales Salary (Avg/Mo)" value={presalesSalaryL} min={0.1} max={1} step={0.05} onChange={setPresalesSalaryL} formatPrefix="₹ " formatSuffix=" L" color="indigo"/>
              </div>
              <div>
                <SliderField label="Sales Closers / Site Staff" value={salesCount} min={0} max={100} step={1} onChange={setSalesCount} color="indigo" icon={Users}/>
                <SliderField label="Closer Salary (Avg/Mo)" value={salesSalaryL} min={0.2} max={3} step={0.1} onChange={setSalesSalaryL} formatPrefix="₹ " formatSuffix=" L" color="indigo"/>
              </div>
              <div className="md:col-span-2 grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                <SliderField label="Leadership / Management Count" value={leadershipCount} min={0} max={20} step={1} onChange={setLeadershipCount} color="indigo" icon={BriefcaseBusiness}/>
                <SliderField label="Leadership Salary (Avg/Mo)" value={leadershipSalaryL} min={0.5} max={10} step={0.25} onChange={setLeadershipSalaryL} formatPrefix="₹ " formatSuffix=" L" color="indigo"/>
              </div>
            </div>
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monthly Payroll</p>
              <p className="text-lg font-black text-indigo-700">{formatINR(financials.personnelCostMo)} <span className="text-sm font-semibold text-slate-500">/ mo</span></p>
            </div>
          </section>

          {/* SEC 4: MARKETING & SETUP */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 ring-1 ring-slate-100 hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg"><Megaphone className="w-6 h-6 text-orange-600" /></div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Marketing & Capital Setup</h2>
                <p className="text-sm text-slate-500 font-medium">Acquisition costs and physical presence.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 pt-2">
              <SliderField label="Digital & Meta Ads (Monthly)" value={digitalMarketingL} min={0} max={100} step={1} onChange={setDigitalMarketingL} formatPrefix="₹ " formatSuffix=" L" color="orange" icon={MonitorSmartphone}/>
              <SliderField label="Print, OOH, Radio (Monthly)" value={offlineMarketingL} min={0} max={100} step={1} onChange={setOfflineMarketingL} formatPrefix="₹ " formatSuffix=" L" color="orange" icon={MapPin}/>
              <SliderField label="Tech Stack / CRM (Monthly)" value={techCrmL} min={0} max={10} step={0.1} onChange={setTechCrmL} formatPrefix="₹ " formatSuffix=" L" color="slate" />
              <SliderField label="Office & Overheads (Monthly)" value={officeTravelL} min={0} max={20} step={0.5} onChange={setOfficeTravelL} formatPrefix="₹ " formatSuffix=" L" color="slate" />
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 bg-orange-50/30 -mx-8 px-8 pb-4 rounded-b-3xl">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">One-Time Capital Expenditure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <SliderField label="Site Experience Center Setup" value={experienceCenterL} min={0} max={300} step={5} onChange={setExperienceCenterL} formatPrefix="₹ " formatSuffix=" L" color="orange" helperText="Sample flats, immersive lounge."/>
                <SliderField label="Mega Launch Events" value={launchEventsL} min={0} max={200} step={5} onChange={setLaunchEventsL} formatPrefix="₹ " formatSuffix=" L" color="orange" helperText="Broker kickoffs, channel partner meets."/>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: STICKY HUD / DASHBOARD (5 Cols) */}
        <div className="xl:col-span-5 relative">
          
          {/* Scrollable sticky wrapper so it works on small laptop heights */}
          <div className="sticky top-24 space-y-6 pb-8 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* The Master Readout (Deep Dark Glassmorphism) */}
            <div className="bg-slate-950 text-white rounded-3xl shadow-2xl shadow-indigo-900/20 overflow-hidden relative border border-slate-800">
              {/* Glossy gradient effects */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500 opacity-10 rounded-full blur-[100px]"></div>
              </div>

              <div className="p-8 relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-slate-400 font-bold tracking-[0.2em] text-[10px] uppercase flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400"/> Live Financial Output
                  </h3>
                  <div className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-md text-xs font-bold text-white border border-white/10">
                    {timelineMonths} Mo. Projection
                  </div>
                </div>
                
                <div className="mb-10">
                  <p className="text-slate-400 text-sm font-semibold mb-2 uppercase tracking-wider">Projected Net Profit</p>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-6xl lg:text-7xl font-black tracking-tighter ${financials.netProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>
                      {financials.netProfit >= 0 ? '' : '-'}{formatINR(Math.abs(financials.netProfit))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-slate-800/80">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Return on Inv (ROI)</p>
                    <p className={`text-3xl font-black tracking-tight ${financials.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {financials.roi.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Net Margin (Rev)</p>
                    <p className={`text-3xl font-black tracking-tight ${financials.profitMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {financials.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Capital Flow Waterfall */}
                <div className="space-y-4 font-medium">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">Gross Revenue <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">In</span></span>
                    <span className="font-bold text-slate-200">{formatINR(financials.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      CP Payouts <span className="text-[10px] bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded">Out</span>
                    </span>
                    <span className="font-bold text-rose-400">-{formatINR(financials.cpPayout)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      Total Burn (OPEX + Setup) <span className="text-[10px] bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded">Out</span>
                    </span>
                    <span className="font-bold text-rose-400">-{formatINR(financials.totalCost)}</span>
                  </div>
                </div>
              </div>
              
              {/* Secondary Metrics Footer */}
              <div className="bg-black/40 backdrop-blur-xl border-t border-slate-800/80 p-6 relative z-10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Break-even Point</p>
                  <p className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                    {financials.breakEvenUnits !== Infinity ? Math.ceil(financials.breakEvenUnits) : 'N/A'}
                    <span className="text-sm font-semibold text-slate-500">Units</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Implied CAC</p>
                  <p className="text-xl font-bold text-orange-400 tracking-tight">
                    {formatINR(financials.impliedCAC)}<span className="text-xs text-slate-500">/unit</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Insights Engine */}
            {insights.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-slate-900 tracking-tight">Intelligence Engine</h3>
                </div>
                {insights.map((insight, i) => (
                  <div key={i} className={`p-4 rounded-2xl text-sm font-semibold leading-relaxed flex items-start gap-3 border shadow-sm
                    ${insight.type === 'danger' ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-100/50' : ''}
                    ${insight.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-amber-100/50' : ''}
                    ${insight.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-100/50' : ''}
                  `}>
                    <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 
                      ${insight.type === 'danger' ? 'text-rose-500' : ''}
                      ${insight.type === 'warning' ? 'text-amber-500' : ''}
                      ${insight.type === 'success' ? 'text-emerald-500' : ''}
                    `} />
                    <p>{insight.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* SEC 5: NEGOTIATION MATRIX (Moved to the Right Pane) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 ring-1 ring-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500 opacity-5 rounded-full blur-[60px] transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
              
              <div className="mb-5">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500" /> Builder Squeeze Stress Test
                </h2>
                <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">
                  At the final table, builders compress your base commission. See how drops affect your absolute break-even point.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="px-3 py-3 border-b border-slate-200">Comm. Drop</th>
                      <th className="px-3 py-3 border-b border-slate-200 text-right">Net Profit</th>
                      <th className="px-3 py-3 border-b border-slate-200 text-right">Break-Even</th>
                      <th className="px-3 py-3 border-b border-slate-200 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {[0, 0.5, 1.0, 1.5, 2.0].map((drop, idx) => {
                      const testComm = commissionPct - drop;
                      const testBaseRev = financials.projectValue * (testComm / 100);
                      const testNetRev = (testBaseRev + financials.bonusRevenue) - financials.cpPayout;
                      const testProfit = testNetRev - financials.totalCost;
                      const testNetMargin = (testComm + performanceBonusPct - cpSharePct) / 100;
                      
                      const reqSalesVal = testNetMargin > 0 ? financials.totalCost / testNetMargin : Infinity;
                      const testBEUnits = reqSalesVal / (avgTicketSizeCr * 10000000);
                      
                      const isBase = drop === 0;

                      return (
                        <tr key={idx} className={`transition-colors hover:bg-slate-50 ${isBase ? 'bg-indigo-50/40' : ''}`}>
                          <td className="px-3 py-3 font-bold text-slate-900 flex items-center gap-2">
                            {testComm.toFixed(1)}% 
                            {isBase && <span className="text-[9px] uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm shadow-sm">Current</span>}
                            {!isBase && <span className="text-[9px] font-bold text-rose-600 flex items-center bg-rose-50 px-1.5 py-0.5 rounded-sm border border-rose-100"><TrendingDown className="w-2.5 h-2.5 mr-0.5"/>-{drop}%</span>}
                          </td>
                          <td className={`px-3 py-3 text-right font-bold tracking-tight ${testProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {testProfit >= 0 ? '+' : '-'}{formatINR(Math.abs(testProfit))}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-700">
                             {testBEUnits !== Infinity && testBEUnits > 0 ? (
                               <span className={testBEUnits > totalUnits ? 'text-rose-500' : ''}>
                                 {Math.ceil(testBEUnits)} / {totalUnits}
                               </span>
                             ) : <span className="text-rose-500">Impossible</span>}
                          </td>
                          <td className="px-3 py-3 flex justify-center">
                            {testProfit >= 0 ? (
                              testBEUnits > totalUnits ? (
                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 tooltip" title="Requires >100% sales to break even">
                                  <AlertCircle className="w-3 h-3"/>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 ring-2 ring-emerald-50">
                                  <CheckCircle2 className="w-3 h-3"/>
                                </div>
                              )
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 ring-2 ring-rose-50">
                                <AlertCircle className="w-3 h-3"/>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Co-Pilot Trigger */}
            <button
              onClick={runAIAnalysis}
              className="w-full relative group overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-1 rounded-3xl shadow-xl transition-all hover:scale-[1.02] hover:shadow-indigo-900/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity blur"></div>
              <div className="relative bg-slate-950 text-white rounded-[22px] p-5 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold tracking-tight">Quantum AI Analyst</p>
                    <p className="text-xs text-slate-400">Generate CEO Deal Memo</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </button>

          </div>
        </div>
      </main>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAiModal(false)}></div>
          <div className="bg-slate-950 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Deal Analyst</h3>
                  <p className="text-xs text-slate-400">Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 min-h-[200px]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-indigo-400 py-8">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-sm font-semibold tracking-wider uppercase">Synthesizing Deal Math...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm prose-indigo max-w-none">
                  {/* Using a simple custom parser for markdown to avoid adding heavy libraries */}
                  {aiReport.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) return <h4 key={i} className="text-indigo-300 font-bold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <div key={i} className="flex gap-3 mb-3">
                          <span className="text-indigo-500 mt-1 flex-shrink-0">•</span>
                          <span dangerouslySetInnerHTML={{__html: line.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}} />
                        </div>
                      );
                    }
                    return line ? <p key={i} dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}} className="mb-3" /> : null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
