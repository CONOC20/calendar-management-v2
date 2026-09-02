/**
 * カレンダー固有の予定種別。
 *
 * 工程・タスク・工事の期日は供給元が色を決めるので、ここには含めない。
 * 種別はテナントごとに定義する。業種で必要な種別が違うため、
 * 初期値はテンプレートから選ばせて、あとから自由に変更できるようにする。
 */

export type TEventType = {
  id: number;
  name: string;
  /** palette.ts の TPaletteColor.id。null は「種別の色を決めない」 */
  colorId: number | null;
  order: number;
};

export type TIndustryKey =
  | 'newbuild' | 'reform' | 'facility' | 'exterior' | 'civil' | 'generic';

export const INDUSTRY_LABELS: Record<TIndustryKey, string> = {
  newbuild: '新築（木造）',
  reform: 'リフォーム・リノベ',
  facility: '設備・電気',
  exterior: '外構・造園',
  civil: '土木',
  generic: '汎用',
};

const t = (id: number, name: string, colorId: number | null): TEventType =>
  ({ id, name, colorId, order: id });

/**
 * 業種テンプレート。そのまま使わせず、最初に選ばせてあとから変更させる。
 * 業種が決まらない企業には generic を既定にする。
 */
export const INDUSTRY_TEMPLATES: Record<TIndustryKey, TEventType[]> = {
  newbuild: [
    t(1, '打合せ', 6), t(2, '契約', 7), t(3, '地鎮祭', 5),
    t(4, '着工', 2), t(5, '上棟', 1), t(6, '検査', 8), t(7, '引渡', 4),
  ],
  reform: [
    t(1, '現調', 6), t(2, '見積提示', 3), t(3, '契約', 7),
    t(4, '着工', 2), t(5, '完了検査', 8), t(6, '引渡', 4),
  ],
  facility: [
    t(1, '現調', 6), t(2, '打合せ', 7), t(3, '施工', 2),
    t(4, '試運転', 5), t(5, '検査', 8), t(6, '引渡', 4),
  ],
  exterior: [
    t(1, '現調', 6), t(2, 'プラン提示', 3), t(3, '契約', 7),
    t(4, '着工', 2), t(5, '完了', 4),
  ],
  civil: [
    t(1, '打合せ', 6), t(2, '着手', 2), t(3, '中間検査', 8),
    t(4, '完成検査', 9), t(5, '引渡', 4),
  ],
  generic: [
    t(1, '打合せ', 6), t(2, '来客', 7), t(3, '外出', 2),
    t(4, '現場', 4), t(5, '休み', 1),
  ],
};

/** デモの初期値。業種が決まらない企業でも成立する汎用を既定にする */
export const DEFAULT_INDUSTRY: TIndustryKey = 'newbuild';

export const findEventType = (types: TEventType[], id: number | null | undefined) =>
  id == null ? undefined : types.find(x => x.id === id);
