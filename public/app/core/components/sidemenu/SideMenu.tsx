import React, { PureComponent } from 'react';
import appEvents from '../../app_events';
import { contextSrv } from 'app/core/services/context_srv';
// import TopSection from './TopSection';
import BrandingSection from './BrandingSection';
import BottomSection from './BottomSection';
import Menu from './Menu';

interface Props {}

interface State {
  isMenuOpen: boolean;
}
export class SideMenu extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };
  }

  toggleMenuOpen = () => {
    this.setState((state, props) => {
      return {
        isMenuOpen: !this.state.isMenuOpen,
      };
    });
  };

  closeMenu = () => {
    this.setState({
      isMenuOpen: false,
    });
  };

  toggleSideMenu = () => {
    contextSrv.toggleSideMenu();
    appEvents.emit('toggle-sidemenu');
  };

  toggleSideMenuSmallBreakpoint = () => {
    appEvents.emit('toggle-sidemenu-mobile');
  };

  // home, hamburger, rocket, search
  // id: string;
  // url?: string;
  // target?: string;
  // icon?: string;
  // img?: string;
  // children?: any;

  render() {
    const { isMenuOpen } = this.state;
    return [
      <div className="sidemenu__logo_small_breakpoint" onClick={this.toggleSideMenuSmallBreakpoint} key="hamburger">
        <i className="fa fa-bars" />
        <span className="sidemenu__close">
          <i className="fa fa-times" />&nbsp;Close
        </span>
      </div>,

      <div className="sidemenu__menu" key="main-menu">
        <div className="sidemenu-item">
          <a className="sidemenu-link" href="/dashboard/new">
            <span className="icon-circle sidemenu-icon">
              <i className="fa fa-fw fa-home" />
            </span>
          </a>
        </div>
        <div className="sidemenu-item">
          <button className="sidemenu-link btn btn-transparent" onClick={this.toggleMenuOpen}>
            <span className="icon-circle sidemenu-icon">
              <i className="fa fa-fw fa-bars" />
            </span>
          </button>
        </div>
        <div className="sidemenu-item">
          <button className="sidemenu-link btn btn-transparent">
            <span className="icon-circle sidemenu-icon">
              <i className="fa fa-fw fa-rocket" />
            </span>
          </button>
        </div>
      </div>,

      // <TopSection key="topsection" />,
      <BrandingSection key="brandingsection" />,
      <BottomSection key="bottomsection" />,
      isMenuOpen ? <Menu key="menusection" closeMenu={this.closeMenu} /> : null,
    ];
  }
}

export default SideMenu;

// const mapStateToProps = (state: StoreState) => {
//   debugger;
// };

// export default connect(mapStateToProps)(SideMenu);

// // export default connect(mapStateToProps, mapDispatchToProps)(UsersActionBar);
