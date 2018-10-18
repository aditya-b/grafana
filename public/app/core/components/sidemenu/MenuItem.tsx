import React, { Component } from 'react';
// import React, { SFC } from 'react';
// import SideMenuDropDown from './SideMenuDropDown';

export interface LinkProp {
  id: string;
  url?: string;
  target?: string;
  icon?: string;
  img?: string;
  text: string;
  children?: [
    {
      icon: string;
      text: string;
      url: string;
      divider?: boolean;
    }
  ];
}

export interface Props {
  link: LinkProp;
  isOpen: boolean;
  onMenuItemClick: () => void;
}

export class MenuItem extends Component<Props> {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.isOpen !== nextProps.isOpen;
  }

  render() {
    const { link, onMenuItemClick, isOpen } = this.props;

    const noDividerChildren = link.children.filter(child => !child.divider);
    const expandedCss = 'fa fa-fw menu__item-expand-icon ' + (isOpen ? 'fa-minus' : 'fa-plus');

    return (
      <div className="menu__item">
        <button className="menu__item-link btn btn-transparent" onClick={onMenuItemClick}>
          <i className={`menu__item-icon ${link.icon}`} />
          <span className="menu__item-label">{link.text}</span>
          <i className={expandedCss} />
        </button>
        {noDividerChildren &&
          isOpen && (
            <ul className={`menu__item-children`}>
              {noDividerChildren.map((child, index) => {
                return (
                  <li key={`${child.url}-${index}`} className="menu__item-child">
                    <a href={child.url} className="menu__item-child-link">
                      <i className={`menu__item-child-icon ${child.icon}`} />
                      <span className="menu__item-child-label">{child.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        {/* {link.children && <SideMenuDropDown link={link} />} */}
      </div>
    );
  }
}

export default MenuItem;
