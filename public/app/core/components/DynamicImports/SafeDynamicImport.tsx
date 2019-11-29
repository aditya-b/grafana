import React from 'react';
import Loadable from 'react-loadable';
import { LoadingChunkPlaceHolder } from './LoadingChunkPlaceHolder';
import { ErrorLoadingChunk } from './ErrorLoadingChunk';

const LOADERS_COUNTER = 0;
export const loadComponentHandler = (props: { error: Error; pastDelay: boolean }) => {
  const { error, pastDelay } = props;

  if (error) {
    return <ErrorLoadingChunk error={error} />;
  }

  if (pastDelay) {
    return <LoadingChunkPlaceHolder />;
  }

  return null;
};

export const SafeDynamicImport = (importStatement: Promise<any>) => ({ ...props }) => {
  const LoadableComponent = Loadable({
    loader: () => {
      console.log('loader');
      performance.mark(`loadable-${LOADERS_COUNTER}`);
      return importStatement.then(result => {
        console.log('finished');
        performance.mark(`loadable-${LOADERS_COUNTER}-finished`);
        return result;
      });
    },
    loading: loadComponentHandler,
  });

  return <LoadableComponent {...props} />;
};
