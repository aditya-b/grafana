// Libraries
import React, { Component } from 'react';
import { isEqual } from 'lodash';
import { css, cx } from 'emotion';

// Utils & Services
import config from 'app/core/config';
import { stylesFactory } from '@grafana/ui';
import templateSrv from 'app/features/templating/template_srv';
/* import { getPanelLinksSupplier } from 'app/features/panel/panellinks/linkSuppliers'; */
/* import { e2e } from '@grafana/e2e'; */

// Components
import { ClickOutsideWrapper } from '@grafana/ui';
/* import PanelHeaderCorner from './PanelHeaderCorner'; */
import { PanelHeaderMenu } from './PanelHeaderMenu';

// Types
import { GrafanaTheme } from '@grafana/data';
import { DataLink, ScopedVars } from '@grafana/data';
import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';

const getStyles = stylesFactory((theme: GrafanaTheme) => ({
  header: css`
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    cursor: move;
    padding: ${theme.spacing.sm} ${theme.spacing.sm} 0;
    font-size: 14px;
  `,
  titleContainer: css`
    flex-grow: 0;
  `,
  title: css`
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-weight: 500;
  `,
  stateIconContainer: css`
    display: flex;
    padding-left: ${theme.spacing.xs};
    flex-grow: 1;
  `,
  stateIcon: css`
    width: 16px;
    height: 16px;
  `,
  menuIcon: css`
    width: 16px;
    height: 16px;
  `,
}));

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  timeInfo: string;
  title?: string;
  description?: string;
  scopedVars?: ScopedVars;
  links?: DataLink[];
  error?: string;
  isFullscreen: boolean;
}

interface ClickCoordinates {
  x: number;
  y: number;
}

interface State {
  panelMenuOpen: boolean;
}

export class PanelHeader extends Component<Props, State> {
  clickCoordinates: ClickCoordinates = { x: 0, y: 0 };
  state = {
    panelMenuOpen: false,
    clickCoordinates: { x: 0, y: 0 },
  };

  eventToClickCoordinates = (event: React.MouseEvent<HTMLDivElement>) => {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  };

  onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    this.clickCoordinates = this.eventToClickCoordinates(event);
  };

  isClick = (clickCoordinates: ClickCoordinates) => {
    return isEqual(clickCoordinates, this.clickCoordinates);
  };

  onMenuToggle = (event: React.MouseEvent<HTMLDivElement>) => {
    if (this.isClick(this.eventToClickCoordinates(event))) {
      event.stopPropagation();

      this.setState(prevState => ({
        panelMenuOpen: !prevState.panelMenuOpen,
      }));
    }
  };

  closeMenu = () => {
    this.setState({
      panelMenuOpen: false,
    });
  };

  /* <PanelHeaderCorner */
  /*           panel={panel} */
  /*           title={panel.title} */
  /*           description={panel.description} */
  /*           scopedVars={panel.scopedVars} */
  /*           links={getPanelLinksSupplier(panel)} */
  /*           error={error} */
  /*         /> */
  /* onClick={this.onMenuToggle} */
  /* onMouseDown={this.onMouseDown} */
  /* aria-label={e2e.pages.Panels.Panel.selectors.title(title)} */

  /* {timeInfo && ( */
  /*                 <span className="panel-time-info"> */
  /*                   <i className="fa fa-clock-o" /> {timeInfo} */
  /*                 </span> */
  /*               )} */

  render() {
    const { panel, dashboard, timeInfo, scopedVars, error, isFullscreen } = this.props;
    const title = templateSrv.replaceWithText(panel.title, scopedVars);
    const styles = getStyles(config.theme);

    return (
      <>
        <div className={cx(styles.header, { 'grid-drag-handle': !isFullscreen })}>
          <div className={styles.titleContainer}>
            <div className={styles.title}>{title}</div>
          </div>
          <div className={styles.stateIconContainer}>
            <i className={cx(styles.stateIcon, 'fa fa-info')} />
            <i className={cx(styles.stateIcon, 'fa fa-warning')} />
          </div>
          <div className={styles.menuIcon}>
            <i className={cx('fa fa-bars')} onClick={this.onMenuToggle} />
            {this.state.panelMenuOpen && (
              <ClickOutsideWrapper onClick={this.closeMenu}>
                <PanelHeaderMenu panel={panel} dashboard={dashboard} />
              </ClickOutsideWrapper>
            )}
          </div>
        </div>
      </>
    );
  }
}
