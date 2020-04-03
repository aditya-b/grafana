import React, { PureComponent } from 'react';
import appEvents from '../../app_events';
import BottomSection from './BottomSection';
import config from 'app/core/config';
import { CoreEvents } from 'app/types';
import { Branding } from 'app/core/components/Branding/Branding';
import { BackButton } from 'app/core/components/BackButton/BackButton';
import { Forms, Icon } from '@grafana/ui';

const homeUrl = config.appSubUrl || '/';

export class SideMenu extends PureComponent {
  toggleSideMenuSmallBreakpoint = () => {
    appEvents.emit(CoreEvents.toggleSidemenuMobile);
  };

  render() {
    return (
      <div className="sidemenu">
        <a href={homeUrl} className="topmenu_logo" key="logo">
          <Branding.MenuLogo />
        </a>
        <div className="topmenu__hamburger">
          <BackButton icon="fa fa-bars" />
        </div>
        <div className="topmenu-search">
          <Forms.Input prefix={<Icon name="search" />} type="text" placeholder="Search..." />
        </div>
        <div className="flex-grow-1" />
        <BottomSection key="bottomsection" />
      </div>
    );
  }
}
