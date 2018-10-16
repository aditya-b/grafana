import React, { SFC } from 'react';

const BrandingSection: SFC<any> = () => {
  return (
    <div className="sidemenu__branding">
      <a href="/" className="sidemenu__logo" key="logo">
        <img src="public/img/grafana_icon.svg" alt="Grafana" />
      </a>
    </div>
  );
};

export default BrandingSection;
