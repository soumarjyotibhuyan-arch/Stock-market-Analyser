import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, TrendingUp, Search, AlertCircle } from 'lucide-react';
import { SYSTEM_PROMPT } from './prompt';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [stock, setStock] = useState('');
  const [horizon, setHorizon] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock || !horizon) return;
    
    setStep('loading');
    setError('');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Stock: ${stock}\nInvestment Horizon: ${horizon}`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true },
          temperature: 0.2
        }
      });
      
      let html = response.text || '';
      
      // Clean up markdown code blocks if any
      html = html.replace(/```html/g, '').replace(/```/g, '');
      
      setHtmlContent(html);
      setStep('result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate report.');
      setStep('input');
    }
  };

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h1 className="font-semibold text-gray-900">Fundamental Report</h1>
          </div>
          <button 
            onClick={() => setStep('input')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            New Analysis
          </button>
        </div>
        <div className="flex-1 w-full max-w-4xl mx-auto bg-white shadow-sm">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full min-h-[800px] border-0"
            sandbox="allow-scripts"
            title="Fundamental Report"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-green-50/50 border-b border-green-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Indian Stock Fundamental Analyser</h1>
          </div>
          <p className="text-green-800 font-medium">For Long-Term Investors</p>
        </div>

        <div className="p-6">
          <p className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
            <span>👋</span> Tell me two things and I'll build your full fundamental report:
          </p>

          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-3">
              <label className="block">
                <span className="text-base font-semibold text-gray-900 block mb-1">1. Which stock?</span>
                <span className="text-sm text-gray-500 block mb-2">Company name or NSE/BSE ticker — e.g. TCS · RELIANCE · HDFCBANK</span>
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Enter stock name or ticker..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    required
                    disabled={step === 'loading'}
                  />
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-base font-semibold text-gray-900 block mb-1">2. Investment horizon?</span>
                <span className="text-sm text-gray-500 block mb-2">How many years are you planning to stay invested?</span>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {['3 Years', '5 Years', '10 Years'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorizon(h)}
                      disabled={step === 'loading'}
                      className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                        horizon === h 
                          ? 'bg-green-50 border-green-500 text-green-700' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                
                <input
                  type="text"
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                  placeholder="...or type your own (e.g. 7 Years)"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  required
                  disabled={step === 'loading'}
                />
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={step === 'loading' || !stock || !horizon}
              className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {step === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Silently researching...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
