import React, { PureComponent } from 'react';
import appEvents from '../../app_events';
import { contextSrv } from 'app/core/services/context_srv';
// import TopSection from './TopSection';
import BrandingSection from './BrandingSection';
import BottomSection from './BottomSection';
import Menu from './Menu';
import { store } from 'app/store/configureStore';

interface Props {}

interface State {
  isMenuOpen: boolean;
  searchText: string;
}
export class SideMenu extends PureComponent<Props, State> {
  private unsubscribe = undefined;

  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
      searchText: '',
    };
  }

  componentWillMount() {
    this.unsubscribe = store.subscribe(() => {
      this.setState(store => {
        return {
          ...store,
          isMenuOpen: false,
        };
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
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
  onSearchFocus = () => {
    appEvents.emit('show-dash-search');
  };

  onSearchTextChange = value => {
    console.log('value', value);
    this.setState(state => {
      return {
        ...state,
        searchText: value,
      };
    });
  };

  render() {
    const { isMenuOpen, searchText } = this.state;
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
      <div className="sidemenu__search" key="sidemenusearch">
        <label className="gf-form gf-form--grow gf-form--has-input-icon">
          <input
            type="text"
            className="gf-form-input gf-form-input--sidemenu gf-form-input--standalone gf-form--grow"
            placeholder="Find dashboards by name"
            value={searchText}
            onChange={evt => {
              this.onSearchTextChange(evt.target.value);
            }}
            onFocus={this.onSearchFocus}
          />
          <i className="gf-form-input-icon fa fa-search" />
        </label>
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
