// ダミーイベントデータ
const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();

const fmt = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export type TRecurrence = {
  type: 'none' | 'daily' | 'weekly' | 'monthly';
  endType: 'count' | 'date';
  count: number;       // endType === 'count' のとき
  endDate: string;     // endType === 'date' のとき (YYYY-MM-DD)
};

export type TCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  recurrence?: TRecurrence;
  recurrenceParentId?: string; // 繰り返しから生成されたイベントの親ID
  extendedProps: {
    type: '予定' | '実施済';
    relatedKeyword: string;
    linkedConstruct: string;
    isLinked: boolean;
    notes: string;
    participants: string[];
    alert: boolean;
    colorName: string;
  };
};

// colorNameから色情報を取得するヘルパー
export const getColorByName = (colorName: string) => {
  const c = COLOR_OPTIONS.find(o => o.name === colorName);
  const bg = c?.value || COLOR_OPTIONS[0].value;
  // 黄色は黒テキスト、それ以外は白テキスト
  const text = colorName === '黄色' ? '#333' : '#fff';
  return { bg, text };
};

export const COLOR_OPTIONS = [
  { name: '赤', value: '#e57373' },
  { name: '黄色', value: '#ffd54f' },
  { name: '緑', value: '#81c784' },
  { name: '青', value: '#64b5f6' },
  { name: '紫', value: '#ba68c8' },
];

export const PARTICIPANT_LIST = [
  '山田', '佐藤(事務)', '田中', '鈴木(事務)', '小林',
  '髙橋', '伊藤', '川田', '佐々木', '長谷川', '渡辺'
];

// colorNameから自動的にbackgroundColor/textColorを設定
const ev = (data: Omit<TCalendarEvent, 'backgroundColor' | 'borderColor' | 'textColor'>): TCalendarEvent => {
  const { bg, text } = getColorByName(data.extendedProps.colorName);
  return { ...data, backgroundColor: bg, borderColor: bg, textColor: text };
};

/** 繰り返し予定を展開する */
export const expandRecurringEvents = (events: TCalendarEvent[]): TCalendarEvent[] => {
  const result: TCalendarEvent[] = [];
  for (const ev of events) {
    result.push(ev);
    if (!ev.recurrence || ev.recurrence.type === 'none') continue;

    const startDate = new Date(ev.start.split('T')[0]);
    const hasTime = ev.start.includes('T');
    const timePart = hasTime ? 'T' + ev.start.split('T')[1] : '';
    const endTimePart = ev.end && hasTime ? 'T' + ev.end.split('T')[1] : '';

    // 開始～終了の日数差
    const daySpan = ev.end
      ? Math.round((new Date(ev.end.split('T')[0]).getTime() - startDate.getTime()) / 86400000)
      : 0;

    const maxOccurrences = ev.recurrence.endType === 'count' ? ev.recurrence.count : 365;
    const endLimit = ev.recurrence.endType === 'date' ? new Date(ev.recurrence.endDate) : null;

    for (let i = 1; i < maxOccurrences; i++) {
      const next = new Date(startDate);
      if (ev.recurrence.type === 'daily') next.setDate(next.getDate() + i);
      else if (ev.recurrence.type === 'weekly') next.setDate(next.getDate() + i * 7);
      else if (ev.recurrence.type === 'monthly') next.setMonth(next.getMonth() + i);

      if (endLimit && next > endLimit) break;

      const nFmt = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
      const endD = new Date(next);
      endD.setDate(endD.getDate() + daySpan);
      const eFmt = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;

      result.push({
        ...ev,
        id: `${ev.id}_r${i}`,
        start: nFmt + timePart,
        end: eFmt + endTimePart,
        recurrenceParentId: ev.id,
        recurrence: undefined, // 子は展開しない
      });
    }
  }
  return result;
};

