import React, { FC } from 'react';
import _ from 'lodash';
import TopSectionItem from './TopSectionItem';
import config from '../../config';
import { BackButton } from 'app/core/components/BackButton/BackButton';
import { Forms, Icon } from '@grafana/ui';

const TopSection: FC<any> = () => {
  const navTree = _.cloneDeep(config.bootData.navTree);
  const mainLinks = _.filter(navTree, item => !item.hideFromMenu);

  /* {mainLinks.map((link, index) => { */
  /*   return <TopSectionItem link={link} key={`${link.id}-${index}`} />; */
  /* })} */

  return (
    <div className="sidemenu__top">
      <BackButton icon="fa fa-bars" />
      <div className="top-menu-search">
        <Forms.Input prefix={<Icon name="search" />} type="text" placeholder="Search..." />
      </div>
    </div>
  );
};

export default TopSection;
