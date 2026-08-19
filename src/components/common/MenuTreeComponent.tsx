import React from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  makeStyles, createStyles
} from '@material-ui/core';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import FilterListIcon from '@material-ui/icons/FilterList';
import QueueOutlinedIcon from '@material-ui/icons/QueueOutlined';
import CloudOutlinedIcon from '@material-ui/icons/CloudOutlined';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';

const useStyles = makeStyles(() =>
  createStyles({
    drawerPaper: {
      background: '#52555F',
      marginTop: 64,
      width: 320,
    },
    listWrapper: {
      paddingTop: 0,
      paddingBottom: 100,
    },
    listTitle: {
      backgroundColor: '#333333',
      pointerEvents: 'none' as const,
    },
    listTitleText: {
      color: '#FFFFFF',
    },
    listItemText: {
      color: '#FFFFFF',
      paddingLeft: 36,
    },
    listItemActive: {
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
  })
);

const StyledListItem = (props: any) => (
  <ListItem button style={{ paddingTop: 4, paddingBottom: 4 }} {...props} />
);

const menuSections = [
  {
    icon: <AssessmentOutlinedIcon style={{ color: '#fff' }} />,
    title: 'ダッシュボード',
    items: ['ダッシュボード', '目標設定'],
  },
  {
    icon: <FolderOutlinedIcon style={{ color: '#fff' }} />,
    title: '情報管理',
    items: ['顧客', '業者', '工事'],
  },
  {
    icon: <FilterListIcon style={{ color: '#fff' }} />,
    title: '現場管理',
    items: [
      '日報', '工程表',
      { name: 'カレンダー', active: true },
      '出面管理',
    ],
  },
  {
    icon: <QueueOutlinedIcon style={{ color: '#fff' }} />,
    title: 'ツール',
    items: ['書類', 'PDFダウンロード'],
  },
  {
    icon: <CloudOutlinedIcon style={{ color: '#fff' }} />,
    title: 'クラウドストレージ',
    items: ['資料', '写真'],
  },
  {
    icon: <MoreHorizOutlinedIcon style={{ color: '#fff' }} />,
    title: 'その他',
    items: ['利用規約', 'リリースノート'],
  },
];

type TProps = {
  open: boolean;
  onClose: () => void;
};

export const MenuTreeComponent: React.FC<TProps> = ({ open, onClose }) => {
  const classes = useStyles();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      classes={{ paper: classes.drawerPaper }}
    >
      <div role="presentation" onClick={onClose}>
        <List className={classes.listWrapper}>
          {menuSections.map((section, si) => (
            <React.Fragment key={si}>
              <StyledListItem className={classes.listTitle}>
                <ListItemIcon style={{ minWidth: 36 }}>{section.icon}</ListItemIcon>
                <ListItemText className={classes.listTitleText} primary={section.title} />
              </StyledListItem>
              {section.items.map((item, ii) => {
                const isObj = typeof item === 'object';
                const name = isObj ? item.name : item;
                const active = isObj ? item.active : false;
                return (
                  <StyledListItem key={ii} className={active ? classes.listItemActive : undefined}>
                    <ListItemText className={classes.listItemText} primary={name} />
                  </StyledListItem>
                );
              })}
            </React.Fragment>
          ))}
        </List>
      </div>
    </Drawer>
  );
};
