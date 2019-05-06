import { ListItem, ListItemRenderModel } from './AbstractList';
import { flatMapDeep } from 'lodash';
import { useMemo } from 'react';

const getItemDescendants = (item: ListItem<{}>): string[] => {
  let result: string[] = [];
  if (item.items) {
    item.items.forEach((element: ListItem<{}>) => {
      result = result.concat([element.id, ...getItemDescendants(element)]);
    });
  }
  return result;
};

function flattenItems<T>(items: Array<ListItem<T>>, parentItemIds?: string[]): Array<ListItemRenderModel<T>> {
  const result = items.map(i => {
    if (i.items && i.items.length > 0) {
      return [
        {
          ...i,
          isLeaf: false,
          parentId: parentItemIds ? parentItemIds[parentItemIds.length - 1] : null,
          parentIds: parentItemIds,
          childrenIds: i.items.map(ii => ii.id),
          descendants: getItemDescendants(i),
        } as ListItemRenderModel<T>,
        flattenItems(i.items, parentItemIds ? parentItemIds.concat([i.id]) : [i.id]),
      ];
    } else {
      return {
        ...i,
        parentId: parentItemIds ? parentItemIds[parentItemIds.length - 1] : null,
        parentIds: parentItemIds,
        isLeaf: true,
      } as ListItemRenderModel<T>;
    }
  });
  return flatMapDeep<ListItemRenderModel<T>>(result);
}

export const useFlattenedItems = (items: Array<ListItem<any>>) => {
  const flattenedItems = useMemo(() => {
    console.log('flattening');
    return flattenItems(items);
  }, [items]);
  // console.log(flattenedItems);
  return flattenedItems as Array<ListItemRenderModel<any>>;
};
