import React, { useEffect, useState, useCallback } from 'react';
import './productTour.css';

/**
 * プロダクトツアー。
 *
 * 初見の利用者は「重ねる」や期間予定の専用行に自分では気づかない。
 * 画面の該当箇所を順に指し示して、何がどこにあるかを一度だけ通す。
 *
 * 手順ごとに必要なタブへ自動で切り替える。手動で合わせさせると
 * 途中で迷子になり、ツアーの意味が無くなる。
 */

export type TTourStep = {
  /** 対象要素の CSS セレクタ。null なら画面中央に出す */
  target: string | null;
  title: string;
  body: string;
  /** この手順で開いておきたいタブ */
  tab?: 'personal' | 'group';
};

type TProps = {
  steps: TTourStep[];
  onRequestTab: (tab: 'personal' | 'group') => void;
  storageKey?: string;
};

const PADDING = 6;

export const ProductTour: React.FC<TProps> = ({ steps, onRequestTab, storageKey = 'conoc-calendar-tour' }) => {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // 初回だけ自動で開く。2回目以降は右下のボタンから
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(storageKey) === 'done'; } catch { /* 参照できない環境では毎回出す */ }
    if (!seen) setOpen(true);
  }, [storageKey]);

  const step = steps[i];

  // タブ切替は描画を伴うので、位置測定より先に要求する
  useEffect(() => {
    if (!open || !step?.tab) return;
    onRequestTab(step.tab);
  }, [open, i, step?.tab, onRequestTab]);

  const measure = useCallback(() => {
    if (!open || !step) return;
    if (!step.target) { setRect(null); return; }
    const el = document.querySelector(step.target);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setRect(el.getBoundingClientRect());
  }, [open, step]);

  useEffect(() => {
    // タブ切替やスクロールの後に測る
    const t = window.setTimeout(measure, 400);
    window.addEventListener('resize', measure);
    return () => { window.clearTimeout(t); window.removeEventListener('resize', measure); };
  }, [measure]);

  const finish = () => {
    setOpen(false); setI(0);
    try { localStorage.setItem(storageKey, 'done'); } catch { /* 保存できなくても動作は変えない */ }
  };

  if (!open) {
    return (
      <button className="tour__launch" onClick={() => { setI(0); setOpen(true); }}>
        使い方を見る
      </button>
    );
  }

  const panelTop = rect ? Math.min(rect.bottom + 12, window.innerHeight - 210) : window.innerHeight / 2 - 100;
  const panelLeft = rect
    ? Math.max(12, Math.min(rect.left, window.innerWidth - 372))
    : window.innerWidth / 2 - 180;

  return (
    <div className="tour">
      {/* 対象だけを明るく残す。四辺の帯で覆うので、対象のクリックは邪魔しない */}
      {rect ? (
        <>
          <div className="tour__mask" style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PADDING) }} />
          <div className="tour__mask" style={{ top: rect.bottom + PADDING, left: 0, right: 0, bottom: 0 }} />
          <div className="tour__mask" style={{ top: rect.top - PADDING, left: 0, width: Math.max(0, rect.left - PADDING), height: rect.height + PADDING * 2 }} />
          <div className="tour__mask" style={{ top: rect.top - PADDING, left: rect.right + PADDING, right: 0, height: rect.height + PADDING * 2 }} />
          <div className="tour__ring" style={{
            top: rect.top - PADDING, left: rect.left - PADDING,
            width: rect.width + PADDING * 2, height: rect.height + PADDING * 2,
          }} />
        </>
      ) : (
        <div className="tour__mask" style={{ inset: 0 }} />
      )}

      <div className="tour__panel" style={{ top: panelTop, left: panelLeft }}>
        <div className="tour__count">{i + 1} / {steps.length}</div>
        <div className="tour__title">{step.title}</div>
        <div className="tour__body">{step.body}</div>
        <div className="tour__actions">
          <button className="tour__skip" onClick={finish}>閉じる</button>
          <div className="tour__nav">
            {i > 0 && <button className="tour__btn" onClick={() => setI(i - 1)}>戻る</button>}
            {i < steps.length - 1
              ? <button className="tour__btn tour__btn--primary" onClick={() => setI(i + 1)}>次へ</button>
              : <button className="tour__btn tour__btn--primary" onClick={finish}>はじめる</button>}
          </div>
        </div>
      </div>
    </div>
  );
};
