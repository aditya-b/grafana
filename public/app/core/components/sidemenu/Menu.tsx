import React, { PureComponent } from 'react';
import config from '../../config';
import MenuItem from './MenuItem';

interface Props {
  closeMenu: () => void;
}

interface State {
  menuState: any;
}

export class Menu extends PureComponent<Props, State> {
  private node = undefined;
  private lStorage = undefined;
  private lStorageName = 'menuState';

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.node = undefined;
    this.lStorage = window.localStorage;
    const menuStateFromLS = this.lStorage.getItem(this.lStorageName);
    console.log('menuStateFromLS', menuStateFromLS);

    let initialMenuState = {};
    try {
      initialMenuState = menuStateFromLS ? JSON.parse(menuStateFromLS) : {};
    } catch (error) {
      console.error('initial menu state error, removing..');
      this.lStorage.removeItem(this.lStorageName);
    }

    this.state = {
      menuState: initialMenuState,
    };
  }

  onMenuItemClick = id => {
    const newMenuState = {
      ...this.state.menuState,
      [id]: !this.state.menuState[id],
    };

    this.setState(state => {
      this.lStorage.setItem(this.lStorageName, JSON.stringify(newMenuState));
      return {
        ...state,
        menuState: newMenuState,
      };
    });
  };

  handleClick(evt) {
    const { closeMenu } = this.props;
    if (this.node && !this.node.contains(evt.target)) {
      closeMenu();
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  render() {
    const navTree = Object.assign([], config.bootData.navTree);
    const mainLinks = navTree.filter(item => !item.hideFromMenu);
    const { menuState } = this.state;

    return (
      <div className="menu" ref={node => (this.node = node)}>
        {mainLinks.map((link, index) => {
          return (
            <MenuItem
              link={link}
              key={`${link.id}-${index}`}
              isOpen={!!menuState[link.id]}
              onMenuItemClick={() => this.onMenuItemClick(link.id)}
            />
          );
        })}
      </div>
    );
  }
}

export default Menu;
