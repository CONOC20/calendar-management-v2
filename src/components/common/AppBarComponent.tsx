import React, { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, makeStyles, createStyles
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { MenuTreeComponent } from './MenuTreeComponent';

const useStyles = makeStyles(() =>
  createStyles({
    appBar: {
      backgroundColor: '#52555F',
    },
    toolbar: {
      justifyContent: 'space-between',
    },
    menuIcon: {
      color: '#FFFFFF',
      cursor: 'pointer',
    },
    logo: {
      width: 100,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 2,
      color: '#fff',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    userName: {
      fontWeight: 'bold',
      fontSize: 14,
      color: '#fff',
    },
  })
);

export const AppBarComponent: React.FC = () => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <MenuIcon
            className={classes.menuIcon}
            onClick={() => setDrawerOpen(true)}
          />
          <div className={classes.logo}>
            <span className={classes.logoText}>CONOC</span>
          </div>
          <div className={classes.rightSection}>
            <IconButton size="small" style={{ color: '#fff' }}>
              <NotificationsNoneIcon />
            </IconButton>
            <span className={classes.userName}>CONOC株式会社</span>
            <span className={classes.userName}>管理者</span>
            <IconButton size="small" style={{ color: '#fff' }}>
              <MoreVertIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <MenuTreeComponent open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
