import React from 'react';
import { TScheduleItem } from '../../data/scheduleLayer';
import {
  findColor, DEFAULT_PARENT, DEFAULT_CHILD, TEXT_COLOR,
} from '../../data/palette';

/**
 * 共通期日レイヤーの項目を描く。
 *
 * 塗りは pale（薄色）にして黒文字を載せる。濃い色で塗ると文字が読めない。
 * 薄色は10色を並べると隣が見分けられないため、識別は左端の base 色チップが担う。
 */
export const resolveColor = (item: TScheduleItem) => {
  const c = findColor(item.colorId);
  if (c) return { chip: c.base, fill: c.pale };
  const def = item.isChild ? DEFAULT_CHILD : DEFAULT_PARENT;
  return { chip: def.base, fill: def.pale };
};

type TProps = {
  item: TScheduleItem;
  /** 期間バーとして描くか（false なら1日分のピル） */
  span?: boolean;
  onClick?: (item: TScheduleItem) => void;
};

export const ScheduleBar: React.FC<TProps> = ({ item, span = false, onClick }) => {
  const { chip, fill } = resolveColor(item);
  return (
    <div
      className={span ? 'schedule-bar schedule-bar--span' : 'schedule-bar'}
      data-tour="schedule-item"
      style={{ backgroundColor: fill, color: TEXT_COLOR }}
      onClick={(e) => { e.stopPropagation(); onClick?.(item); }}
      title={`${item.title}（${item.charge ?? '担当なし'}）`}
    >
      <span className="schedule-bar__chip" style={{ backgroundColor: chip }} />
      <span className="schedule-bar__title">{item.title}</span>
    </div>
  );
};
