import React, { useState, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { EventContentArg, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import {
  makeStyles, createStyles, Select, MenuItem, Typography, Tabs, Tab,
  Button, Popover, FormControlLabel, Checkbox, FormGroup
} from '@material-ui/core';
import { mockEvents, TCalendarEvent, expandRecurringEvents, PARTICIPANT_LIST, getChipByName, getTypeLabel } from '../../data/mockData';
import { EventFormModal } from './EventFormModal';
import { GroupWeeklyView } from './GroupWeeklyView';
import {
  SCHEDULE_ITEMS, SOURCE_LABELS, TScheduleSource, TScheduleItem, findConstruct,
} from '../../data/scheduleLayer';
import { GroupDailyView } from './GroupDailyView';
import './calendarView.css';

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'groupWeekly' | 'groupDaily';
type TabType = 'personal' | 'group';

const PERSONAL_VIEWS: { value: ViewType; label: string }[] = [
  { value: 'dayGridMonth', label: '月' },
  { value: 'timeGridWeek', label: '週' },
  { value: 'timeGridDay', label: '日' },
];

const GROUP_VIEWS: { value: ViewType; label: string }[] = [
  { value: 'groupWeekly', label: '週' },
  { value: 'groupDaily', label: '日' },
];

/** 月曜始まりの週の開始日を取得 */
const getWeekStart = (d: Date) => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 月曜始まり
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      backgroundColor: '#fff',
      padding: '0 15px 15px',
      maxWidth: 1200,
      margin: '0 auto',
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
    },
    monthTitle: {
      fontSize: 18,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
    },
    triangle: {
      fontSize: 10,
      color: '#666',
    },
    tabs: {
      '& .MuiTab-root': {
        minWidth: 80,
        minHeight: 36,
        padding: '4px 16px',
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'none',
      },
      '& .Mui-selected': {
        color: '#0099CC',
      },
      '& .MuiTabs-indicator': {
        backgroundColor: '#0099CC',
      },
    },
    viewSelect: {
      fontSize: 13,
      marginLeft: 12,
      '& .MuiSelect-select': {
        padding: '6px 28px 6px 12px',
      },
    },
    tabRow: {
      display: 'flex',
      alignItems: 'center',
    },
    memberBtn: {
      marginLeft: 8,
      fontSize: 12,
      padding: '4px 12px',
      textTransform: 'none',
      border: '1px solid #ccc',
      borderRadius: 4,
      color: '#333',
      minWidth: 0,
    },
    memberPopover: {
      padding: '12px 16px',
      maxHeight: 360,
    },
    memberActions: {
      display: 'flex',
      gap: 8,
      marginBottom: 8,
      borderBottom: '1px solid #eee',
      paddingBottom: 8,
    },
    memberActionBtn: {
      fontSize: 11,
      padding: '2px 8px',
      textTransform: 'none',
      minWidth: 0,
    },
    navButtons: {
      display: 'flex',
      gap: 4,
      alignItems: 'center',
    },
    navBtn: {
      background: 'none',
      border: '1px solid #ccc',
      borderRadius: 4,
      padding: '4px 10px',
      cursor: 'pointer',
      fontSize: 14,
      color: '#333',
      '&:hover': {
        background: '#f0f0f0',
      },
    },
    todayBtn: {
      background: '#4fc3f7',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      padding: '4px 14px',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      '&:hover': {
        background: '#29b6f6',
      },
    },
  })
);

