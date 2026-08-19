// カレンダー一覧取得apiのレスポンスに含まれるデータ
export type TCalendarConstruct = {
  id: number;
  name: string;
};

export type TCalendarParentSiteProcess = {
  id: number;
  site_process_name: string;
  status: number;
  start_date: string;
  end_date: string | null;
  is_alerted: boolean;
  order_id: number;
};

export type TCalendarListData = {
  id: number;
  constructs: TCalendarConstruct;
  parent_site_process: TCalendarParentSiteProcess | null;
  site_process_name: string;
  charge_user_name: string | null;
  start_date: string;
  end_date: string | null;
  site_task_count: number;
  status: number;
  alert_count: number;
  planned_man_day: number | null;
  actual_man_day: number | null;
  is_alerted: boolean;
  order_id: number;
};

export type TCalendarListApiResponse = {
  data: Array<TCalendarListData>;
  page_count: number;
  display_limit: number;
};
