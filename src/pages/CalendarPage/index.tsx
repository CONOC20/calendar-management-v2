import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import { BasePageLayoutWrapper } from '../../components/common/BasePageLayoutWrapper';
import { CalendarView } from '../../components/calendar/CalendarView';

const useStyles = makeStyles(() =>
  createStyles({
    pageTitle: {
      backgroundColor: '#0099CC',
      padding: '8px 15px',
      fontSize: 16,
      fontWeight: 700,
      color: '#FFFFFF',
    },
  })
);

export const CalendarPage: React.FC = () => {
  const classes = useStyles();

  return (
    <BasePageLayoutWrapper>
      <div className={classes.pageTitle}>カレンダー</div>
      <CalendarView />
    </BasePageLayoutWrapper>
  );
};