export const mockEvents: TCalendarEvent[] = [
  ev({
    id: '1',
    title: 'OO様打ち合わせ',
    start: `${fmt(y, m, 8)}T10:00:00`,
    end: `${fmt(y, m, 8)}T11:00:00`,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'OO様邸外壁塗装工事',
      linkedConstruct: 'OO様邸外壁塗装工事',
      isLinked: true,
      notes: '見積Aプラン、Bプラン、色見本、塗料パンフレット持っていく',
      participants: ['山田', '髙橋', '佐々木'],
      alert: true,
      colorName: '青',
    },
  }),
  ev({
    id: '2',
    title: 'OO邸竣工予定日',
    start: fmt(y, m, 11),
    allDay: true,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'OO邸新築工事',
      linkedConstruct: 'OO邸新築工事',
      isLinked: true,
      notes: '',
      participants: [],
      alert: false,
      colorName: '赤',
    },
  }),
  ev({
    id: '3',
    title: '業者打ち合わせ',
    start: `${fmt(y, m, 5)}T11:00:00`,
    end: `${fmt(y, m, 5)}T12:00:00`,
    extendedProps: {
      type: '実施済',
      relatedKeyword: '',
      linkedConstruct: '',
      isLinked: false,
      notes: 'オンライン',
      participants: ['山田', '田中'],
      alert: false,
      colorName: '緑',
    },
  }),
  ev({
    id: '4',
    title: 'ABC邸現場確認',
    start: `${fmt(y, m, 15)}T09:00:00`,
    end: `${fmt(y, m, 15)}T10:30:00`,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'ABC邸リフォーム工事',
      linkedConstruct: 'ABC邸リフォーム工事',
      isLinked: true,
      notes: '現場写真を撮影する',
      participants: ['山田', '佐藤(事務)'],
      alert: true,
      colorName: '赤',
    },
  }),
  ev({
    id: '5',
    title: 'XYZビル定例会議',
    start: `${fmt(y, m, 8)}T14:00:00`,
    end: `${fmt(y, m, 8)}T15:00:00`,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'XYZビル改修工事',
      linkedConstruct: 'XYZビル改修工事',
      isLinked: true,
      notes: '進捗報告',
      participants: ['山田', '伊藤', '川田'],
      alert: false,
      colorName: '紫',
    },
  }),
  ev({
    id: '6',
    title: '発注手続き',
    start: `${fmt(y, m, 12)}T10:00:00`,
    end: `${fmt(y, m, 12)}T11:00:00`,
    extendedProps: {
      type: '予定',
      relatedKeyword: '',
      linkedConstruct: '',
      isLinked: false,
      notes: '~~架設さん先行発注必須',
      participants: ['山田'],
      alert: true,
      colorName: '黄色',
    },
  }),
  ev({
    id: '7',
    title: 'OO邸打ち合わせ',
    start: `${fmt(y, m, 8)}T08:00:00`,
    end: `${fmt(y, m, 8)}T09:00:00`,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'OO邸新築工事',
      linkedConstruct: 'OO邸新築工事',
      isLinked: true,
      notes: '',
      participants: ['山田'],
      alert: false,
      colorName: '青',
    },
  }),
  ev({
    id: '8',
    title: 'OO邸竣工予定日',
    start: fmt(y, m, 3),
    allDay: true,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'OO邸新築工事',
      linkedConstruct: 'OO邸新築工事',
      isLinked: true,
      notes: '',
      participants: [],
      alert: false,
      colorName: '赤',
    },
  }),
  ev({
    id: '9',
    title: 'DEF様邸着工日',
    start: fmt(y, m, 18),
    allDay: true,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'DEF様邸リフォーム',
      linkedConstruct: 'DEF様邸リフォーム',
      isLinked: true,
      notes: '',
      participants: [],
      alert: false,
      colorName: '緑',
    },
  }),
  ev({
    id: '10',
    title: '見積提出',
    start: `${fmt(y, m, 22)}T13:00:00`,
    end: `${fmt(y, m, 22)}T14:00:00`,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'GHI様邸外壁工事',
      linkedConstruct: 'GHI様邸外壁工事',
      isLinked: true,
      notes: '3パターン用意',
      participants: ['山田', '佐藤(事務)'],
      alert: false,
      colorName: '緑',
    },
  }),
  // 複数日にまたがる予定
  ev({
    id: '11',
    title: 'OO様邸 外壁塗装工事',
    start: fmt(y, m, 7),
    end: fmt(y, m, 12),
    allDay: true,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'OO様邸外壁塗装工事',
      linkedConstruct: 'OO様邸外壁塗装工事',
      isLinked: true,
      notes: '足場設置〜下地処理〜塗装',
      participants: ['山田', '髙橋', '佐々木'],
      alert: false,
      colorName: '青',
    },
  }),
  ev({
    id: '12',
    title: '社員研修（安全講習）',
    start: fmt(y, m, 14),
    end: fmt(y, m, 16),
    allDay: true,
    extendedProps: {
      type: '予定',
      relatedKeyword: '',
      linkedConstruct: '',
      isLinked: false,
      notes: '全社員参加必須',
      participants: ['山田', '田中', '髙橋', '伊藤', '佐々木'],
      alert: true,
      colorName: '紫',
    },
  }),
  ev({
    id: '13',
    title: 'ABC邸リフォーム工事',
    start: fmt(y, m, 20),
    end: fmt(y, m, 27),
    allDay: true,
    extendedProps: {
      type: '予定',
      relatedKeyword: 'ABC邸リフォーム工事',
      linkedConstruct: 'ABC邸リフォーム工事',
      isLinked: true,
      notes: '内装解体→電気配線→クロス貼替',
      participants: ['山田', '田中', '川田'],
      alert: false,
      colorName: '赤',
    },
  }),
  ev({
    id: '14',
    title: '建材展示会（東京ビッグサイト）',
    start: fmt(y, m, 2),
    end: fmt(y, m, 4),
    allDay: true,
    extendedProps: {
      type: '予定',
      relatedKeyword: '',
      linkedConstruct: '',
      isLinked: false,
      notes: '新建材・塗料の情報収集',
      participants: ['山田', '佐藤(事務)'],
      alert: false,
      colorName: '緑',
    },
  }),
  // 繰り返し予定サンプル
  ev({
    id: '15',
    title: '朝礼',
    start: `${fmt(y, m, 1)}T08:00:00`,
    end: `${fmt(y, m, 1)}T08:30:00`,
    recurrence: { type: 'daily', endType: 'date', count: 30, endDate: fmt(y, m + 1, 0) },
    extendedProps: {
      type: '予定',
      relatedKeyword: '',
      linkedConstruct: '',
      isLinked: false,
      notes: '毎朝の朝礼',
      participants: ['山田', '田中', '鈴木(事務)', '髙橋', '伊藤'],
      alert: false,
      colorName: '青',
    },
  }),
  ev({
    id: '16',
    title: '安全パトロール',
    start: `${fmt(y, m, 3)}T10:00:00`,
    end: `${fmt(y, m, 3)}T11:00:00`,
    recurrence: { type: 'weekly', endType: 'count', count: 5, endDate: '' },
    extendedProps: {
      type: '予定',
      relatedKeyword: '',
      linkedConstruct: '',
      isLinked: false,
      notes: '毎週水曜 現場安全パトロール',
      participants: ['山田', '髙橋'],
      alert: true,
      colorName: '赤',
    },
  }),
  ev({
    id: '17',
    title: '月例全体会議',
    start: `${fmt(y, m, 1)}T15:00:00`,
    end: `${fmt(y, m, 1)}T16:00:00`,
    recurrence: { type: 'monthly', endType: 'count', count: 3, endDate: '' },
    extendedProps: {
      type: '予定',
      relatedKeyword: '',
      linkedConstruct: '',
      isLinked: false,
      notes: '月初の全体ミーティング',
      participants: ['山田', '佐藤(事務)', '田中', '鈴木(事務)', '小林', '髙橋', '伊藤'],
      alert: true,
      colorName: '紫',
    },
  }),
];
