
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import { AppStage, TravelData, AssistantResponse } from './types';
import { getTravelAssistance } from './services/geminiService';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.WELCOME);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) return;

    setLoading(true);
    setError(null);
    try {
      const assistance = await getTravelAssistance({ source, destination });
      setResult(assistance);
      setStage(AppStage.RESULTS);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStage(AppStage.INPUT);
    setResult(null);
    setDestination('');
  };

  if (stage === AppStage.WELCOME) {
    return <WelcomeScreen onComplete={() => setStage(AppStage.INPUT)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-blue-800 flex items-center gap-3">
          <i className="fa-solid fa-map-location-dot"></i>
          Travel Baddy Assistant
        </h1>
        <p className="text-slate-500 mt-2">স্মার্ট এআই ট্রাভেল গাইড</p>
      </header>

      <main className="w-full max-w-xl">
        {stage === AppStage.INPUT && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="gradient-bg p-6 text-white">
              <h2 className="text-xl font-semibold">আপনার যাত্রার বিবরণ দিন</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">আমি কোথা থেকে যাব (Source)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="fa-solid fa-circle-dot"></i>
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="উদা: ঢাকা"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">কোথায় যাব (Destination)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
                    <i className="fa-solid fa-location-dot"></i>
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="উদা: রমনা পার্ক বা কক্সবাজার"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg flex items-center justify-center gap-3 ${
                  loading ? 'bg-slate-400' : 'gradient-bg hover:scale-[1.02] active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i>
                    তথ্য খোঁজা হচ্ছে...
                  </>
                ) : (
                  <>
                    সাবমিট করুন
                    <i className="fa-solid fa-paper-plane"></i>
                  </>
                )}
              </button>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <i className="fa-solid fa-triangle-exclamation mt-1"></i>
                  {error}
                </div>
              )}
            </form>
          </div>
        )}

        {stage === AppStage.RESULTS && result && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="gradient-bg p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">আপনার ট্রাভেল আপডেট</h2>
                  <p className="text-sm opacity-80">{source} থেকে {destination}</p>
                </div>
                <button onClick={handleReset} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg text-white">
                  <i className="fa-solid fa-rotate-left"></i>
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-inner">
                    {result.trafficInfo}
                  </div>
                </div>

                {result.groundingLinks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">সূত্র (References)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.groundingLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-100"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          <span className="truncate">{link.title || 'Source'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
              অন্য কোনো জায়গার তথ্য দেখুন
            </button>
          </div>
        )}
      </main>

      <footer className="mt-16 text-slate-400 text-sm">
        &copy; 2024 Travel Baddy Assistant | All Rights Reserved
      </footer>
    </div>
  );
};

export default App;
