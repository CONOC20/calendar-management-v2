/**
 * 工程表と共有するカラーパレット。
 *
 * base は工程表（単一ガント・横断ガント・PDF帳票）が使う色で、変更しない。
 * カレンダーは pale（base に白を82%混ぜた色）を塗りに使い、識別は base のチップが担う。
 * 塗りを薄くしないと文字が読めず、薄いままだと10色が見分けられないため、
 * 面積の大きい塗りと面積の小さいチップで濃さを分ける。
 */

export type TPaletteColor = {
  id: number;
  name: string;
  /** 工程表が使う色 */
  base: string;
  /** カレンダーの塗りが使う色（base に白82%） */
  pale: string;
};

export const PALETTE: readonly TPaletteColor[] = [
  { id: 1, name: 'レッド', base: '#D0434F', pale: '#F7DDDF' },
  { id: 2, name: 'オレンジ', base: '#D09543', pale: '#F7ECDD' },
  { id: 3, name: 'イエロー', base: '#ADD043', pale: '#F0F7DD' },
  { id: 4, name: 'グリーン', base: '#4FD043', pale: '#DFF7DD' },
  { id: 5, name: 'ミント', base: '#43D095', pale: '#DDF7EC' },
  { id: 6, name: 'CONOCブルー', base: '#0099CC', pale: '#D1EDF6' },
  { id: 7, name: 'インディゴ', base: '#606AD7', pale: '#E2E4F8' },
  { id: 8, name: 'パープル', base: '#9D51D4', pale: '#EDE0F7' },
  { id: 9, name: 'マゼンタ', base: '#D043AD', pale: '#F7DDF0' },
  { id: 10, name: 'グレー', base: '#B9BDC0', pale: '#F2F3F4' },
] as const;

/** 色未設定の工程に使う既定色。大工程と小工程で濃さを変える */
export const DEFAULT_PARENT = { base: '#0099CC', pale: '#D1EDF6' };
export const DEFAULT_CHILD = { base: '#73C7E3', pale: '#E6F5FA' };

/**
 * 状態の色。色より状態を優先する。
 * 実施不要の #F5F5F5 は薄めると白背景と区別できなくなるため、pale を持たず枠線で表す。
 */
export const STATUS_COMPLETED = { base: '#808080', pale: '#E8E8E8' };
export const STATUS_UNNECESSARY = { base: '#F5F5F5', pale: null };

/** 文字色は全色で統一する。パレット側で読みやすさを担保している */
export const TEXT_COLOR = '#333333';

export const findColor = (colorId: number | null | undefined): TPaletteColor | undefined =>
  colorId == null ? undefined : PALETTE.find(c => c.id === colorId);
