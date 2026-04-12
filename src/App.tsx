/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2,
  Loader2,
  Zap,
  ArrowLeft
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { calculatePillars, ELEMENT_COLORS, ELEMENTS } from "@/src/lib/saju";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [step, setStep] = useState<"input" | "loading" | "result">("input");
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    gender: "male",
    isLunar: "solar"
  });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [pillars, setPillars] = useState<any>(null);

  const t = {
    ko: {
      title: "SAJU MASTER",
      subtitle: "AI가 분석하는 당신의 갓생 가이드.",
      inputTitle: "내 정보 입력하기",
      inputDesc: "당신의 운명을 읽기 위한 최소한의 힌트",
      name: "이름",
      namePlaceholder: "이름이 뭐야?",
      gender: "성별",
      male: "남성",
      female: "여성",
      birthDate: "생년월일",
      calendarType: "양력/음력",
      solar: "양력",
      lunar: "음력",
      birthTime: "태어난 시간 (선택)",
      analyzeBtn: "분석 시작하기",
      loadingTitle: "데이터 동기화 중...",
      loadingDesc: "우주의 기운을 디지털로 변환하고 있어!",
      resultTitle: "Analysis Result",
      retryBtn: "다시 하기",
      copyUrl: "앱 주소 복사하기",
      copyResult: "결과 공유하기",
      copySuccess: "앱 주소가 복사되었습니다! 친구들에게 공유해보세요. ✨",
      shareSuccess: "분석 결과와 주소가 복사되었습니다! 💌",
      disclaimer: "본 서비스는 재미로 보는 AI 분석입니다. 당신의 운명은 당신의 선택으로 만들어집니다. 갓생 화이팅!",
      hour: "시주", day: "일주", month: "월주", year: "년주",
      stem: "천간", branch: "지지"
    },
    en: {
      title: "SAJU MASTER",
      subtitle: "AI-Powered Guide to Your Destiny.",
      inputTitle: "Enter Your Info",
      inputDesc: "A few hints to read your destiny",
      name: "Name",
      namePlaceholder: "What's your name?",
      gender: "Gender",
      male: "Male",
      female: "Female",
      birthDate: "Birth Date",
      calendarType: "Solar/Lunar",
      solar: "Solar",
      lunar: "Lunar",
      birthTime: "Birth Time (Optional)",
      analyzeBtn: "Start Analysis",
      loadingTitle: "Syncing Data...",
      loadingDesc: "Converting cosmic energy into digital insights!",
      resultTitle: "Analysis Result",
      retryBtn: "Retry",
      copyUrl: "Copy App Link",
      copyResult: "Share Result",
      copySuccess: "App link copied! Share it with friends. ✨",
      shareSuccess: "Result and link copied! 💌",
      disclaimer: "This service is for entertainment purposes. Your destiny is shaped by your choices. Good luck!",
      hour: "Hour", day: "Day", month: "Month", year: "Year",
      stem: "Stem", branch: "Branch"
    }
  }[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startAnalysis = async () => {
    if (!process.env.GEMINI_API_KEY) {
      alert("Gemini API Key is not set.");
      return;
    }

    setStep("loading");
    
    try {
      const prompt = language === "ko" ? `
        당신은 MZ세대의 언어와 감성을 잘 아는 힙한 사주 명리학자입니다. 다음 정보를 바탕으로 사주 분석을 해주세요.
        이름: ${formData.name}
        생년월일: ${formData.birthDate} (${formData.isLunar === "lunar" ? "음력" : "양력"})
        생시: ${formData.birthTime || "모름"}
        성별: ${formData.gender === "male" ? "남성" : "여성"}

        분석 내용:
        1. 사주 팔자 (천간/지지 8글자)
        2. 성격 및 특징 (요즘 트렌드에 맞는 키워드 사용)
        3. 재물운, 건강운, 연애운, 직업운 상세 분석
        4. 향후 10년 대운 흐름 및 오늘의 럭키 아이템/컬러

        응답은 반드시 다음 JSON 형식을 포함해야 합니다:
        {
          "pillars": {
            "year": { "stem": "천간", "branch": "지지" },
            "month": { "stem": "천간", "branch": "지지" },
            "day": { "stem": "천간", "branch": "지지" },
            "hour": { "stem": "천간", "branch": "지지" }
          },
          "analysis": "전체 분석 텍스트 (마크다운 형식, 이모지 적극 활용)"
        }

        답변은 한국어로, 친근하면서도 전문성 있는 '반말' 또는 '해요체'를 적절히 섞어 힙하게 작성해주세요.
      ` : `
        You are a hip and professional Saju (Four Pillars of Destiny) master who understands global trends. 
        Please analyze the destiny based on the following info:
        Name: ${formData.name}
        Birth Date: ${formData.birthDate} (${formData.isLunar === "lunar" ? "Lunar" : "Solar"})
        Birth Time: ${formData.birthTime || "Unknown"}
        Gender: ${formData.gender}

        Analysis Content:
        1. Four Pillars (8 characters of Stems and Branches)
        2. Personality and Characteristics (using modern, trendy keywords)
        3. Detailed analysis of Wealth, Health, Love, and Career
        4. Future 10-year trend and Today's Lucky Item/Color

        The response MUST be in the following JSON format:
        {
          "pillars": {
            "year": { "stem": "Stem char", "branch": "Branch char" },
            "month": { "stem": "Stem char", "branch": "Branch char" },
            "day": { "stem": "Stem char", "branch": "Branch char" },
            "hour": { "stem": "Stem char", "branch": "Branch char" }
          },
          "analysis": "Full analysis text (Markdown format, use emojis actively)"
        }

        Write the response in English, in a friendly yet professional tone. Explain Saju concepts simply for global users.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "{}");
      setAnalysis(data.analysis);
      setPillars(data.pillars);
      setStep("result");
    } catch (error) {
      console.error("Analysis error:", error);
      setStep("input");
      alert("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 py-4 font-sans selection:bg-cyan-500/30">
      {/* Language & Info Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-black neon-text italic tracking-tighter">SAJU MASTER</h1>
        </div>
        <div className="bg-slate-100/80 p-0.5 rounded-lg border border-slate-200 flex gap-0.5">
          <button 
            onClick={() => setLanguage("ko")}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${language === "ko" ? "bg-white text-cyan-600 shadow-xs" : "text-slate-400"}`}
          >
            KO
          </button>
          <button 
            onClick={() => setLanguage("en")}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${language === "en" ? "bg-white text-cyan-600 shadow-xs" : "text-slate-400"}`}
          >
            EN
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="mystical-card border-none shadow-none bg-slate-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-900 font-black">{t.inputTitle}</CardTitle>
                <CardDescription className="text-xs text-slate-500">{t.inputDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-slate-600 font-bold ml-0.5 text-[11px]">{t.name}</Label>
                    <Input 
                      id="name" 
                      placeholder={t.namePlaceholder} 
                      className="glass-input h-9 rounded-lg"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-600 font-bold ml-0.5 text-[11px]">{t.gender}</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                      <SelectTrigger className="glass-input h-9 rounded-lg">
                        <SelectValue placeholder={t.gender} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-lg">
                        <SelectItem value="male">{t.male}</SelectItem>
                        <SelectItem value="female">{t.female}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="birthDate" className="text-slate-600 font-bold ml-0.5 text-[11px]">{t.birthDate}</Label>
                    <Input 
                      id="birthDate" 
                      type="date" 
                      className="glass-input h-9 rounded-lg"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-600 font-bold ml-0.5 text-[11px]">{t.calendarType}</Label>
                    <Tabs value={formData.isLunar} onValueChange={(v) => handleInputChange("isLunar", v)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-0.5 rounded-lg h-9 border border-slate-200/50">
                        <TabsTrigger value="solar" className="rounded-md text-[11px] data-[state=active]:bg-white data-[state=active]:text-cyan-600 shadow-xs">{t.solar}</TabsTrigger>
                        <TabsTrigger value="lunar" className="rounded-md text-[11px] data-[state=active]:bg-white data-[state=active]:text-cyan-600 shadow-xs">{t.lunar}</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="birthTime" className="text-slate-600 font-bold ml-0.5 text-[11px]">{t.birthTime}</Label>
                    <Input 
                      id="birthTime" 
                      type="time" 
                      className="glass-input h-9 rounded-lg"
                      value={formData.birthTime}
                      onChange={(e) => handleInputChange("birthTime", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button 
                  className="w-full h-11 text-base btn-primary rounded-xl group"
                  onClick={startAnalysis}
                  disabled={!formData.name || !formData.birthDate}
                >
                  {t.analyzeBtn}
                  <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 space-y-10"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 rounded-full border-t-4 border-r-4 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-b-4 border-l-4 border-fuchsia-500 opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.loadingTitle}</h2>
              <p className="text-slate-500 text-sm font-medium">{t.loadingDesc}</p>
            </div>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Saju Grid */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: t.hour, key: "hour" },
                { label: t.day, key: "day" },
                { label: t.month, key: "month" },
                { label: t.year, key: "year" }
              ].map(({ label, key }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] text-slate-400 uppercase tracking-tighter font-black">{label}</span>
                  <div className={`saju-char ${pillars ? ELEMENT_COLORS[ELEMENTS[pillars[key].stem] || "Metal"] : "border-slate-100"}`}>
                    <span className="text-xl font-black">{pillars ? pillars[key].stem : "?"}</span>
                  </div>
                  <div className={`saju-char ${pillars ? ELEMENT_COLORS[ELEMENTS[pillars[key].branch] || "Metal"] : "border-slate-100"}`}>
                    <span className="text-xl font-black">{pillars ? pillars[key].branch : "?"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Content */}
            <Card className="mystical-card border-none shadow-none bg-slate-50/30">
              <CardHeader className="border-b border-slate-100/50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-black neon-text italic uppercase">{t.resultTitle}</CardTitle>
                  <Badge className="bg-slate-900 text-white font-black px-1.5 py-0 text-[9px]">AI INSIGHT</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 prose prose-slate max-w-none px-2">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm font-medium">
                  {analysis}
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100/50 pt-3 pb-3 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-400 hover:text-cyan-600 font-bold text-xs" 
                  onClick={() => setStep("input")}
                >
                  <ArrowLeft className="mr-1 w-3 h-3" />
                  {t.retryBtn}
                </Button>
                <div className="flex gap-1">
                  <Badge variant="outline" className="border-slate-200 text-slate-400 text-[9px] px-1.5">#SajuMaster</Badge>
                </div>
              </CardFooter>
            </Card>

            {/* Share CTA */}
            <div className="flex justify-center gap-2 py-2">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-lg border-slate-200 text-slate-500 text-xs px-4 hover:border-cyan-500/30"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert(t.copySuccess);
                }}
              >
                {t.copyUrl}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-lg border-slate-200 text-slate-500 text-xs px-4 hover:border-fuchsia-500/30"
                onClick={() => {
                  const text = `${t.resultTitle}: ${analysis?.slice(0, 100)}...\n\nLink: ${window.location.href}`;
                  navigator.clipboard.writeText(text);
                  alert(t.shareSuccess);
                }}
              >
                {t.copyResult}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-slate-400 text-[9px] font-medium italic mb-2">© 2026 Saju Master. AI-Powered Destiny Analysis.</p>
        <p className="text-slate-300 text-[8px] max-w-md mx-auto px-4 leading-tight">
          {t.disclaimer}
        </p>
      </footer>
    </div>
  );
}
