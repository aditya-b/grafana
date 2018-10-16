import React from 'react';
import { shallow } from 'enzyme';
import TopSectionItem, { Props } from './TopSectionItem';

const setup = (propOverrides?: Props) => {
  const props = Object.assign(
    {
      link: {},
    },
    propOverrides
  );
  console.log('props', props);
  return shallow(<TopSectionItem {...props} />);
};

describe('Render', () => {
  it('should render component', () => {
    const wrapper = setup({
      link: {
        id: '0',
        url: '/href/to/icon',
        target: '_blank',
        icon: 'icon-class',
        img: '/src/to/img',
        children: 'children',
      },
    });

    expect(wrapper).toMatchSnapshot();
  });
});
