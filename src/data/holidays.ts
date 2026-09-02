/**
 * 祝日と会社休日。
 *
 * 会社休日（夏季休業・創立記念日など）を祝日と同じ器に入れる。
 * 別の器にすると、表示のたびに2つを突き合わせることになり、
 * 「その日が休みかどうか」の判定が2箇所に散る。
 *
 * 休日はセルの背景色で表す。予定や工程は帯で重ねるので、
 * 同じ日に休日と工程があっても互いを隠さない。
 */

export type THoliday = {
  /** YYYY-MM-DD */
  date: string;
  name: string;
  /** 会社が独自に決めた休日か。国民の祝日と色を変える */
  isCompany: boolean;
};

const y = new Date().getFullYear();
const p = (m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const HOLIDAYS: readonly THoliday[] = [
  { date: p(9, 21), name: '敬老の日', isCompany: false },
  { date: p(9, 22), name: '国民の休日', isCompany: false },
  { date: p(9, 23), name: '秋分の日', isCompany: false },
  { date: p(9, 4), name: '夏季休業', isCompany: true },
  { date: p(9, 12), name: '創立記念日', isCompany: true },
] as const;

export const HOLIDAY_BG = '#FDECEC';
export const COMPANY_HOLIDAY_BG = '#FBF0E4';

export const findHoliday = (dateStr: string) =>
  HOLIDAYS.find(h => h.date === dateStr);

/** 休日・土日の背景色。何も無ければ null */
export const holidayBg = (dateStr: string, dayIndex: number): string | null => {
  const h = findHoliday(dateStr);
  if (h) return h.isCompany ? COMPANY_HOLIDAY_BG : HOLIDAY_BG;
  if (dayIndex === 0) return HOLIDAY_BG;
  if (dayIndex === 6) return '#EDF4FB';
  return null;
};
