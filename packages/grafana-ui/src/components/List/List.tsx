import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  ListProps,
  AbstractList,
  AbstractListWithRef,
  NavigableListProps,
  ListItemRenderModel,
  ListItemEventHandler,
} from './AbstractList';
import { useListNavigation } from './useListNavigation';
import { useFlattenedItems } from './useFlattenedItems';
import { flatMap, without } from 'lodash';
import { css } from 'emotion';
// import { css } from 'emotion';

export function List<T>({ items, ...otherProps }: ListProps<T>) {
  const flattenedItems = useFlattenedItems(items) as Array<ListItemRenderModel<T>>;
  return <AbstractList {...otherProps} items={flattenedItems} />;
}

const useExpandableItems = (items: Array<ListItemRenderModel<{}>>) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const parentStats = useRef<{ [key: string]: number }>({});

  const itemsToRender = useMemo(() => {
    // console.log('memo')
    const tmp: { [key: string]: number } = {};
    const a = items
      .map(i => {
        let isVisible = true;
        if (i.parentIds && i.parentIds.length) {
          isVisible = i.parentId ? expandedNodes.indexOf(i.parentId) > -1 : true;

          if (isVisible) {
            i.parentIds.forEach(id => {
              tmp[id] = tmp[id] ? tmp[id] + 1 : 1;
              parentStats.current = tmp;
            });
          }
        }

        return {
          ...i,
          isVisible,
          isExpanded: expandedNodes.indexOf(i.id) > -1,
        };
      })
      .filter(i => i.isVisible)
      .map(i => ({
        ...i,
        visibleDescendantsCount: parentStats.current[i.id] || 0,
      }));
    return a;
  }, [items, expandedNodes]);

  const hideRecursively = useCallback(
    (nodeId: string): string[] => {
      const item = items.filter(i => i.id === nodeId)[0];
      if (!item) {
        return [];
      }
      if (item.childrenIds) {
        return [item.id].concat(flatMap(item.childrenIds, id => hideRecursively(id)));
      } else {
        return [item.id];
      }
    },
    [items]
  );

  return {
    toggleItem: (id: string) => {
      // console.log(id)
      setExpandedNodes(
        expandedNodes.indexOf(id) === -1 ? expandedNodes.concat([id]) : without(expandedNodes, ...hideRecursively(id))
      );
    },
    items: itemsToRender,
    expadedItemIds: expandedNodes,
    parentStats: parentStats.current,
  };
};

export function NavigableList<T>({ cyclic, startIndex, items, renderItem, ...listProps }: NavigableListProps<T>) {
  const listRef = useRef(null);
  const flattenedItems = useFlattenedItems(items) as Array<ListItemRenderModel<T>>;

  const { items: visibleItems, toggleItem } = useExpandableItems(flattenedItems);

  const { activeIndex, prevActiveIndex /*, setActiveIndex */ } = useListNavigation(visibleItems.length, listRef, {
    cyclic,
    startIndex,
  });

  const itemsToRender = useMemo(() => {
    console.log('olaboga');
    return visibleItems.slice(0) as Array<ListItemRenderModel<T>>;
  }, [visibleItems]);

  if (itemsToRender[prevActiveIndex]) {
    itemsToRender[prevActiveIndex].isFocused = false;
  }

  itemsToRender[activeIndex].isFocused = true;

  const olala = useMemo(() => {
    console.log('olala');
    return itemsToRender.filter(i => !i.parentId);
  }, [itemsToRender]);

  const onItemKeyDown: ListItemEventHandler<T, React.KeyboardEvent<any>> = (item, event) => {
    if (item.isExpanded && !item.isFocused) {
      return;
    }
    if (event.keyCode === 13) {
      toggleItem(item.id);
      event.stopPropagation();
    }
  };

  return (
    <AbstractListWithRef
      {...listProps}
      ref={listRef}
      focusedIndex={activeIndex}
      items={olala}
      onItemKeyDown={onItemKeyDown}
      renderItem={(item, index) => {
        const renderIndex = itemsToRender.indexOf(item) as number;
        return (
          <ExpandableItem
            key={`${item.id}-${index}`}
            item={item}
            items={itemsToRender.slice(renderIndex + 1, renderIndex + 1 + item.visibleDescendantsCount)}
            onItemKeyDown={onItemKeyDown}
            // index={index}
          />
        );
        // return (
        //   <span
        //     onClick={() => {
        //       setActiveIndex(index);
        //       toggleItem(item.id);
        //     }}
        //   >
        //     {renderItem(item, index)}
        //   </span>
        // );
      }}
    />
  );
}

interface ExpandableItemProps<T> {
  item: ListItemRenderModel<T>;
  items: Array<ListItemRenderModel<T>>;
  onItemKeyDown: ListItemEventHandler<T, React.KeyboardEvent<HTMLLIElement>>;
}

class ExpandableItem<T> extends React.PureComponent<ExpandableItemProps<T>> {
  render() {
    const { item, items, onItemKeyDown } = this.props;
    const depth = item.parentIds ? item.parentIds.length : 0;
    console.log('EXIr');
    return (
      <div
        className={css`
          :focus {
            background: red;
          }
        `}
        // tabIndex={item.isFocused ? 0 : -1}
        // onKeyDown={(e) => onItemKeyDown(item, e)}
      >
        {(item as any).name}
        {!item.isLeaf && item.isExpanded && (
          <AbstractList
            items={items
              .slice(0, item.visibleDescendantsCount)
              .filter(i => i.parentIds && i.parentIds.length === depth + 1)}
            onItemKeyDown={onItemKeyDown}
            renderItem={(item, i) => {
              const renderIndex = items.indexOf(item) as number;
              return (
                <ExpandableItem
                  key={`${item.id}-${i}`}
                  item={item}
                  items={items.slice(renderIndex + 1, renderIndex + 1 + item.visibleDescendantsCount)}
                  onItemKeyDown={onItemKeyDown}
                />
              );
            }}
          />
        )}
      </div>
    );
  }
}
