import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, IconButton, Typography,
  TextField, Button, Select, MenuItem, FormControl,
  Radio, RadioGroup, FormControlLabel, Checkbox,
  makeStyles, createStyles
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import { TCalendarEvent, TRecurrence, COLOR_OPTIONS, PARTICIPANT_LIST, getColorByName } from '../../data/mockData';

const useStyles = makeStyles(() =>
  createStyles({
    dialog: {
      '& .MuiDialog-paper': {
        borderRadius: 12,
        maxWidth: 520,
        width: '100%',
        padding: 0,
        overflow: 'visible',
      },
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px 0',
    },
    dragHandle: {
      color: '#999',
    },
    closeButton: {
      color: '#666',
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px 8px',
      gap: 12,
    },
    titleInput: {
      flex: 1,
      '& .MuiInput-underline:after': {
        borderBottomColor: '#1a73e8',
      },
      '& input': {
        fontSize: 20,
        fontWeight: 400,
      },
    },
    typeSelect: {
      minWidth: 80,
      fontSize: 14,
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: '4px 8px',
      '& .MuiSelect-select': {
        paddingRight: 24,
      },
    },
    content: {
      padding: '0 24px 16px !important',
      maxHeight: '60vh',
      overflowY: 'auto',
    },
    formRow: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: 16,
      gap: 16,
    },
    label: {
      width: 100,
      minWidth: 100,
      fontSize: 14,
      color: '#555',
      paddingTop: 8,
    },
    fieldArea: {
      flex: 1,
    },
    dateTimeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    dateInput: {
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: '6px 10px',
      fontSize: 14,
      width: 140,
    },
    timeInput: {
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: '6px 10px',
      fontSize: 14,
      width: 100,
    },
    keywordRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    keywordSelect: {
      flex: 1,
      '& .MuiOutlinedInput-root': {
        height: 36,
      },
    },
    linkButton: {
      backgroundColor: '#333',
      color: '#fff',
      fontWeight: 600,
      fontSize: 13,
      padding: '6px 16px',
      borderRadius: 4,
      textTransform: 'none',
      '&:hover': {
        backgroundColor: '#555',
      },
    },
    linkedStatus: {
      color: '#e57373',
      fontSize: 13,
      fontWeight: 600,
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    linkedCheck: {
      color: '#4caf50',
      fontSize: 16,
    },
    notesField: {
      '& .MuiOutlinedInput-root': {
        fontSize: 14,
      },
    },
    participantCheckboxes: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 0,
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: '8px 12px',
      marginTop: 8,
      backgroundColor: '#fafafa',
    },
    participantCheckbox: {
      '& .MuiFormControlLabel-label': {
        fontSize: 13,
      },
      '& .MuiCheckbox-root': {
        padding: 4,
      },
    },
    addedParticipants: {
      fontSize: 13,
      color: '#333',
      marginBottom: 4,
    },
    actions: {
      padding: '8px 24px 16px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
    },
    cancelButton: {
      backgroundColor: '#666',
      color: '#fff',
      padding: '8px 32px',
      borderRadius: 4,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#888',
      },
    },
    saveButton: {
      backgroundColor: '#29b6f6',
      color: '#fff',
      padding: '8px 32px',
      borderRadius: 4,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#0288d1',
      },
    },
    // 繰り返し設定
    recurrenceSection: {
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      padding: '12px 14px',
      backgroundColor: '#fafafa',
    },
    recurrenceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 8,
    },
    recurrenceSelect: {
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: '4px 8px',
      fontSize: 14,
      minWidth: 100,
      '& .MuiSelect-select': { paddingRight: 24 },
    },
    recurrenceInput: {
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: '6px 10px',
      fontSize: 14,
      width: 70,
      textAlign: 'center' as const,
    },
  })
);

type TProps = {
  open: boolean;
  onClose: () => void;
  onSave: (event: TCalendarEvent) => void;
  event?: TCalendarEvent | null;
  defaultDate?: string;
  defaultTime?: string;
  defaultParticipant?: string;
};

const DEFAULT_RECURRENCE: TRecurrence = {
  type: 'none',
  endType: 'count',
  count: 5,
  endDate: '',
};

