import React, { SFC } from 'react';
import SideMenuDropDown from './SideMenuDropDown';

export interface LinkProp {
  id: string;
  url?: string;
  target?: string;
  icon?: string;
  img?: string;
  children?: any;
}

export interface Props {
  link: LinkProp;
}

const TopSectionItem: SFC<Props> = props => {
  const { link } = props;
  return (
    <div className="sidemenu-item dropdown">
      <a className="sidemenu-link" href={link.url} target={link.target}>
        <span className="icon-circle sidemenu-icon">
          <i className={link.icon} />
          {link.img && <img src={link.img} />}
        </span>
      </a>
      {link.children && <SideMenuDropDown link={link} />}
    </div>
  );
};

export default TopSectionItem;
