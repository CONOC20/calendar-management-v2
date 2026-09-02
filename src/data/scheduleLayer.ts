/**
 * 共通期日レイヤー。
 *
 * カレンダーは期日を持つものを読むだけで、自分では持たない。
 * 色も供給元が決めるので、ここで新しい色体系を作らない。
 *
 * 工程が入っている工事はごく一部しかないため、工程だけを供給元にすると中身が空になる。
 * 工事そのものが持つ日付（契約・着工・完工・入金・検査）と資材の発注/納品は
 * 工程の有無に関係なく埋まるので、こちらを主役に置く。
 * タスクは工程に従属する（工程が無いと存在できない）ため、母数を救わない。
 */

export type TScheduleSource =
  | 'process'        // 工程（期間あり）
  | 'task'           // 段取りタスク（工程に従属・期日のみ）
  | 'construct_due'  // 工事の予定日
  | 'product_due';   // 資材の発注・納品・支払

export const SOURCE_LABELS: Record<TScheduleSource, string> = {
  process: '担当工程',
  task: '段取りタスク',
  construct_due: '工事の期日',
  product_due: '資材の発注・納品',
};

export type TConstruct = {
  id: string;
  name: string;
  /** 案件詳細へのディープリンク先。実機では /constructs/:id */
  path: string;
};

export const CONSTRUCTS: readonly TConstruct[] = [
  { id: 'c1', name: 'A様邸 新築工事', path: '/constructs/c1' },
  { id: 'c2', name: 'B様邸 外壁塗装', path: '/constructs/c2' },
  { id: 'c3', name: 'C商店 店舗改装', path: '/constructs/c3' },
  { id: 'c4', name: 'D様邸 水回りリフォーム', path: '/constructs/c4' },
] as const;

export type TScheduleItem = {
  id: string;
  source: TScheduleSource;
  title: string;
  constructId: string;
  /** YYYY-MM-DD */
  start: string;
  /** 期間を持つものだけ。持たないものは start と同じ */
  end: string;
  /** 期間を持つか。持つものは専用行に横断バーで描く */
  hasDuration: boolean;
  charge: string | null;
  /** palette.ts の色ID。null は既定色 */
  colorId: number | null;
  /** 小工程は既定色を薄くする */
  isChild?: boolean;
};

const d = (base: Date, offset: number) => {
  const x = new Date(base);
  x.setDate(x.getDate() + offset);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

/** 今日を起点に生成する。日付固定だと月が変わった瞬間に何も出なくなるため */
const base = new Date();

export const SCHEDULE_ITEMS: readonly TScheduleItem[] = [
  // 工程（期間あり）— 専用行に横断バーで出る
  { id: 'p1', source: 'process', title: '基礎工事', constructId: 'c1',
    start: d(base, -2), end: d(base, 4), hasDuration: true, charge: '山田', colorId: 2 },
  { id: 'p2', source: 'process', title: '躯体工事', constructId: 'c1',
    start: d(base, 5), end: d(base, 14), hasDuration: true, charge: '田中', colorId: 2 },
  { id: 'p3', source: 'process', title: '足場設置', constructId: 'c2',
    start: d(base, 1), end: d(base, 3), hasDuration: true, charge: '髙橋', colorId: null, isChild: true },
  { id: 'p4', source: 'process', title: '内装工事', constructId: 'c3',
    start: d(base, -1), end: d(base, 6), hasDuration: true, charge: '小林', colorId: 5 },

  // 段取りタスク（工程に従属・期日のみ）
  { id: 't1', source: 'task', title: 'サッシ発注期限', constructId: 'c1',
    start: d(base, 1), end: d(base, 1), hasDuration: false, charge: '山田', colorId: 3 },
  { id: 't2', source: 'task', title: '足場業者手配', constructId: 'c2',
    start: d(base, 0), end: d(base, 0), hasDuration: false, charge: '髙橋', colorId: 3 },

  // 工事の予定日（工程が無くても埋まる。ここが母数を救う）
  { id: 'cd1', source: 'construct_due', title: '着工予定日', constructId: 'c4',
    start: d(base, 2), end: d(base, 2), hasDuration: false, charge: null, colorId: 6 },
  { id: 'cd2', source: 'construct_due', title: '完工予定日', constructId: 'c2',
    start: d(base, 8), end: d(base, 8), hasDuration: false, charge: null, colorId: 6 },
  { id: 'cd3', source: 'construct_due', title: '検査日', constructId: 'c3',
    start: d(base, 3), end: d(base, 3), hasDuration: false, charge: null, colorId: 8 },
  { id: 'cd4', source: 'construct_due', title: '入金予定日', constructId: 'c1',
    start: d(base, 10), end: d(base, 10), hasDuration: false, charge: null, colorId: 9 },
  { id: 'cd5', source: 'construct_due', title: '契約予定日', constructId: 'c4',
    start: d(base, -3), end: d(base, -3), hasDuration: false, charge: null, colorId: 6 },

  // 資材の発注・納品（工程の有無に依存しない）
  { id: 'pr1', source: 'product_due', title: 'ユニットバス納品', constructId: 'c4',
    start: d(base, 4), end: d(base, 4), hasDuration: false, charge: null, colorId: 1 },
  { id: 'pr2', source: 'product_due', title: '木材発注', constructId: 'c1',
    start: d(base, -1), end: d(base, -1), hasDuration: false, charge: null, colorId: 1 },
] as const;

export const findConstruct = (id: string) => CONSTRUCTS.find(c => c.id === id);
