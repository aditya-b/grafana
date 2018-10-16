import React, { SFC } from 'react';
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
}

const MenuItem: SFC<Props> = props => {
  const { link } = props;
  const noDividerChildren = link.children.filter(child => !child.divider);
  return (
    <div className="menu__item">
      <a className="menu__item-link" href={link.url} target={link.target}>
        <i className={link.icon} />
        <span className="menu__item-label">{link.text}</span>
      </a>
      {noDividerChildren && (
        <ul className="menu__item-children">
          {noDividerChildren.map((child, index) => {
            return (
              <li key={`${child.url}-${index}`} className="menu__item-child">
                <a href={child.url} className="menu__item-child-link">
                  <i className={child.icon} />
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
};

export default MenuItem;
