/**
 * Saju Constants and Basic Utility
 */

export const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const STEM_KOREAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
export const BRANCH_KOREAN = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

export const ELEMENTS: Record<string, string> = {
  "甲": "Wood", "乙": "Wood", "갑": "Wood", "을": "Wood",
  "丙": "Fire", "丁": "Fire", "병": "Fire", "정": "Fire",
  "戊": "Earth", "己": "Earth", "무": "Earth", "기": "Earth",
  "庚": "Metal", "辛": "Metal", "경": "Metal", "신": "Metal",
  "壬": "Water", "癸": "Water", "임": "Water", "계": "Water",
  "寅": "Wood", "卯": "Wood", "인": "Wood", "묘": "Wood",
  "辰": "Earth", "戌": "Earth", "丑": "Earth", "未": "Earth", "진": "Earth", "술": "Earth", "축": "Earth", "미": "Earth",
  "巳": "Fire", "午": "Fire", "사": "Fire", "오": "Fire",
  "申": "Metal", "酉": "Metal", "유": "Metal",
  "亥": "Water", "子": "Water", "해": "Water", "자": "Water"
};

export const ELEMENT_COLORS: Record<string, string> = {
  "Wood": "text-emerald-600 border-emerald-100 bg-emerald-50",
  "Fire": "text-rose-600 border-rose-100 bg-rose-50",
  "Earth": "text-orange-600 border-orange-100 bg-orange-50",
  "Metal": "text-slate-600 border-slate-200 bg-slate-50",
  "Water": "text-cyan-600 border-cyan-100 bg-cyan-50"
};

// Simplified calculation for demonstration
// In a real app, this would use a full lunar calendar library
export function calculatePillars(date: Date) {
  const year = date.getFullYear();
  
  // Year Pillar (Simplified)
  const yearStemIdx = (year - 4) % 10;
  const yearBranchIdx = (year - 4) % 12;
  
  return {
    year: {
      stem: HEAVENLY_STEMS[yearStemIdx],
      branch: EARTHLY_BRANCHES[yearBranchIdx],
      stemKor: STEM_KOREAN[yearStemIdx],
      branchKor: BRANCH_KOREAN[yearBranchIdx]
    },
    // Month, Day, Hour would require complex lunar/solar term logic
    // We'll let the AI handle the full precision for now or use placeholders
    month: { stem: "?", branch: "?", stemKor: "?", branchKor: "?" },
    day: { stem: "?", branch: "?", stemKor: "?", branchKor: "?" },
    hour: { stem: "?", branch: "?", stemKor: "?", branchKor: "?" }
  };
}
