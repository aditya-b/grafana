import { useState, useCallback, useEffect } from 'react';
import { ListNavigationOptions } from './AbstractList';

export const useListNavigation = (
  length: number,
  listRef: React.RefObject<HTMLElement | undefined>,
  options: ListNavigationOptions
) => {
  const [activeIndex, setActiveIndex] = useState({
    activeIndex: options.startIndex || 0,
    prevActiveIndex: options.startIndex || 0,
  });

  const setNextIndexActive = useCallback(() => {
    setActiveIndex(o => {
      let nextIndex;
      if (options.cyclic) {
        nextIndex = (o.activeIndex + 1) % length;
      } else {
        nextIndex = o.activeIndex === length - 1 ? o.activeIndex : o.activeIndex + 1;
      }
      return {
        activeIndex: nextIndex,
        prevActiveIndex: o.activeIndex,
      };
    });
  }, [options.cyclic, length]);

  // useEffect(() => {
  //   console.log()
  // }, [listRef])
  const setPreviousIndexActive = useCallback(() => {
    setActiveIndex(o => {
      let nextIndex;
      if (options.cyclic) {
        nextIndex = o.activeIndex === 0 ? length + (o.activeIndex % length) - 1 : (o.activeIndex - 1) % length;
      } else {
        nextIndex = o.activeIndex === 0 ? o.activeIndex : o.activeIndex - 1;
      }

      return {
        activeIndex: nextIndex,
        prevActiveIndex: o.activeIndex,
      };
    });
  }, [options, length]);

  // useEffect(() => {
  //   setActiveIndex(options.startIndex || 0);
  //   setPrevActiveIndex(options.startIndex || 0);
  // }, [options]);

  const keyEventHandler = useCallback(
    (event: KeyboardEvent) => {
      // event.stopPropagation();
      event.preventDefault();
      if (event.keyCode === 38 /* up */ || event.keyCode === 37 /* left */) {
        setPreviousIndexActive();
      }
      if (event.keyCode === 40 /* down */ || event.keyCode === 39 /* right */) {
        setNextIndexActive();
      }
    },
    [length, options]
  );

  useEffect(() => {
    const { current } = listRef;

    if (!current) {
      return () => {};
    }
    current.addEventListener('keydown', keyEventHandler);
    return () => {
      current.removeEventListener('keydown', keyEventHandler);
    };
  }, [name, keyEventHandler, listRef, options]);

  useEffect(() => {
    const { current } = listRef;

    if (current) {
      const itemToFocus = current.querySelectorAll<HTMLLIElement>('li')[activeIndex.activeIndex];
      console.log(itemToFocus);
      if (itemToFocus) {
        itemToFocus.focus();
      }
    }
  }, [activeIndex]);

  return {
    ...activeIndex,
    setActiveIndex: (index: number) => {
      setActiveIndex(o => ({
        activeIndex: index,
        prevActiveIndex: o.activeIndex,
      }));
    },
  };
};
