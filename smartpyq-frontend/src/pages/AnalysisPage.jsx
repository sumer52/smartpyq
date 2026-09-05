import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const cardUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } } };


const AnalysisPage = () => {
  const [papers, setPapers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPapers({ paper_status: 'APPROVED' })
      .then(d => setPapers(Array.isArray(d) ? d : d.papers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const togglePaper = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const runAnalysis = async () => {
    if (selected.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await api.startAnalysis(selected);
      setResult(res);
    } catch (err) { console.error(err); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paper Analysis</h1>
          <p className="text-gray-400">Select papers to extract questions, detect repeated patterns, and identify the most frequently tested topics.</p>
        </motion.div>

        {result ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">&#10003;</div>
            <h2 className="text-2xl font-bold text-white mb-2">Analysis Complete</h2>
            <p className="text-gray-300 mb-1">{result.questions_extracted} questions extracted</p>
            <p className="text-gray-300 mb-6">{result.repeated_groups} repeated groups found</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/repeated-questions')}
                className="btn btn-primary px-6 py-2">View Repeated Questions</button>
              <button onClick={() => { setResult(null); setSelected([]); }}
                className="btn btn-secondary px-6 py-2">Analyze More</button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Select Papers for Analysis</h2>
              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : papers.length === 0 ? (
                <p className="text-gray-400">No papers available for analysis yet. Upload question papers and they will appear here.</p>
              ) : (
                <div className="space-y-2">
                  {papers.map(p => (
                    <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer min-h-[48px]">
                      <input type="checkbox" checked={selected.includes(p.id)}
                        onChange={() => togglePaper(p.id)} className="w-4 h-4 rounded" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{p.title || p.subject || 'Untitled'}</p>
                        <p className="text-gray-500 text-xs">{p.subject} - {p.year}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button onClick={runAnalysis} disabled={selected.length === 0 || analyzing}
              className="btn btn-primary btn-block py-3">
              {analyzing ? 'Analyzing...' : 'Analyze ' + selected.length + ' Paper(s)'}
            </button>
          </>
        )}
      </main>
    </div>
  );
};
export default AnalysisPage;
