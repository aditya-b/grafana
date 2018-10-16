import React, { PureComponent } from 'react';
import config from '../../config';
import MenuItem from './MenuItem';

interface Props {
  closeMenu: () => void;
}

export class Menu extends PureComponent<Props> {
  private node = undefined;
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.node = undefined;
  }

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

    return (
      <div className="menu" ref={node => (this.node = node)}>
        {mainLinks.map((link, index) => {
          return <MenuItem link={link} key={`${link.id}-${index}`} />;
        })}
      </div>
    );
  }
}

export default Menu;
