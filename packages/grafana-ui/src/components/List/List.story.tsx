import React /*, { useState }*/ from 'react';
import { storiesOf } from '@storybook/react';
import { number, select, boolean } from '@storybook/addon-knobs';
import { /*List,*/ NavigableList } from './List';
import { css, cx } from 'emotion';
import tinycolor from 'tinycolor2';
// import { InlineList, NavigableInlineList } from './InlineList';
import { ListItemRendered } from './AbstractList';
import { uniqueId } from 'lodash';

const ListStories = storiesOf('UI/List', module);

interface Item {
  name: string;
  id: string;
  items: Item[];
}

// const ExpandableListItem = ({
//   item,
//   renderNestedItem,
//   isFocused,
// }: {
//   item: Item;
//   renderNestedItem: ListItemRendered<any>;
//   isFocused?: boolean;
// }) => {
//   const [expanded, setExpanded] = useState(false);
//   return (
//     <>
//       <span onClick={() => setExpanded(!expanded)}>
//         {isFocused ? '> ' : ''}
//         {item.name} {item.items.length !== 0 && (expanded ? '-' : '+')}
//       </span>
//       {expanded && item.items.length !== 0 && (
//         <NavigableList
//           className={css`
//             padding-left: 10px;
//           `}
//           items={item.items}
//           renderItem={renderNestedItem}
//           tabIndex={1}
//         />
//       )}
//     </>
//   );
// };

const generateListItems = (numberOfItems: number, depth: number): Item[] => {
  return [...new Array(numberOfItems)].map((item, i) => {
    return {
      name: `${depth} Item-${i}`,
      id: uniqueId(),
      items: depth > 0 ? generateListItems(2, depth - 1) : [],
    };
  });
};

const getStoriesKnobs = (inline = false) => {
  const numberOfItems = number('Number of items', 500);
  const activeIndex = number('Active index', 0);
  const cyclic = boolean('Allow cyclic navigation', false);

  const rawRenderer: ListItemRendered<Item> = (item, index) => {
    return (
      <span
        className={css`
          padding-left: ${10 * (item.parentIds ? item.parentIds.length : 0)}px;
          outline: ${item.isFocused ? 'solid' : 'none'};
        `}
      >
        {item.name}
      </span>
    );
  };
  const customRenderer: ListItemRendered<any> = (item, index /*, isFocused*/) => (
    <div
      className={cx([
        css`
          color: white;
          font-weight: bold;
          background: ${tinycolor.fromRatio({ h: index / 26, s: 1, v: 1 }).toHexString()};
          padding: 10px;
        `,
        inline
          ? css`
              margin-right: 20px;
            `
          : css`
              margin-bottom: 20px;
            `,
      ])}
    >
      {item.name}
    </div>
  );

  const itemRenderer = select(
    'Item rendered',
    {
      'Raw renderer': 'raw',
      'Custom renderer': 'custom',
    },
    'raw'
  );

  return {
    numberOfItems,
    renderItem: itemRenderer === 'raw' ? rawRenderer : customRenderer,
    activeIndex,
    cyclic,
  };
};

// ListStories.add('vertical', () => {
//   const { numberOfItems, renderItem } = getStoriesKnobs();
//   return <List items={generateListItems(numberOfItems)} renderItem={renderItem} />;
// });

ListStories.add('vertical navigable', () => {
  const { numberOfItems, renderItem, cyclic, activeIndex } = getStoriesKnobs();
  return (
    <NavigableList
      items={generateListItems(numberOfItems, 2)}
      renderItem={renderItem}
      cyclic={cyclic}
      startIndex={activeIndex}
      tabIndex={0}
    />
  );
});

// ListStories.add('inline', () => {
//   const { numberOfItems, renderItem } = getStoriesKnobs(true);
//   return <InlineList items={generateListItems(numberOfItems)} renderItem={renderItem} />;
// });
// ListStories.add('inline navigable', () => {
//   const { numberOfItems, renderItem, cyclic, activeIndex } = getStoriesKnobs(true);
//   return (
//     <NavigableInlineList
//       items={generateListItems(numberOfItems)}
//       renderItem={renderItem}
//       cyclic={cyclic}
//       startIndex={activeIndex}
//     />
//   );
// });

// const NavigableListStories = storiesOf('UI/NavigableList', module);

// NavigableListStories.add('default', () => {
//   const { numberOfItems, renderItem } = getStoriesKnobs(true);
//   return <NavigableList items={generateListItems(numberOfItems)} renderItem={renderItem} />;
// });
