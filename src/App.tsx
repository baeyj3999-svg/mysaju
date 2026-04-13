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
      stem: "천간", branch: "지지",
      apiKeyError: "API 키가 설정되지 않았습니다. Vercel 설정에서 VITE_GEMINI_API_KEY를 확인해주세요."
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
      stem: "Stem", branch: "Branch",
      apiKeyError: "API Key is not set. Please check VITE_GEMINI_API_KEY in Vercel settings."
    }
  }[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startAnalysis = async () => {
    if (!process.env.GEMINI_API_KEY) {
      alert(t.apiKeyError);
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
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      if (!response.text) {
        throw new Error("AI 응답이 비어있습니다.");
      }

      const data = JSON.parse(response.text);
      if (!data.analysis || !data.pillars) {
        throw new Error("AI 응답 형식이 올바르지 않습니다.");
      }

      setAnalysis(data.analysis);
      setPillars(data.pillars);
      setStep("result");
    } catch (error) {
      console.error("Analysis error:", error);
      setStep("input");
      const errorMsg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      alert(`분석 중 오류가 발생했습니다: ${errorMsg}\n잠시 후 다시 시도해주세요.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans selection:bg-[#FF00E5] selection:text-white relative">
      {/* Language & Info Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-6 -rotate-3">
          <div className="w-16 h-16 border-[6px] border-black bg-[#FF00E5] flex items-center justify-center shadow-[10px_10px_0px_0px_#000]">
            <Zap className="w-10 h-10 text-black fill-black" />
          </div>
          <h1 className="text-5xl font-black neon-text italic tracking-tighter leading-[0.8]">SAJU<br/>MASTER</h1>
        </div>
        <div className="bg-white p-3 border-[4px] border-black shadow-[10px_10px_0px_0px_#000] flex gap-3 rotate-3">
          <button 
            onClick={() => setLanguage("ko")}
            className={`px-6 py-2 text-lg font-black transition-all ${language === "ko" ? "bg-black text-white" : "text-black hover:bg-[#00FF00]"}`}
          >
            KO
          </button>
          <button 
            onClick={() => setLanguage("en")}
            className={`px-6 py-2 text-lg font-black transition-all ${language === "en" ? "bg-black text-white" : "text-black hover:bg-[#00FF00]"}`}
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
            <Card className="mystical-card rotate-2 stitch-bg">
              <CardHeader className="pb-8 pt-10 px-8 bg-[#FFDE03] border-b-[6px] border-black">
                <CardTitle className="text-4xl text-black font-black uppercase tracking-tighter -rotate-1">{t.inputTitle}</CardTitle>
                <CardDescription className="text-black font-black text-xl mt-2 italic underline decoration-[#FF00E5]">{t.inputDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 px-8 pt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label htmlFor="name" className="text-black font-black uppercase text-lg tracking-widest bg-[#00FF00] px-3 py-1 inline-block border-2 border-black shadow-[4px_4px_0px_0px_#000]">{t.name}</Label>
                    <Input 
                      id="name" 
                      placeholder={t.namePlaceholder} 
                      className="glass-input h-16 text-xl"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-black font-black uppercase text-lg tracking-widest bg-[#00E5FF] px-3 py-1 inline-block border-2 border-black shadow-[4px_4px_0px_0px_#000]">{t.gender}</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                      <SelectTrigger className="glass-input h-16 text-xl">
                        <SelectValue placeholder={t.gender} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[4px] border-black rounded-none">
                        <SelectItem value="male" className="font-black text-lg hover:bg-[#FF00E5] hover:text-white">{t.male}</SelectItem>
                        <SelectItem value="female" className="font-black text-lg hover:bg-[#FF00E5] hover:text-white">{t.female}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="birthDate" className="text-black font-black uppercase text-lg tracking-widest bg-[#FF00E5] text-white px-3 py-1 inline-block border-2 border-black shadow-[4px_4px_0px_0px_#000]">{t.birthDate}</Label>
                    <Input 
                      id="birthDate" 
                      type="date" 
                      className="glass-input h-16 text-xl"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-black font-black uppercase text-lg tracking-widest bg-black text-white px-3 py-1 inline-block border-2 border-white shadow-[4px_4px_0px_0px_#000]">{t.calendarType}</Label>
                    <Tabs value={formData.isLunar} onValueChange={(v) => handleInputChange("isLunar", v)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-black p-2 h-16 rounded-none">
                        <TabsTrigger value="solar" className="font-black text-base data-[state=active]:bg-[#00FF00] data-[state=active]:text-black rounded-none">{t.solar}</TabsTrigger>
                        <TabsTrigger value="lunar" className="font-black text-base data-[state=active]:bg-[#00FF00] data-[state=active]:text-black rounded-none">{t.lunar}</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <Label htmlFor="birthTime" className="text-black font-black uppercase text-lg tracking-widest bg-[#FFDE03] px-3 py-1 inline-block border-2 border-black shadow-[4px_4px_0px_0px_#000]">{t.birthTime}</Label>
                    <Input 
                      id="birthTime" 
                      type="time" 
                      className="glass-input h-16 text-xl"
                      value={formData.birthTime}
                      onChange={(e) => handleInputChange("birthTime", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-8 pb-12 px-8">
                <Button 
                  className="w-full h-20 text-3xl btn-primary group relative overflow-hidden"
                  onClick={startAnalysis}
                  disabled={!formData.name || !formData.birthDate}
                >
                  <span className="relative z-10">{t.analyzeBtn}</span>
                  <ChevronRight className="ml-4 w-10 h-10 group-hover:translate-x-4 transition-transform relative z-10" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 rotate-2">
              {[
                { label: t.hour, key: "hour", color: "bg-[#FF00E5]" },
                { label: t.day, key: "day", color: "bg-[#00E5FF]" },
                { label: t.month, key: "month", color: "#00FF00" },
                { label: t.year, key: "year", color: "bg-[#FFDE03]" }
              ].map(({ label, key, color }) => (
                <div 
                  key={label} 
                  className="flex flex-col items-center gap-6"
                >
                  <span className={`text-xl text-black uppercase tracking-tighter font-black ${color} px-6 py-1 border-[4px] border-black shadow-[6px_6px_0px_0px_#000] -rotate-2`}>{label}</span>
                  <div className={`saju-char ${pillars ? ELEMENT_COLORS[ELEMENTS[pillars[key].stem] || "Metal"] : "bg-white"} scale-110`}>
                    <span className="text-5xl font-black">{pillars ? pillars[key].stem : "?"}</span>
                  </div>
                  <div className={`saju-char ${pillars ? ELEMENT_COLORS[ELEMENTS[pillars[key].branch] || "Metal"] : "bg-white"} scale-110`}>
                    <span className="text-5xl font-black">{pillars ? pillars[key].branch : "?"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Content */}
            <Card className="mystical-card -rotate-2 stitch-bg">
              <CardHeader className="border-b-[6px] border-black pb-8 px-8 pt-10 bg-black">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <CardTitle className="text-4xl font-black text-[#00FF00] italic uppercase tracking-tighter drop-shadow-[6px_6px_0px_#FF00E5]">{t.resultTitle}</CardTitle>
                  <Badge className="pop-badge bg-[#FF00E5] text-white scale-110 rotate-6">OMEGA MASTER</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-12 prose prose-slate max-w-none px-8">
                <div className="whitespace-pre-wrap text-black leading-tight text-2xl font-black italic uppercase tracking-tighter">
                  {analysis}
                </div>
              </CardContent>
              <CardFooter className="border-t-[6px] border-black pt-8 pb-12 px-8 flex flex-col md:flex-row gap-8 justify-between items-center bg-[#FFDE03]">
                <Button 
                  className="bg-black text-white hover:bg-[#FF00E5] font-black text-2xl uppercase border-[6px] border-black px-10 h-20 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]" 
                  onClick={() => setStep("input")}
                >
                  <ArrowLeft className="mr-4 w-8 h-8" />
                  {t.retryBtn}
                </Button>
                <div className="flex flex-wrap gap-6">
                  <Badge className="pop-badge bg-[#00FF00] text-black rotate-12 scale-110">#PANIC</Badge>
                  <Badge className="pop-badge bg-[#00E5FF] text-black -rotate-12 scale-110">#CHAOS</Badge>
                </div>
              </CardFooter>
            </Card>

            {/* Share CTA */}
            <div className="flex flex-col md:flex-row justify-center gap-10 py-12">
              <Button 
                className="btn-primary h-24 px-12 text-2xl bg-[#00FF00] -rotate-6 hover:rotate-0"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert(t.copySuccess);
                }}
              >
                {t.copyUrl}
              </Button>
              <Button 
                className="btn-primary h-24 px-12 text-2xl bg-[#FF00E5] text-white rotate-6 hover:rotate-0"
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
      <footer className="mt-12 text-center border-t-[6px] border-black pt-10 pb-16 bg-black text-white">
        <p className="text-3xl font-black italic mb-6 uppercase tracking-tighter text-[#00FF00]">
          SAJU MASTER X POP ART
        </p>
        <p className="text-white text-xs font-black max-w-xl mx-auto px-6 leading-relaxed opacity-80">
          {t.disclaimer}
        </p>
      </footer>
    </div>
  );
}
