import React, { useMemo } from 'react';
import { TCalendarEvent, PARTICIPANT_LIST, getChipByName, getTypeLabel } from '../../data/mockData';
import { TScheduleItem, TScheduleSource } from '../../data/scheduleLayer';
import { ScheduleBar } from './ScheduleBar';
import './groupWeeklyView.css';

type TProps = {
  events: TCalendarEvent[];
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onEventClick: (event: TCalendarEvent) => void;
  onCellClick: (date: string, member: string) => void;
  visibleMembers?: string[];
  onMemberHide?: (member: string) => void;
  /** 共通期日レイヤーの項目。カレンダーは読むだけで色も持たない */
  scheduleItems?: TScheduleItem[];
  /** 表示する供給元。空なら何も重ねない */
  visibleSources?: Set<TScheduleSource>;
  onScheduleClick?: (item: TScheduleItem) => void;
};

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
/**
 * 1セルに出す件数の上限。
 * 開かないと中身が読めない状態にしないため、既定では畳まずに全部出す。
 * セルは件数に応じて縦に伸びる。
 */
const MAX_EVENTS_PER_CELL = 20;

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fmtWeekTitle = (start: Date) => {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 〜 ${end.getMonth() + 1}月${end.getDate()}日`;
};

/** その日にそのメンバーが参加しているイベントを取得 */
const getEventsForMemberOnDate = (
  events: TCalendarEvent[],
  member: string,
  dateStr: string,
) => {
  const target = new Date(dateStr).getTime();
  return events.filter((ev) => {
    if (!ev.extendedProps.participants.includes(member)) return false;

    const evStart = new Date(ev.start.split('T')[0]).getTime();
    const evEnd = ev.end
      ? new Date(ev.end.split('T')[0]).getTime()
      : evStart;

    if (ev.allDay && evEnd > evStart) {
      return target >= evStart && target < evEnd;
    }
    return target >= evStart && target <= evEnd;
  });
};

export const GroupWeeklyView: React.FC<TProps> = ({
  events,
  weekStart,
  onPrevWeek,
  onNextWeek,
  onToday,
  onEventClick,
  onCellClick,
  visibleMembers,
  onMemberHide,
  scheduleItems = [],
  visibleSources,
  onScheduleClick,
}) => {
  const todayStr = fmtDate(new Date());

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekStart]);

  const members = visibleMembers ?? PARTICIPANT_LIST;

  const shownItems = useMemo(
    () => (visibleSources ? scheduleItems.filter(i => visibleSources.has(i.source)) : []),
    [scheduleItems, visibleSources],
  );

  const weekStrs = useMemo(() => weekDates.map(fmtDate), [weekDates]);

  /** 週内での [開始列, 終了列] を返す。週の外にはみ出す分は週端で切る */
  const spanRange = (item: TScheduleItem): [number, number] | null => {
    const s0 = weekStrs.findIndex(d => d >= item.start);
    const e0 = [...weekStrs].reverse().findIndex(d => d <= item.end);
    if (item.end < weekStrs[0] || item.start > weekStrs[6]) return null;
    const from = s0 === -1 ? 0 : s0;
    const to = e0 === -1 ? 6 : 6 - e0;
    return from <= to ? [from, to] : null;
  };

  /** 期間を持つもの＝専用行。持たないもの＝その日のセルへ */
  const spansOf = (charge: string | null) =>
    shownItems.filter(i => i.hasDuration && i.charge === charge && spanRange(i));
  const pointsOn = (charge: string | null, dateStr: string) =>
    shownItems.filter(i => !i.hasDuration && i.charge === charge && i.start === dateStr);

  /** 期間バーを1行として描く。列をまたぐので colSpan を使う */
  const renderSpanRow = (item: TScheduleItem, key: string, label: string) => {
    const r = spanRange(item);
    if (!r) return null;
    const [from, to] = r;
    const cells: React.ReactNode[] = [];
    if (from > 0) cells.push(<td key="pre" colSpan={from} />);
    cells.push(
      <td key="bar" colSpan={to - from + 1}>
        <ScheduleBar item={item} span onClick={onScheduleClick} />
      </td>,
    );
    if (to < 6) cells.push(<td key="post" colSpan={6 - to} />);
    return (
      <tr key={key} className="group-weekly__span-row">
        <td className="group-weekly__span-label">{label}</td>
        {cells}
      </tr>
    );
  };

  const orgSpans = spansOf(null);

  return (
    <div className="group-weekly">
      {/* ナビ */}
      <div className="group-weekly__nav">
        <button className="group-weekly__nav-btn" onClick={onPrevWeek}>
          ◀ 前週
        </button>
        <button className="group-weekly__today-btn" onClick={onToday}>
          今日
        </button>
        <span className="group-weekly__nav-title">{fmtWeekTitle(weekStart)}</span>
        <button className="group-weekly__nav-btn" onClick={onNextWeek}>
          翌週 ▶
        </button>
      </div>

      {/* テーブル: 行=メンバー, 列=日付 */}
      <div style={{ overflowX: 'auto' }}>
        <table className="group-weekly__table">
          <thead>
            <tr>
              <th className="group-weekly__header-corner">メンバー</th>
              {weekDates.map((date) => {
                const dateStr = fmtDate(date);
                const dayIdx = date.getDay();
                const isToday = dateStr === todayStr;
                const cls = [
                  'group-weekly__header-date',
                  isToday ? 'group-weekly__header-date--today' : '',
                  dayIdx === 0 ? 'group-weekly__header-date--sun' : '',
                  dayIdx === 6 ? 'group-weekly__header-date--sat' : '',
                ].filter(Boolean).join(' ');
                return (
                  <th key={dateStr} className={cls}>
                    {date.getMonth() + 1}/{date.getDate()}（{DAYS[dayIdx]}）
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* 担当を持たない工事の期日・資材はメンバー行に置けないので全体行に出す */}
            {(orgSpans.length > 0 || weekStrs.some(d => pointsOn(null, d).length > 0)) && (
              <tr className="group-weekly__org-row">
                <td className="group-weekly__org-label">全体</td>
                {weekDates.map((date) => {
                  const dateStr = fmtDate(date);
                  return (
                    <td key={dateStr} className="group-weekly__cell">
                      {pointsOn(null, dateStr).map(i => (
                        <ScheduleBar key={i.id} item={i} onClick={onScheduleClick} />
                      ))}
                    </td>
                  );
                })}
              </tr>
            )}
            {orgSpans.map(i => renderSpanRow(i, `org-${i.id}`, ''))}

            {members.map((member) => (
              <React.Fragment key={member}>
              <tr>
                <td className="group-weekly__member-cell">
                  <span>{member}</span>
                  {onMemberHide && (
                    <button
                      className="group-weekly__hide-btn"
                      onClick={(e) => { e.stopPropagation(); onMemberHide(member); }}
                      title={`${member}を非表示`}
                    >
                      ×
                    </button>
                  )}
                </td>
                {weekDates.map((date) => {
                  const dateStr = fmtDate(date);
                  const isToday = dateStr === todayStr;
                  const memberEvents = getEventsForMemberOnDate(events, member, dateStr);
                  const cellClass = isToday
                    ? 'group-weekly__cell group-weekly__cell--today'
                    : 'group-weekly__cell';
                  const shown = memberEvents.slice(0, MAX_EVENTS_PER_CELL);
                  const overflow = memberEvents.length - MAX_EVENTS_PER_CELL;

                  return (
                    <td
                      key={dateStr}
                      className={cellClass}
                      onClick={() => onCellClick(dateStr, member)}
                    >
                      {shown.map((ev) => {
                        const hhmm = (v?: string) =>
                          v && v.includes('T') ? v.split('T')[1].substring(0, 5) : '';
                        const st = hhmm(ev.start);
                        const en = hhmm(ev.end);
                        // 開始だけだと「何時から何時まで」が読めない。終了があれば範囲で出す
                        const timeStr = st ? (en && en !== st ? `${st}-${en}` : st) : '';
                        const isRecurring = !!ev.recurrenceParentId || (ev.recurrence && ev.recurrence.type !== 'none');
                        return (
                          <div
                            key={ev.id}
                            className="group-weekly__event"
                            style={{ backgroundColor: ev.backgroundColor || '#D1EDF6' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(ev);
                            }}
                            title={`${timeStr ? timeStr + ' ' : ''}${ev.title}`}
                          >
                            {timeStr && (
                              <span className="group-weekly__event-time">
                                {timeStr}
                              </span>
                            )}
                            <span className="group-weekly__event-body">
                              <span
                                className="group-weekly__badge"
                                style={{ backgroundColor: getChipByName(ev.extendedProps.colorName) }}
                              >
                                {getTypeLabel(ev.extendedProps.colorName)}
                              </span>
                              <span className="group-weekly__event-title">
                                {ev.title}
                                {isRecurring && (
                                  <span className="group-weekly__repeat" title="繰り返し予定">&#x21BB;</span>
                                )}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                      {overflow > 0 && (
                        <div className="group-weekly__more">
                          他{overflow}件
                        </div>
                      )}
                      {pointsOn(member, dateStr).map(i => (
                        <ScheduleBar key={i.id} item={i} onClick={onScheduleClick} />
                      ))}
                    </td>
                  );
                })}
              </tr>
              {/* 期間を持つ工程は時刻あり予定と別行に分ける。本数だけ行が増える */}
              {spansOf(member).map(i => renderSpanRow(i, `${member}-${i.id}`, ''))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
