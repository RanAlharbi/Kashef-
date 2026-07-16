/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LearningLesson } from '../types';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  HelpCircle, 
  ShieldAlert,
  ListFilter
} from 'lucide-react';

export const LearningCenter: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [lessons, setLessons] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Quiz progress states
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [quizCorrect, setQuizCorrect] = useState<Record<string, boolean>>({});

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learning/lessons');
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleOptionSelect = (lessonId: string, idx: number) => {
    if (quizSubmitted[lessonId]) return;
    setUserAnswers(prev => ({ ...prev, [lessonId]: idx }));
  };

  const handleQuizSubmit = async (lessonId: string) => {
    const selectedIdx = userAnswers[lessonId];
    if (selectedIdx === undefined) return;

    try {
      const response = await fetch('/api/learning/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, selectedIndex: selectedIdx }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuizSubmitted(prev => ({ ...prev, [lessonId]: true }));
        setQuizCorrect(prev => ({ ...prev, [lessonId]: data.correct }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetQuiz = (lessonId: string) => {
    setQuizSubmitted(prev => ({ ...prev, [lessonId]: false }));
    setQuizCorrect(prev => ({ ...prev, [lessonId]: false }));
    setUserAnswers(prev => {
      const updated = { ...prev };
      delete updated[lessonId];
      return updated;
    });
  };

  const categories = ['all', 'Phishing', 'MFA & Passwords'];

  const filteredLessons = selectedCategory === 'all' 
    ? lessons 
    : lessons.filter(l => l.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-slate-100">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-rose-500" />
            <span>{isRtl ? 'أكاديمية كاشف للتوعية الأمنية' : 'Cybersecurity Defense Academy'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isRtl ? 'دروس تفاعلية مبسطة واختبارات حية لتعزيز حصانتك الرقمية وحماية هويتك' : 'Interactive bite-sized cybersecurity courses and evaluations to elevate your digital resilience.'}
          </p>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 border border-slate-800 rounded-xl text-xs">
          <ListFilter className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="academy-category-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? (isRtl ? 'كل الأقسام' : 'All Academies') : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-60 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-60 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredLessons.map((lesson) => {
            const hasSubmitted = quizSubmitted[lesson.id];
            const isCorrectAnswer = quizCorrect[lesson.id];
            const selectedOpt = userAnswers[lesson.id];

            return (
              <div 
                key={lesson.id} 
                id={`lesson-card-${lesson.id}`}
                className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
              >
                {/* Course Content Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded">
                      {lesson.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isRtl ? lesson.durationAr : lesson.durationEn}</span>
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {isRtl ? lesson.titleAr : lesson.titleEn}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {isRtl ? lesson.contentAr : lesson.contentEn}
                  </p>
                </div>

                {/* Course Interactive Evaluation column */}
                <div className="lg:col-span-5 bg-slate-950/80 border border-slate-900 rounded-xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-rose-500" />
                      <span>{t.startQuiz}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white leading-snug">
                      {isRtl ? lesson.quiz.questionAr : lesson.quiz.questionEn}
                    </h4>

                    {/* Radio Options */}
                    <div className="space-y-2">
                      {(isRtl ? lesson.quiz.optionsAr : lesson.quiz.optionsEn).map((opt, idx) => {
                        const isSelected = selectedOpt === idx;
                        let optionClass = "border-slate-850 hover:border-slate-700 bg-slate-900/50";
                        
                        if (isSelected) optionClass = "border-rose-500 bg-rose-500/10 text-rose-400 font-semibold";
                        if (hasSubmitted && idx === lesson.quiz.correctIndex) {
                          optionClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold";
                        } else if (hasSubmitted && isSelected && !isCorrectAnswer) {
                          optionClass = "border-rose-600 bg-rose-600/15 text-rose-500 font-bold";
                        }

                        return (
                          <button
                            id={`option-btn-${lesson.id}-${idx}`}
                            key={idx}
                            disabled={hasSubmitted}
                            onClick={() => handleOptionSelect(lesson.id, idx)}
                            className={`w-full p-3 border rounded-xl text-xs text-left transition duration-200 ${optionClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit / Reset feedback container */}
                  <div className="mt-6 pt-4 border-t border-slate-900">
                    {!hasSubmitted ? (
                      <button
                        id={`submit-quiz-${lesson.id}`}
                        disabled={selectedOpt === undefined}
                        onClick={() => handleQuizSubmit(lesson.id)}
                        className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 font-bold text-xs text-white rounded-xl shadow-lg transition disabled:opacity-50"
                      >
                        {isRtl ? 'تأكيد وإرسال الإجابة' : 'Submit Practice Answer'}
                      </button>
                    ) : (
                      <div className="space-y-4 text-xs animate-fade-in">
                        <div className="flex items-center gap-2 font-bold">
                          {isCorrectAnswer ? (
                            <div className="text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              <span>{t.correct}</span>
                            </div>
                          ) : (
                            <div className="text-rose-500 flex items-center gap-1.5">
                              <XCircle className="w-5 h-5 text-rose-500" />
                              <span>{t.incorrect}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-850">
                          {isRtl ? lesson.quiz.explanationAr : lesson.quiz.explanationEn}
                        </p>

                        <button
                          id={`reset-quiz-${lesson.id}`}
                          onClick={() => resetQuiz(lesson.id)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-lg transition"
                        >
                          {isRtl ? 'إعادة المحاولة' : 'Try Another Practice'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLessons.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">
              {isRtl ? 'لا توجد دروس حالياً' : 'No lessons available in this category yet'}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
