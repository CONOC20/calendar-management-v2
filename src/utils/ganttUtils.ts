import {
  SITE_PROCESS_STATUS_COMPLETED,
  SITE_PROCESS_STATUS_UNNECESSARY
} from '../const/Const';
import { GANTT_DISPLAY_MAX_YEAR, GANTT_ORDER_ZERO_FILL_LENGTH } from '../const/ProcessConst';
import { TGanttEvent, TGanttResource, TSiteProcessListData } from '../types/process';

// yyyy/mm/ddをfullcalendarで扱う形式(yyyy-mm-dd)に変換する処理
export const convertToFullCalendarDateString = (input: string) => {
  return input && input.replaceAll('/', '-');
};

// 工程の終了日をガントチャート用の日付に変換する
export const convertToFullCalendarEndDateString = (input?: string | null) => {
  if (!input || input === '') return undefined;

  const endDate = new Date(input);
  const ganttEventEndYear = endDate.getFullYear();
  const ganttEventEndMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
  const ganttEventEndDate = (endDate.getDate() + 1).toString().padStart(2, '0');
  return convertToFullCalendarDateString(
    `${ganttEventEndYear}/${ganttEventEndMonth}/${ganttEventEndDate}`
  );
};

export const convertToFullCalendarId = (id: number) => id.toString();

// 工程データに合わせたガントチャートのバーの背景色を取得する
export const getEventBackgroundColor = (siteProcess: TSiteProcessListData) => {
  if (siteProcess.status === SITE_PROCESS_STATUS_COMPLETED) return '#808080';
  if (siteProcess.status === SITE_PROCESS_STATUS_UNNECESSARY) return '#f5f5f5';
  if (siteProcess.parent_site_process_id) return '#fcc';
  return '#fc0';
};

// 工程データに合わせたガントチャートの文字色を取得する
export const getEventTextColor = (siteProcess: TSiteProcessListData) => {
  if (siteProcess.status === SITE_PROCESS_STATUS_COMPLETED) return 'white';
  if (siteProcess.status === SITE_PROCESS_STATUS_UNNECESSARY) return '#808080';
  return 'black';
};

// ソート用の名前を作成する
export const createOrderName = (name?: string | null) => {
  if (!name) return '';
  return name.replace(/(\d+)/g, target =>
    target.padStart(GANTT_ORDER_ZERO_FILL_LENGTH, '0')
  );
};

export const getOrder = (siteProcess: TSiteProcessListData): string => {
  return createOrderName(siteProcess.site_process_name);
};

// 工程データをガントチャートのresourceデータに変換する処理
export const createGanttResource = (
  siteProcessData: TSiteProcessListData,
  allSiteTaskCount?: number,
  allAlertSiteTaskCount?: number,
  isChildOpen?: boolean,
  construct?: { id: number; name: string } | null
): TGanttResource => {
  const ganttResource: TGanttResource = {
    id: convertToFullCalendarId(siteProcessData.id),
    title: siteProcessData.site_process_name,
    orderId: siteProcessData.order_id,
    extendedProps: {
      order: getOrder(siteProcessData),
      siteProcess: siteProcessData,
      allSiteTaskCount: allSiteTaskCount ?? siteProcessData.site_task_count,
      allAlertSiteTaskCount: allAlertSiteTaskCount ?? siteProcessData.alert_count,
      isChildOpen: isChildOpen ?? false,
      constructOrder: createOrderName(construct?.name),
      construct: construct || null,
      delete: false
    }
  };

  if (siteProcessData.parent_site_process_id) {
    ganttResource.parentId = convertToFullCalendarId(siteProcessData.parent_site_process_id);
  }

  return ganttResource;
};

// 工程データをガントチャートのeventデータに変換する処理
export const createGanttEvent = (
  siteProcessData: TSiteProcessListData,
  addParentResource: boolean = true,
  addResource: boolean = true
): TGanttEvent => {
  const resourceIds: Array<string> = [];
  if (addResource) {
    resourceIds.push(convertToFullCalendarId(siteProcessData.id));
  }
  if (addParentResource && siteProcessData.parent_site_process_id) {
    resourceIds.push(convertToFullCalendarId(siteProcessData.parent_site_process_id));
  }

  const ganttEvent: TGanttEvent = {
    id: convertToFullCalendarId(siteProcessData.id),
    title: siteProcessData.site_process_name,
    start: convertToFullCalendarDateString(siteProcessData.start_date),
    end: convertToFullCalendarEndDateString(siteProcessData.end_date),
    resourceIds,
    extendedProps: {
      order: getOrder(siteProcessData),
      priorityOrder: siteProcessData.parent_site_process_id ? 1 : 0,
      siteProcess: siteProcessData
    }
  };

  if (siteProcessData.end_date) {
    const endDate = new Date(siteProcessData.end_date);
    const y = endDate.getFullYear();
    const m = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const d = (endDate.getDate() + 1).toString().padStart(2, '0');
    ganttEvent.end = convertToFullCalendarDateString(`${y}/${m}/${d}`);
  }

  ganttEvent.textColor = getEventTextColor(siteProcessData);
  ganttEvent.backgroundColor = getEventBackgroundColor(siteProcessData);
  ganttEvent.borderColor = ganttEvent.backgroundColor;

  return ganttEvent;
};

// 検索期間の判定
export const validateGanttPeriod = (start: string, end: string) => {
  const endDate = new Date(end);
  const latestEndDate = new Date(start);
  latestEndDate.setFullYear(latestEndDate.getFullYear() + GANTT_DISPLAY_MAX_YEAR);
  return endDate <= latestEndDate;
};
