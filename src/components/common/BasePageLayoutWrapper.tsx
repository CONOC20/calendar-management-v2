import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import { AppBarComponent } from './AppBarComponent';

const useStyles = makeStyles(() =>
  createStyles({
    mainWrapper: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    mainContent: {
      flex: 1,
    },
    footer: {
      backgroundColor: '#52555F',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
  })
);

type TProps = {
  children: React.ReactNode;
};

export const BasePageLayoutWrapper: React.FC<TProps> = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.mainWrapper}>
      <AppBarComponent />
      <main className={classes.mainContent}>
        {children}
      </main>
      <div className={classes.footer}>
        &copy; CONOC Inc.
      </div>
    </div>
  );
};
