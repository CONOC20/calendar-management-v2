// 工程一覧取得apiのレスポンスに含まれるデータ
export type TSiteProcessListData = {
  id: number;
  parent_site_process_id: number | null;
  parent_site_process_name: string | null;
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

// ガントチャートの日付検索用フォーム
export type TGanttSearchForm = {
  start_date: string;
  end_date: string;
};

// ガントチャートで表示するデータをまとめたもの
export type TGanttData = {
  resources: Array<TGanttResource>;
  events: Array<TGanttEvent>;
};

// 工程一覧のガントチャートで利用するfullcalendarのeventデータ
export type TGanttEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  resourceIds: Array<string>;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    priorityOrder: number;
    order: string;
    siteProcess: TSiteProcessListData;
  };
};

// 工程一覧のガントチャートで利用する表示期間
export type TGanttVisibleRange = {
  start?: string;
  end?: string;
};

// 工程一覧のガントチャートで利用するfullcalendarのresourceデータ
export type TGanttResource = {
  id: string;
  title: string;
  parentId?: string;
  orderId: number;
  extendedProps: {
    order: string;
    siteProcess: TSiteProcessListData;
    allSiteTaskCount: number;
    allAlertSiteTaskCount: number;
    isChildOpen: boolean;
    constructOrder: string;
    construct: {
      id: number;
      name: string;
    } | null;
    delete: boolean;
  };
};