export const EventFormModal: React.FC<TProps> = ({
  open, onClose, onSave, event, defaultDate, defaultTime, defaultParticipant
}) => {
  const classes = useStyles();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'予定' | '実施済'>('予定');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [keyword, setKeyword] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [colorName, setColorName] = useState('赤');
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [alert, setAlert] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [recurrence, setRecurrence] = useState<TRecurrence>({ ...DEFAULT_RECURRENCE });

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setType(event.extendedProps.type);
      setAllDay(event.allDay || false);
      const startStr = event.start;
      if (startStr.includes('T')) {
        setStartDate(startStr.split('T')[0]);
        setStartTime(startStr.split('T')[1]?.substring(0, 5) || '08:00');
      } else {
        setStartDate(startStr);
        setStartTime('08:00');
      }
      if (event.end) {
        const endStr = event.end;
        if (endStr.includes('T')) {
          setEndDate(endStr.split('T')[0]);
          setEndTime(endStr.split('T')[1]?.substring(0, 5) || '09:00');
        } else {
          setEndDate(endStr);
          setEndTime('09:00');
        }
      } else {
        setEndDate(startStr.includes('T') ? startStr.split('T')[0] : startStr);
        setEndTime('09:00');
      }
      setKeyword(event.extendedProps.relatedKeyword);
      setIsLinked(event.extendedProps.isLinked);
      setColorName(event.extendedProps.colorName);
      setNotes(event.extendedProps.notes);
      setParticipants(event.extendedProps.participants);
      setAlert(event.extendedProps.alert);
      setRecurrence(event.recurrence || { ...DEFAULT_RECURRENCE });
    } else {
      setTitle('');
      setType('予定');
      setAllDay(false);
      const d = defaultDate || new Date().toISOString().split('T')[0];
      setStartDate(d);
      setEndDate(d);
      setStartTime(defaultTime || '08:00');
      setEndTime(defaultTime ? `${String(parseInt(defaultTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '09:00');
      setKeyword('');
      setIsLinked(false);
      setColorName('赤');
      setNotes('');
      // グループ週間ビューからセルクリックした場合、そのメンバーをデフォルト参加者にする
      if (defaultParticipant && PARTICIPANT_LIST.includes(defaultParticipant)) {
        setParticipants([defaultParticipant]);
      } else {
        setParticipants(['山田']);
      }
      setAlert(true);
      setShowParticipants(false);
      setRecurrence({ ...DEFAULT_RECURRENCE });
    }
  }, [event, open, defaultDate, defaultTime, defaultParticipant]);

  const handleSave = () => {
    const { bg, text } = getColorByName(colorName);
    const newEvent: TCalendarEvent = {
      id: event?.id || String(Date.now()),
      title: title || '(タイトルなし)',
      start: allDay ? startDate : `${startDate}T${startTime}:00`,
      end: allDay ? endDate : `${endDate}T${endTime}:00`,
      allDay,
      backgroundColor: bg,
      borderColor: bg,
      textColor: text,
      recurrence: recurrence.type !== 'none' ? recurrence : undefined,
      extendedProps: {
        type,
        relatedKeyword: keyword,
        linkedConstruct: keyword,
        isLinked,
        notes,
        participants,
        alert,
        colorName,
      },
    };
    onSave(newEvent);
    onClose();
  };

  const handleParticipantToggle = (name: string) => {
    setParticipants(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const recurrenceLabel = (t: string) => {
    switch (t) {
      case 'none': return '繰り返しなし';
      case 'daily': return '毎日';
      case 'weekly': return '毎週';
      case 'monthly': return '毎月';
      default: return t;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialog}>
      {/* ヘッダー */}
      <div className={classes.header}>
        <DragHandleIcon className={classes.dragHandle} />
        <IconButton className={classes.closeButton} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>

      {/* タイトル行 */}
      <div className={classes.titleRow}>
        <TextField
          className={classes.titleInput}
          placeholder="タイトルを追加"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          InputProps={{ disableUnderline: false }}
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as '予定' | '実施済')}
          className={classes.typeSelect}
          disableUnderline
        >
          <MenuItem value="予定">予定</MenuItem>
          <MenuItem value="実施済">実施済</MenuItem>
        </Select>
      </div>

      <DialogContent className={classes.content}>
        {/* 日時 */}
        <div className={classes.formRow}>
          <Typography className={classes.label}>日時</Typography>
          <div className={classes.fieldArea}>
            <div style={{ marginBottom: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                }
                label="終日"
                style={{ marginLeft: 0 }}
              />
            </div>
            <div className={classes.dateTimeRow}>
              <input
                type="date"
                className={classes.dateInput}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
              />
              {!allDay && (
                <input
                  type="time"
                  className={classes.timeInput}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              )}
            </div>
            <div className={classes.dateTimeRow} style={{ marginTop: 6 }}>
              <span style={{ fontSize: 13, color: '#666', marginRight: 8 }}>~</span>
              <input
                type="date"
                className={classes.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {!allDay && (
                <input
                  type="time"
                  className={classes.timeInput}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* 繰り返し */}
        <div className={classes.formRow}>
          <Typography className={classes.label}>繰り返し</Typography>
          <div className={classes.fieldArea}>
            <div className={classes.recurrenceSection}>
              <Select
                value={recurrence.type}
                onChange={(e) => setRecurrence(prev => ({ ...prev, type: e.target.value as TRecurrence['type'] }))}
                className={classes.recurrenceSelect}
                disableUnderline
              >
                <MenuItem value="none">繰り返しなし</MenuItem>
                <MenuItem value="daily">毎日</MenuItem>
                <MenuItem value="weekly">毎週</MenuItem>
                <MenuItem value="monthly">毎月</MenuItem>
              </Select>

              {recurrence.type !== 'none' && (
                <>
                  <div className={classes.recurrenceRow}>
                    <Typography style={{ fontSize: 13, color: '#555' }}>終了条件:</Typography>
                    <RadioGroup
                      row
                      value={recurrence.endType}
                      onChange={(e) => setRecurrence(prev => ({ ...prev, endType: e.target.value as 'count' | 'date' }))}
                    >
                      <FormControlLabel
                        value="count"
                        control={<Radio color="primary" size="small" />}
                        label="回数"
                        style={{ marginRight: 8 }}
                      />
                      <FormControlLabel
                        value="date"
                        control={<Radio color="primary" size="small" />}
                        label="終了日"
                      />
                    </RadioGroup>
                  </div>

                  {recurrence.endType === 'count' ? (
                    <div className={classes.recurrenceRow}>
                      <input
                        type="number"
                        min={2}
                        max={365}
                        className={classes.recurrenceInput}
                        value={recurrence.count}
                        onChange={(e) => setRecurrence(prev => ({ ...prev, count: Math.max(2, parseInt(e.target.value) || 2) }))}
                      />
                      <Typography style={{ fontSize: 13, color: '#555' }}>回</Typography>
                    </div>
                  ) : (
                    <div className={classes.recurrenceRow}>
                      <input
                        type="date"
                        className={classes.dateInput}
                        value={recurrence.endDate}
                        onChange={(e) => setRecurrence(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                    {recurrenceLabel(recurrence.type)}
                    {recurrence.endType === 'count'
                      ? ` / ${recurrence.count}回`
                      : recurrence.endDate ? ` / ${recurrence.endDate}まで` : ''}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 関連キーワード */}
        <div className={classes.formRow}>
          <Typography className={classes.label}>関連キーワード</Typography>
          <div className={classes.fieldArea}>
            <div className={classes.keywordRow}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="顧客名・もしくは工事件名を入力"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={classes.keywordSelect}
              />
              <Button
                className={classes.linkButton}
                onClick={() => setIsLinked(true)}
              >
                紐付ける
              </Button>
            </div>
            {isLinked && keyword && (
              <div style={{ marginTop: 4 }}>
                <div className={classes.linkedStatus}>
                  <span style={{ color: '#e57373', textDecoration: 'underline' }}>紐付け済み</span>
                  <span className={classes.linkedCheck}>&#9745;</span>
                </div>
                <Button
                  size="small"
                  style={{
                    marginTop: 4,
                    color: '#1a73e8',
                    textTransform: 'none',
                    textDecoration: 'underline',
                    padding: '2px 0',
                    fontSize: 13,
                  }}
                  onClick={() => window.alert(`工事詳細画面に遷移: ${keyword}`)}
                >
                  工事詳細を見る →
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 表示色 */}
        <div className={classes.formRow}>
          <Typography className={classes.label}>表示色</Typography>
          <div className={classes.fieldArea}>
            <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
              <Select
                value={colorName}
                onChange={(e) => setColorName(e.target.value as string)}
                renderValue={(val) => {
                  const c = COLOR_OPTIONS.find(o => o.name === val);
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{val as string}</span>
                      <div style={{ width: 60, height: 18, backgroundColor: c?.value, borderRadius: 2 }} />
                    </div>
                  );
                }}
              >
                {COLOR_OPTIONS.map(c => (
                  <MenuItem key={c.name} value={c.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{c.name}</span>
                      <div style={{ width: 60, height: 18, backgroundColor: c.value, borderRadius: 2 }} />
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* 備考 */}
        <div className={classes.formRow}>
          <Typography className={classes.label}>備考</Typography>
          <div className={classes.fieldArea}>
            <TextField
              className={classes.notesField}
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              placeholder="メモを入力"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* 参加者 */}
        <div className={classes.formRow}>
          <Typography className={classes.label}>参加者</Typography>
          <div className={classes.fieldArea}>
            {participants.length > 0 && (
              <div className={classes.addedParticipants}>
                追加済: {participants.join(', ')}
              </div>
            )}
            <FormControl variant="outlined" size="small" fullWidth>
              <Select
                value=""
                displayEmpty
                onClick={() => setShowParticipants(!showParticipants)}
                renderValue={() => '選択してください'}
                open={false}
              >
              </Select>
            </FormControl>
            {showParticipants && (
              <div className={classes.participantCheckboxes}>
                {PARTICIPANT_LIST.map(name => (
                  <FormControlLabel
                    key={name}
                    className={classes.participantCheckbox}
                    control={
                      <Checkbox
                        checked={participants.includes(name)}
                        onChange={() => handleParticipantToggle(name)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* アラート */}
        <div className={classes.formRow}>
          <Typography className={classes.label}>アラート</Typography>
          <div className={classes.fieldArea}>
            <RadioGroup
              row
              value={alert ? 'あり' : 'なし'}
              onChange={(e) => setAlert(e.target.value === 'あり')}
            >
              <FormControlLabel value="あり" control={<Radio color="default" />} label="あり" />
              <FormControlLabel value="なし" control={<Radio color="default" />} label="なし" />
            </RadioGroup>
          </div>
        </div>
      </DialogContent>

      {/* ボタン */}
      <div className={classes.actions}>
        <Button className={classes.cancelButton} onClick={onClose}>
          キャンセル
        </Button>
        <Button className={classes.saveButton} onClick={handleSave}>
          保存
        </Button>
      </div>
    </Dialog>
  );
};
