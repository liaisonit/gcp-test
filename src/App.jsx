import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Baby, 
  Globe, 
  Copy, 
  Check, 
  AlertCircle, 
  Wand2, 
  Sparkles,
  AlignLeft
} from 'lucide-react';

const DEFAULT_INPUT = `Spacious 3 BHK apartment in Baner, Pune. 1500 sq ft carpet area. Includes modular kitchen, vitrified tiles, 2 balconies with good views. Society has a swimming pool, clubhouse, 24/7 security guards, CCTV, and kids play area. 15 mins driving distance from Hinjewadi IT park. Nearby reputed schools, supermarkets, and hospitals. Price: 1.5 Cr.`;

const PERSONAS = [
  {
    id: 'tech-exec',
    label: 'Tech Executive',
    description: 'Sleek, modern, and time-saving focus.',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    ring: 'ring-blue-600',
    prompt: `Rewrite the property description to deeply appeal to a high-earning Tech Executive. Focus on: Proximity to tech hubs, smart-home readiness, premium aesthetics, and time-saving amenities. Adopt a sleek, professional, and confident tone. Keep it concise with short paragraphs and bullet points.`
  },
  {
    id: 'young-family',
    label: 'Young Family',
    description: 'Warm, secure, and community-focused.',
    icon: Baby,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    ring: 'ring-rose-600',
    prompt: `Rewrite the property description to deeply appeal to a Young Family with small children. Focus on: Security (guards, CCTV), proximity to schools/hospitals, kid-friendly areas, and a nurturing environment. Adopt a warm, reassuring, and emotional tone. Keep it concise with short paragraphs and bullet points.`
  },
  {
    id: 'nri-investor',
    label: 'NRI Investor',
    description: 'Analytical, ROI, and low-maintenance focus.',
    icon: Globe,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    ring: 'ring-emerald-600',
    prompt: `Rewrite the property description to deeply appeal to an NRI (Non-Resident Indian) Investor. Focus on: ROI, high rental yield potential, capital appreciation, low maintenance, and trusted security. Adopt a highly analytical, financially-driven tone. Keep it concise with short paragraphs and bullet points.`
  }
];

const LOADING_QUOTES = [
  "Analyzing demographic psychographics...",
  "Restructuring narrative arcs...",
  "Optimizing emotional triggers...",
  "Aligning features with core desires...",
  "Polishing the final pitch..."
];

// Gemini API configuration
const apiKey = ""; // The execution environment provides the key at runtime

