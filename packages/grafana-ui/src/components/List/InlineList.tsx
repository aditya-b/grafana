import React, { useRef } from 'react';
import { ListProps, AbstractList, AbstractListWithRef, NavigableListProps, ListItemRenderModel } from './AbstractList';
import { useListNavigation } from './useListNavigation';
import { useFlattenedItems } from './useFlattenedItems';

export function InlineList<T>({ items, ...otherProps }: ListProps<T>) {
  const flattenedItems = useFlattenedItems(items) as Array<ListItemRenderModel<T>>;
  return <AbstractList inline {...otherProps} items={flattenedItems} />;
}

export function NavigableInlineList<T>({ cyclic, startIndex, items, ...listProps }: NavigableListProps<T>) {
  const listRef = useRef<HTMLUListElement>(null);
  const flattenedItems = useFlattenedItems(items) as Array<ListItemRenderModel<T>>;
  const { activeIndex } = useListNavigation(flattenedItems.length, listRef, {
    cyclic,
    startIndex,
  });

  return <AbstractListWithRef inline {...listProps} ref={listRef} focusedIndex={activeIndex} items={flattenedItems} />;
}
