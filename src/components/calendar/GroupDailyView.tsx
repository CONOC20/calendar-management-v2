import React, { useMemo } from 'react';
import { TCalendarEvent, PARTICIPANT_LIST } from '../../data/mockData';
import './groupDailyView.css';

type TProps = {
  events: TCalendarEvent[];
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onEventClick: (event: TCalendarEvent) => void;
  onCellClick: (date: string, time: string, member: string) => void;
  visibleMembers?: string[];
  onMemberHide?: (member: string) => void;
};

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 6); // 6:00〜18:00

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fmtTitle = (d: Date) =>
  `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${DAYS[d.getDay()]}）`;

const fmtHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** 指定日にそのメンバーが参加しているイベントを取得 */
const getEventsForMemberOnDate = (
  events: TCalendarEvent[],
  member: string,
  dateStr: string,
) => {
  const target = new Date(dateStr).getTime();
  return events.filter((ev) => {
    if (!ev.extendedProps.participants.includes(member)) return false;
    const evStart = new Date(ev.start.split('T')[0]).getTime();
    const evEnd = ev.end ? new Date(ev.end.split('T')[0]).getTime() : evStart;
    if (ev.allDay && evEnd > evStart) {
      return target >= evStart && target < evEnd;
    }
    return target >= evStart && target <= evEnd;
  });
};

/** イベントの開始時間(hour)を取得 */
const getStartHour = (ev: TCalendarEvent): number => {
  if (ev.allDay || !ev.start.includes('T')) return -1;
  return parseInt(ev.start.split('T')[1].substring(0, 2), 10);
};

/** イベントの終了時間(hour)を取得 */
const getEndHour = (ev: TCalendarEvent): number => {
  if (!ev.end || ev.allDay || !ev.end.includes('T')) return getStartHour(ev) + 1;
  return parseInt(ev.end.split('T')[1].substring(0, 2), 10);
};

/** そのスロット(hour)にイベントが存在するか */
const isEventInSlot = (ev: TCalendarEvent, hour: number): boolean => {
  const start = getStartHour(ev);
  const end = getEndHour(ev);
  return hour >= start && hour < end;
};

/** そのスロットがイベントの開始スロットか */
const isEventStart = (ev: TCalendarEvent, hour: number): boolean => {
  return getStartHour(ev) === hour;
};

export const GroupDailyView: React.FC<TProps> = ({
  events, currentDate, onPrevDay, onNextDay, onToday, onEventClick, onCellClick, visibleMembers, onMemberHide,
}) => {
  const dateStr = fmtDate(currentDate);
  const dayIdx = currentDate.getDay();
  const isToday = dateStr === fmtDate(new Date());
  const members = visibleMembers ?? PARTICIPANT_LIST;

  // メンバーごとの終日イベント・時間指定イベントを整理
  const memberData = useMemo(() => {
    const data: Record<string, { allDay: TCalendarEvent[]; timed: TCalendarEvent[] }> = {};
    for (const m of members) {
      const memberEvents = getEventsForMemberOnDate(events, m, dateStr);
      data[m] = {
        allDay: memberEvents.filter(e => e.allDay || !e.start.includes('T')),
        timed: memberEvents.filter(e => !e.allDay && e.start.includes('T')),
      };
    }
    return data;
  }, [events, dateStr, members]);

  const hasAnyAllDay = members.some(m => memberData[m]?.allDay.length > 0);

  return (
    <div className="group-daily">
      {/* ナビ */}
      <div className="group-daily__nav">
        <button className="group-daily__nav-btn" onClick={onPrevDay}>◀ 前日</button>
        <button className="group-daily__today-btn" onClick={onToday}>今日</button>
        <span className={`group-daily__nav-title ${dayIdx === 0 ? 'group-daily__nav-title--sun' : dayIdx === 6 ? 'group-daily__nav-title--sat' : ''}`}>
          {fmtTitle(currentDate)}
        </span>
        <button className="group-daily__nav-btn" onClick={onNextDay}>翌日 ▶</button>
      </div>

      {/* テーブル: 行=メンバー, 列=時間 */}
      <div style={{ overflowX: 'auto' }}>
        <table className="group-daily__table">
          <thead>
            <tr>
              <th className="group-daily__header-corner">メンバー</th>
              {hasAnyAllDay && (
                <th className="group-daily__header-hour group-daily__header-hour--allday">終日</th>
              )}
              {HOURS.map(h => (
                <th key={h} className="group-daily__header-hour">{fmtHour(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              const timedEvents = memberData[member]?.timed || [];
              const allDayEvents = memberData[member]?.allDay || [];

              return (
                <tr key={member}>
                  <td className="group-daily__member-cell">
                    <span>{member}</span>
                    {onMemberHide && (
                      <button
                        className="group-daily__hide-btn"
                        onClick={(e) => { e.stopPropagation(); onMemberHide(member); }}
                        title={`${member}を非表示`}
                      >
                        ×
                      </button>
                    )}
                  </td>
                  {hasAnyAllDay && (
                    <td className={`group-daily__cell ${isToday ? 'group-daily__cell--today' : ''}`}>
                      {allDayEvents.map(ev => {
                        const isRecurring = !!ev.recurrenceParentId || (ev.recurrence && ev.recurrence.type !== 'none');
                        return (
                          <div
                            key={ev.id}
                            className={`group-daily__event group-daily__event--allday ${isRecurring ? 'group-daily__event--recurring' : ''}`}
                            style={{ backgroundColor: ev.backgroundColor || '#64b5f6', color: ev.textColor || '#fff' }}
                            onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                    </td>
                  )}
                  {HOURS.map(hour => {
                    const startingEvents = timedEvents.filter(ev => isEventStart(ev, hour));
                    const continuingEvents = timedEvents.filter(ev => isEventInSlot(ev, hour) && !isEventStart(ev, hour));
                    const hasContinuing = continuingEvents.length > 0;

                    return (
                      <td
                        key={hour}
                        className={`group-daily__cell ${isToday ? 'group-daily__cell--today' : ''} ${hasContinuing && startingEvents.length === 0 ? 'group-daily__cell--occupied' : ''}`}
                        onClick={() => onCellClick(dateStr, fmtHour(hour), member)}
                      >
                        {startingEvents.map(ev => {
                          const span = getEndHour(ev) - getStartHour(ev);
                          const isRecurring = !!ev.recurrenceParentId || (ev.recurrence && ev.recurrence.type !== 'none');
                          const startTime = ev.start.split('T')[1]?.substring(0, 5) || '';
                          const endTime = ev.end?.split('T')[1]?.substring(0, 5) || '';
                          return (
                            <div
                              key={ev.id}
                              className={`group-daily__event group-daily__event--timed ${isRecurring ? 'group-daily__event--recurring' : ''}`}
                              style={{
                                backgroundColor: ev.backgroundColor || '#64b5f6',
                                color: ev.textColor || '#fff',
                                width: `calc(${span * 100}% + ${(span - 1)}px)`,
                                zIndex: 2,
                              }}
                              onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                              title={`${startTime}-${endTime} ${ev.title}`}
                            >
                              <div className="group-daily__event-time">{startTime}-{endTime}</div>
                              <div className="group-daily__event-title">{ev.title}</div>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