export const CalendarView: React.FC = () => {
  const classes = useStyles();
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<TCalendarEvent[]>(mockEvents);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [viewType, setViewType] = useState<ViewType>('dayGridMonth');
  const [currentTitle, setCurrentTitle] = useState('');

  // グループ週間用の週開始日
  const [groupWeekStart, setGroupWeekStart] = useState(() => getWeekStart(new Date()));
  // グループ日用の日付
  const [groupDailyDate, setGroupDailyDate] = useState(() => new Date());

  // メンバーフィルター（localStorageで保持）
  const [visibleMembers, setVisibleMembers] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('calendar-visible-members');
      if (saved) {
        const arr: string[] = JSON.parse(saved);
        return new Set(arr.filter(m => PARTICIPANT_LIST.includes(m)));
      }
    } catch { /* ignore */ }
    return new Set(PARTICIPANT_LIST);
  });
  const [memberAnchor, setMemberAnchor] = useState<HTMLElement | null>(null);

  // 共通期日レイヤーのどれを重ねるか。既定は工程と工事の期日だけ出す
  const [visibleSources, setVisibleSources] = useState<Set<TScheduleSource>>(
    () => new Set<TScheduleSource>(['process', 'construct_due']),
  );
  const [sourceAnchor, setSourceAnchor] = useState<HTMLElement | null>(null);

  const toggleSource = (src: TScheduleSource) => {
    const next = new Set(visibleSources);
    next.has(src) ? next.delete(src) : next.add(src);
    setVisibleSources(next);
  };

  // 読み取り専用なのでカレンダー上では編集させず、案件詳細へ送る
  const handleScheduleClick = useCallback((item: TScheduleItem) => {
    const c = findConstruct(item.constructId);
    window.alert(
      `${item.title}\n\n案件: ${c?.name ?? '—'}\n担当: ${item.charge ?? '担当なし'}\n` +
      `期間: ${item.start}${item.hasDuration ? ` 〜 ${item.end}` : ''}\n\n` +
      `カレンダーからは編集できません。案件詳細（${c?.path ?? '—'}）へ移動します。`,
    );
  }, []);

  // モーダル
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TCalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [defaultTime, setDefaultTime] = useState('');
  const [defaultParticipant, setDefaultParticipant] = useState('');

  // 繰り返し展開済みイベント
  const expandedEvents = useMemo(() => expandRecurringEvents(events), [events]);

  const visibleMembersArray = useMemo(() => PARTICIPANT_LIST.filter(m => visibleMembers.has(m)), [visibleMembers]);

  const updateVisibleMembers = (next: Set<string>) => {
    setVisibleMembers(next);
    localStorage.setItem('calendar-visible-members', JSON.stringify([...next]));
  };

  const toggleMember = (name: string) => {
    const next = new Set(visibleMembers);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    updateVisibleMembers(next);
  };

  const isCustomView = (v: ViewType) => v === 'groupWeekly' || v === 'groupDaily';

  const handleTabChange = (_: any, newTab: number) => {
    const tab: TabType = newTab === 0 ? 'personal' : 'group';
    setActiveTab(tab);
    if (tab === 'personal') {
      const defaultView = PERSONAL_VIEWS[0].value;
      setViewType(defaultView);
      if (calendarRef.current) calendarRef.current.getApi().changeView(defaultView);
    } else {
      setViewType(GROUP_VIEWS[0].value);
    }
  };

  const handleViewSelect = (e: React.ChangeEvent<{ value: unknown }>) => {
    const newView = e.target.value as ViewType;
    setViewType(newView);
    if (calendarRef.current && !isCustomView(newView)) {
      calendarRef.current.getApi().changeView(newView);
    }
  };

  // 前へ / 次へ（FullCalendar用）
  const handlePrev = () => {
    if (calendarRef.current) calendarRef.current.getApi().prev();
  };
  const handleNext = () => {
    if (calendarRef.current) calendarRef.current.getApi().next();
  };
  const handleToday = () => {
    if (calendarRef.current) calendarRef.current.getApi().today();
  };

  // 日付選択（新規作成）
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedEvent(null);
    setDefaultParticipant('');
    const dateStr = selectInfo.startStr;
    if (dateStr.includes('T')) {
      setDefaultDate(dateStr.split('T')[0]);
      setDefaultTime(dateStr.split('T')[1]?.substring(0, 5) || '08:00');
    } else {
      setDefaultDate(dateStr);
      setDefaultTime('08:00');
    }
    setModalOpen(true);
  }, []);

  // イベントクリック（編集）
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const evId = clickInfo.event.id;
    // 繰り返し子の場合は親を探す
    const ev = expandedEvents.find(e => e.id === evId);
    if (ev) {
      const parentId = ev.recurrenceParentId || ev.id;
      const parent = events.find(e => e.id === parentId) || ev;
      setSelectedEvent(parent);
      setDefaultParticipant('');
      setModalOpen(true);
    }
  }, [expandedEvents, events]);

  // グループ週間ビュー用イベントクリック
  const handleGroupEventClick = useCallback((ev: TCalendarEvent) => {
    const parentId = ev.recurrenceParentId || ev.id;
    const parent = events.find(e => e.id === parentId) || ev;
    setSelectedEvent(parent);
    setDefaultParticipant('');
    setModalOpen(true);
  }, [events]);

  // グループビュー用セルクリック（週間・日共通）
  const handleGroupCellClick = useCallback((date: string, memberOrTime: string, member?: string) => {
    setSelectedEvent(null);
    setDefaultDate(date);
    // グループ日ビューの場合: (date, time, member)
    // グループ週間ビューの場合: (date, member)
    if (member) {
      setDefaultTime(memberOrTime);
      setDefaultParticipant(member);
    } else {
      setDefaultTime('08:00');
      setDefaultParticipant(memberOrTime);
    }
    setModalOpen(true);
  }, []);

  // 保存
  const handleSave = (event: TCalendarEvent) => {
    setEvents(prev => {
      const existing = prev.findIndex(e => e.id === event.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = event;
        return updated;
      }
      return [...prev, event];
    });
  };

  // タイトル更新
  const handleDatesSet = (arg: any) => {
    setCurrentTitle(arg.view.title);
  };

  const currentViews = activeTab === 'personal' ? PERSONAL_VIEWS : GROUP_VIEWS;

  return (
    <div className={classes.wrapper}>
      {/* ツールバー */}
      <div className={classes.toolbar}>
        {/* 前/今日/次 ボタン（FullCalendar用ビューのみ） */}
        {!isCustomView(viewType) ? (
          <div className={classes.navButtons}>
            <button className={classes.navBtn} onClick={handlePrev}>◀</button>
            <button className={classes.todayBtn} onClick={handleToday}>今日</button>
            <button className={classes.navBtn} onClick={handleNext}>▶</button>
          </div>
        ) : (
          <div style={{ width: 120 }} />
        )}

        {!isCustomView(viewType) && (
          <Typography className={classes.monthTitle}>
            {currentTitle}
          </Typography>
        )}

        <div className={classes.tabRow}>
          <Tabs
            value={activeTab === 'personal' ? 0 : 1}
            onChange={handleTabChange}
            className={classes.tabs}
            variant="standard"
          >
            <Tab label="個人" />
            <Tab label="グループ" />
          </Tabs>
          <Select
            value={viewType}
            onChange={handleViewSelect}
            variant="outlined"
            className={classes.viewSelect}
          >
            {currentViews.map(v => (
              <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>
            ))}
          </Select>
          {activeTab === 'group' && (
            <Button
              className={classes.memberBtn}
              onClick={(e) => setMemberAnchor(e.currentTarget)}
            >
              メンバー ({visibleMembers.size}/{PARTICIPANT_LIST.length})
            </Button>
          )}
          {activeTab === 'group' && (
            <Button
              className={classes.memberBtn}
              onClick={(e) => setSourceAnchor(e.currentTarget)}
            >
              重ねる ({visibleSources.size}/4)
            </Button>
          )}
          <Popover
            open={Boolean(sourceAnchor)}
            anchorEl={sourceAnchor}
            onClose={() => setSourceAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <div className={classes.memberPopover}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                カレンダーに重ねるもの
              </div>
              <FormGroup>
                {(Object.keys(SOURCE_LABELS) as TScheduleSource[]).map(src => (
                  <FormControlLabel
                    key={src}
                    control={
                      <Checkbox
                        checked={visibleSources.has(src)}
                        onChange={() => toggleSource(src)}
                        size="small"
                        style={{ color: '#0099CC' }}
                      />
                    }
                    label={<span style={{ fontSize: 13 }}>{SOURCE_LABELS[src]}</span>}
                  />
                ))}
              </FormGroup>
              <div style={{ fontSize: 11, color: '#888', marginTop: 6, lineHeight: 1.6 }}>
                これらは工程表・工事から読むだけで、<br />
                カレンダーからは編集できません。
              </div>
            </div>
          </Popover>
          <Popover
            open={Boolean(memberAnchor)}
            anchorEl={memberAnchor}
            onClose={() => setMemberAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <div className={classes.memberPopover}>
              <div className={classes.memberActions}>
                <Button
                  className={classes.memberActionBtn}
                  size="small"
                  onClick={() => updateVisibleMembers(new Set(PARTICIPANT_LIST))}
                >
                  全選択
                </Button>
                <Button
                  className={classes.memberActionBtn}
                  size="small"
                  onClick={() => updateVisibleMembers(new Set())}
                >
                  全解除
                </Button>
              </div>
              <FormGroup>
                {PARTICIPANT_LIST.map(name => (
                  <FormControlLabel
                    key={name}
                    control={
                      <Checkbox
                        checked={visibleMembers.has(name)}
                        onChange={() => toggleMember(name)}
                        size="small"
                        style={{ color: '#0099CC' }}
                      />
                    }
                    label={<span style={{ fontSize: 13 }}>{name}</span>}
                  />
                ))}
              </FormGroup>
            </div>
          </Popover>
        </div>
      </div>

      {/* FullCalendar ビュー */}
      {!isCustomView(viewType) && (
        <FullCalendar
          ref={calendarRef}
          locales={[jaLocale]}
          locale="ja"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={viewType}
          headerToolbar={false}
          eventDisplay="block"
          weekends={true}
          dayHeaderFormat={{ weekday: 'short' }}
          height="auto"
          contentHeight="auto"
          dayMaxEvents={false}
          displayEventEnd={true}
          defaultRangeSeparator="-"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          moreLinkText={(n) => `他${n}件`}
          nowIndicator={true}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          events={expandedEvents}
          datesSet={handleDatesSet}
          dayHeaderClassNames="day-header"
          dayCellClassNames={(arg) => {
            const day = arg.date.getDay();
            if (day === 0) return 'sunday-cell';
            if (day === 6) return 'saturday-cell';
            return '';
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false,
          }}
          slotLabelContent={(arg) => {
            const h = arg.date.getHours();
            if (h < 12) return `午前${h}時`;
            if (h === 12) return '午後12時';
            return `午後${h - 12}時`;
          }}
          allDayText="終日"
          eventContent={(arg: EventContentArg) => {
            const view = arg.view.type;
            const isRecurring = arg.event.extendedProps?.recurrenceParentId ||
              (arg.event.extendedProps?.recurrence?.type && arg.event.extendedProps.recurrence.type !== 'none');

            const cn = arg.event.extendedProps?.colorName ?? '青';
            const chip = getChipByName(cn);
            // 色だけでは意味が伝わらないので、種別名を白文字のバッジで添える
            const Chip = () => (
              <span style={{
                display: 'inline-block', flex: '0 0 auto',
                backgroundColor: chip, color: '#fff',
                fontSize: 9.5, lineHeight: '13px', padding: '0 4px',
                borderRadius: 2, marginRight: 4, whiteSpace: 'nowrap',
              }}>{getTypeLabel(cn)}</span>
            );

            if (view === 'dayGridMonth') {
              return (
                <div style={{
                  padding: '1px 5px',
                  fontSize: 11.5,
                  lineHeight: 1.45,
                  color: '#333',
                  borderRadius: 3,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}>
                  {arg.timeText && (
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#444' }}>
                      {arg.timeText}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Chip />
                    <span>
                      {isRecurring && <span style={{ fontSize: 10, color: '#888' }}>&#x21BB; </span>}
                      {arg.event.title}
                    </span>
                  </div>
                </div>
              );
            }
            // 週・日表示
            return (
              <div style={{
                padding: '3px 6px',
                fontSize: 11.5,
                lineHeight: 1.5,
                color: '#333',
                overflow: 'hidden',
              }}>
                {arg.timeText && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#444', marginBottom: 1 }}>
                    {arg.timeText}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Chip />
                  <span>
                    {isRecurring && <span style={{ fontSize: 10, color: '#888' }}>&#x21BB; </span>}
                    {arg.event.title}
                  </span>
                </div>
              </div>
            );
          }}
        />
      )}

      {/* グループ週間ビュー */}
      {viewType === 'groupWeekly' && (
        <GroupWeeklyView
          events={expandedEvents}
          scheduleItems={SCHEDULE_ITEMS as TScheduleItem[]}
          visibleSources={visibleSources}
          onScheduleClick={handleScheduleClick}
          weekStart={groupWeekStart}
          onPrevWeek={() => {
            const prev = new Date(groupWeekStart);
            prev.setDate(prev.getDate() - 7);
            setGroupWeekStart(prev);
          }}
          onNextWeek={() => {
            const next = new Date(groupWeekStart);
            next.setDate(next.getDate() + 7);
            setGroupWeekStart(next);
          }}
          onToday={() => setGroupWeekStart(getWeekStart(new Date()))}
          onEventClick={handleGroupEventClick}
          onCellClick={handleGroupCellClick}
          visibleMembers={visibleMembersArray}
          onMemberHide={toggleMember}
        />
      )}

      {/* グループ日ビュー */}
      {viewType === 'groupDaily' && (
        <GroupDailyView
          events={expandedEvents}
          currentDate={groupDailyDate}
          onPrevDay={() => {
            const prev = new Date(groupDailyDate);
            prev.setDate(prev.getDate() - 1);
            setGroupDailyDate(prev);
          }}
          onNextDay={() => {
            const next = new Date(groupDailyDate);
            next.setDate(next.getDate() + 1);
            setGroupDailyDate(next);
          }}
          onToday={() => setGroupDailyDate(new Date())}
          onEventClick={handleGroupEventClick}
          onCellClick={handleGroupCellClick}
          visibleMembers={visibleMembersArray}
          onMemberHide={toggleMember}
        />
      )}

      {/* 予定作成/編集モーダル */}
      <EventFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); setDefaultParticipant(''); }}
        onSave={handleSave}
        event={selectedEvent}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
        defaultParticipant={defaultParticipant}
      />
    </div>
  );
};