const generateAIResponse = async (inputText, personaPrompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const systemInstruction = "You are an elite real estate copywriter. Your job is to take boring property facts and translate them into a highly targeted, persuasive pitch based on the requested persona. Keep it concise, punchy, and formatted with short paragraphs and bullet points.";

  const payload = {
    contents: [{ parts: [{ text: `Original Property Description:\n${inputText}\n\nTask: ${personaPrompt}` }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let attempt = 0; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No content generated.";
    } catch (error) {
      if (attempt === 5) throw new Error("Failed to connect to the AI engine. Please try again later.");
      await sleep(delays[attempt]);
    }
  }
};

export default function App() {
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]); // For UI selection
  const [activePersona, setActivePersona] = useState(null); // The persona currently rendered in output
  
  const [outputPitch, setOutputPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const outputRef = useRef(null);

  // Rotate quotes while generating
  useEffect(() => {
    let quoteInterval;
    if (isGenerating) {
      setQuoteIndex(0);
      quoteInterval = setInterval(() => {
        setQuoteIndex(q => (q + 1) % LOADING_QUOTES.length);
      }, 2000);
    }
    return () => clearInterval(quoteInterval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setCopied(false);
    setActivePersona(selectedPersona);

    // Scroll to output on mobile
    if (window.innerWidth < 1024 && outputRef.current) {
      setTimeout(() => outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    try {
      // Artificial delay for smooth UX transition
      const [result] = await Promise.all([
        generateAIResponse(inputText, selectedPersona.prompt),
        new Promise(resolve => setTimeout(resolve, 1500)) 
      ]);
      setOutputPitch(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (outputPitch) {
      document.execCommand('copy'); 
      navigator.clipboard.writeText(outputPitch).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simple formatter to handle basic markdown (bold and bullets)
  const renderFormattedText = (text) => {
    return text.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return <div key={idx} className="h-2" />;
      
      const formattedLines = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      const animationStyle = { animationFillMode: 'both', animationDelay: `${idx * 50}ms` };
      
      if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex space-x-3 my-2.5 items-start text-gray-700 animate-slide-up" style={animationStyle}>
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${activePersona?.bgColor.replace('bg-', 'bg-').replace('50', '400') || 'bg-gray-400'}`} />
            <span className="flex-1 leading-relaxed text-[13px]">{formattedLines[0].replace(/^[-*]\s/, '')}{formattedLines.slice(1)}</span>
          </div>
        );
      }
      
      return <p key={idx} className="mb-3 text-gray-700 leading-relaxed text-[13px] animate-slide-up" style={animationStyle}>{formattedLines}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-inter selection:bg-blue-100 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        
        /* Smooth Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-float { animation: subtleFloat 3s ease-in-out infinite; }
      `}} />

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-[10px] flex items-center justify-center shadow-md shadow-gray-900/20 transform transition hover:scale-105 hover:rotate-3">
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-gray-900">ContextShifter</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10 animate-slide-up">
        
        {/* Header Section */}
        <div className="max-w-2xl mb-10 text-center mx-auto sm:text-left sm:mx-0">
          <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 sm:text-[32px] mb-2.5">
            Write once. Sell to everyone.
          </h1>
          <p className="text-[14px] text-gray-500 leading-relaxed font-light">
            Watch AI dynamically mold standard property facts to match the exact psychology of different buyer personas.
          </p>
        </div>

        {/* 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Input & Controls (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
            
            {/* Step 1: Input */}
            <section className="bg-white rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col h-[280px] transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between bg-white">
                <h2 className="text-[13px] font-medium text-gray-700 flex items-center tracking-tight">
                  <span className="bg-gray-100 text-gray-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] mr-2 font-semibold">1</span>
                  Source Description
                </h2>
                <button 
                  onClick={() => setInputText('')}
                  className="text-[11px] font-medium text-gray-400 hover:text-gray-800 transition-colors"
                >
                  Clear text
                </button>
              </div>
              <textarea
                className="flex-1 w-full p-5 bg-transparent border-none resize-none focus:ring-0 text-[13px] text-gray-700 leading-relaxed placeholder-gray-300 outline-none font-light"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste standard, feature-heavy property facts here..."
                spellCheck="false"
              />
              <div className="px-5 py-2.5 border-t border-gray-50 bg-white text-[10px] text-gray-300 text-right uppercase tracking-wider font-medium">
                {inputText.length} chars
              </div>
            </section>

            {/* Step 2: Target Audience Selection */}
            <section>
              <h2 className="text-[13px] font-medium text-gray-700 flex items-center tracking-tight mb-3">
                <span className="bg-gray-100 text-gray-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] mr-2 font-semibold">2</span>
                Select Target Audience
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {PERSONAS.map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  const Icon = persona.icon;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona)}
                      className={`group text-left flex items-start p-3.5 rounded-[14px] border transition-all duration-300 ease-out transform hover:-translate-y-0.5 ${
                        isSelected 
                          ? `border-${persona.ring.split('-')[1]}-200 ${persona.bgColor} shadow-sm ring-1 ring-${persona.ring.split('-')[1]}-500/20` 
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]'
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-colors duration-300 ${isSelected ? `bg-white shadow-sm text-${persona.ring.split('-')[1]}-600` : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100'}`}>
                        <Icon className="w-4 h-4" strokeWidth={isSelected ? 2 : 1.5} />
                      </div>
                      <div className="ml-3.5 flex-1">
                        <h3 className={`font-medium text-[13px] tracking-tight transition-colors duration-300 ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {persona.label}
                        </h3>
                        <p className={`text-[11px] mt-0.5 font-light transition-colors duration-300 ${isSelected ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {persona.description}
                        </p>
                      </div>
                      <div className={`ml-auto w-4 h-4 rounded-full border flex items-center justify-center mt-1 transition-all duration-300 ${
                        isSelected ? `border-${persona.ring.split('-')[1]}-500 bg-${persona.ring.split('-')[1]}-500 scale-110` : 'border-gray-200 bg-gray-50 group-hover:border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className={`w-full py-3.5 rounded-[14px] text-white font-medium text-[13px] flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg outline-none
                ${(!inputText.trim() || isGenerating) 
                  ? 'bg-gray-200 cursor-not-allowed text-gray-400 shadow-none' 
                  : 'bg-gray-900 hover:bg-black hover:shadow-gray-900/30 hover:-translate-y-0.5 active:scale-[0.98] ring-offset-2 focus:ring-2 focus:ring-gray-900'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-[2px] border-gray-400 border-t-white rounded-full animate-spin" />
                  <span className="tracking-wide">Synthesizing Pitch...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span className="tracking-wide">Generate Tailored Pitch</span>
                </>
              )}
            </button>
            
          </div>

          {/* RIGHT COLUMN: Output (Spans 7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[550px]" ref={outputRef}>
            <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-hidden relative transition-all duration-500">
              
              {/* Output Header */}
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white z-10">
                <h2 className="text-[13px] font-medium text-gray-700 flex items-center tracking-tight">
                  <AlignLeft className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  Generated Result
                </h2>
                <div className="flex items-center">
                  {activePersona && !isGenerating && !error && outputPitch && (
                    <span className={`animate-slide-up px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${activePersona.bgColor} ${activePersona.color} border-${activePersona.ring.split('-')[1]}-200/50`}>
                      Target: {activePersona.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Output Content Area */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col relative overflow-y-auto bg-gradient-to-b from-white to-gray-50/30">
                
                {/* Empty State */}
                {!outputPitch && !isGenerating && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-slide-up">
                    <div className="w-16 h-16 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center mb-5 animate-float shadow-inner">
                      <Sparkles className="w-6 h-6 text-gray-300" />
                    </div>
                    <h3 className="text-gray-800 font-medium mb-1.5 text-[14px]">Ready to transform your copy</h3>
                    <p className="text-gray-400 text-[12px] max-w-xs leading-relaxed font-light">
                      Select an audience on the left and click Generate to see the personalized pitch appear here.
                    </p>
                  </div>
                )}

                {/* Loading Skeleton State */}
                {isGenerating && (
                  <div className="flex-1 flex flex-col animate-pulse relative z-0">
                    <div className="flex items-center space-x-4 mb-7">
                      <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                      <div className="space-y-2.5">
                        <div className="h-3 bg-gray-100 rounded w-40"></div>
                        <div className="h-2 bg-gray-100 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-3.5 mb-8">
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                      <div className="h-3 bg-gray-100 rounded w-[92%]"></div>
                      <div className="h-3 bg-gray-100 rounded w-[96%]"></div>
                      <div className="h-3 bg-gray-100 rounded w-[85%]"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div><div className="h-3 bg-gray-100 rounded w-3/4"></div></div>
                      <div className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div><div className="h-3 bg-gray-100 rounded w-5/6"></div></div>
                      <div className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div><div className="h-3 bg-gray-100 rounded w-2/3"></div></div>
                    </div>
                    
                    {/* Floating quote overlay during loading */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-xl z-10">
                      <div className="bg-white px-5 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center space-x-3 transform transition-all animate-slide-up">
                        <div className="w-3.5 h-3.5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[12px] font-medium text-gray-700 transition-opacity duration-300 tracking-tight">
                          {LOADING_QUOTES[quoteIndex]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !isGenerating && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-50/50 rounded-[16px] border border-red-100 animate-slide-up">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-red-800 font-medium mb-1 text-[13px]">Generation Failed</h3>
                    <p className="text-red-600/80 text-[12px] max-w-sm font-light">{error}</p>
                  </div>
                )}

                {/* Success State */}
                {outputPitch && !isGenerating && !error && (
                  <div className="flex-1 overflow-visible">
                    {renderFormattedText(outputPitch)}
                  </div>
                )}

              </div>
              
              {/* Output Footer Actions */}
              {outputPitch && !isGenerating && !error && (
                <div className="px-6 py-3.5 border-t border-gray-50 bg-white flex justify-end z-10">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-[12px] font-medium transition-all duration-300 ease-out border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      copied 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus:ring-green-500/50' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm focus:ring-gray-200'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
