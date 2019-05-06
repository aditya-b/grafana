import React from 'react';
import { cx, css } from 'emotion';
import { Omit } from '../../types/utils';

export type ListItemRendered<T> = (item: ListItemRenderModel<T>, index: number) => JSX.Element | null;
export type ListItemEventHandler<T, E> = (item: ListItemRenderModel<T>, event: E) => void;

export type ListItem<T extends {}> = {
  id: string;
  items?: Array<ListItem<T>>;
} & T;

export type ListItemRenderModel<T extends {}> = {
  id: string;
  isLeaf: boolean;
  isFocused?: boolean;
  isVisible?: boolean;
  isExpanded?: boolean;
  parentIds?: string[];
  childrenIds?: string[];
  descendants: string[];
  visibleDescendantsCount: number;
  parentId?: string;
  items?: Array<ListItem<T>>;
} & T;

export interface ListProps<T> {
  items: Array<ListItem<T>>;
  renderItem: ListItemRendered<T>;
  getItemKey?: (item: T) => string;
  className?: string;
  tabIndex?: number;
}

export interface NavigableListProps<T> extends ListProps<T>, ListNavigationOptions {}

export interface ListNavigationOptions {
  cyclic?: boolean;
  startIndex?: number;
}

interface AbstractListProps<T> extends Omit<ListProps<T>, 'items'> {
  items: Array<ListItemRenderModel<T>>;
  inline?: boolean;
  focusedIndex?: number;
  forwardedRef?: React.Ref<HTMLUListElement>;
  onItemKeyDown?: ListItemEventHandler<T, React.KeyboardEvent<HTMLLIElement>>;
  onItemClick?: ListItemEventHandler<T, React.MouseEvent<HTMLLIElement>>;
}

export class AbstractList<T> extends React.Component<AbstractListProps<T>> {
  shouldComponentUpdate(nextProps: AbstractListProps<T>) {
    const should = nextProps.items !== this.props.items;
    console.log('shouldOpdate', should);

    return should;
  }

  constructor(props: AbstractListProps<T>) {
    super(props);
    this.getListStyles = this.getListStyles.bind(this);
  }

  getListStyles() {
    const { inline, className } = this.props;
    return {
      list: cx([
        css`
          list-style-type: none;
          margin: 0;
          padding: 0;
          /* &:focus {
            outline: none;
          } */
        `,
        className,
      ]),
      item: css`
        display: ${(inline && 'inline-block') || 'block'};
      `,
    };
  }

  getItems = () => {
    const { items, renderItem, getItemKey, onItemKeyDown } = this.props;
    const styles = this.getListStyles();
    return items.map((item, i) => {
      return (
        <li
          className={styles.item}
          key={getItemKey ? getItemKey(item) : i}
          tabIndex={0}
          onKeyDown={e => {
            if (onItemKeyDown) {
              onItemKeyDown(item, e);
            }
          }}
        >
          {renderItem(item, i)}
        </li>
      );
    });
  };
  render() {
    const { forwardedRef, tabIndex } = this.props;
    const styles = this.getListStyles();
    // console.log('render')

    return (
      <ul className={styles.list} ref={forwardedRef} tabIndex={tabIndex}>
        {this.getItems()}
      </ul>
    );
  }
}

export const AbstractListWithRef = React.forwardRef<HTMLUListElement, AbstractListProps<any>>((props, ref) => {
  return <AbstractList {...props} forwardedRef={ref} />;
});
