import React, { useMemo } from 'react';
import { TCalendarEvent, PARTICIPANT_LIST } from '../../data/mockData';
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
};

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const MAX_EVENTS_PER_CELL = 3;

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
            {members.map((member) => (
              <tr key={member}>
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
                        const timeStr = ev.start.includes('T')
                          ? ev.start.split('T')[1].substring(0, 5)
                          : '';
                        const isRecurring = !!ev.recurrenceParentId || (ev.recurrence && ev.recurrence.type !== 'none');
                        return (
                          <div
                            key={ev.id}
                            className={`group-weekly__event ${isRecurring ? 'group-weekly__event--recurring' : ''}`}
                            style={{
                              backgroundColor: ev.backgroundColor || '#64b5f6',
                              color: ev.textColor || '#fff',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(ev);
                            }}
                            title={`${timeStr ? timeStr + ' ' : ''}${ev.title}`}
                          >
                            {timeStr && (
                              <span className="group-weekly__event-time">
                                {timeStr}{' '}
                              </span>
                            )}
                            <span className="group-weekly__event-title">
                              {ev.title}
                            </span>
                          </div>
                        );
                      })}
                      {overflow > 0 && (
                        <div className="group-weekly__more">
                          他{overflow}件
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
