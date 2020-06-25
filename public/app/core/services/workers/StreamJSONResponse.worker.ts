import oboe from 'oboe';
import { StreamJSONCommandIn, StreamJSONCommandOut } from './consts';

// See: https://github.com/microsoft/TypeScript/issues/20595#issuecomment-587297818
const postMessage = ((self as unknown) as Worker).postMessage;
let isFetching = false;
let oboeInstance: oboe.Oboe | null = null;

export type StreamJSONResponseOptions = {
  url: string;
  chunkSize?: number;
  hasObjectResponse?: boolean;
  headers?: any;
  limit?: number;
  path?: string;
  withCredentials?: boolean;
};

export interface StreamJSONResponseWorker extends Worker {
  postMessage(message: StreamJSONResponseOptions | StreamJSONCommandIn, transfer: Transferable[]): void;
  postMessage(message: StreamJSONResponseOptions | StreamJSONCommandIn, options?: PostMessageOptions): void;
}

type ArrayChunk = any[];
type ObjectChunk = { [key: string]: any };

export function streamJSONResponse(
  data: StreamJSONResponseOptions,
  callback: (arg: ArrayChunk | ObjectChunk | StreamJSONCommandOut) => void
) {
  // Node.js doesn't support instantiation via web worker, so checking for whether this
  // instance is already fetching wouldn't work during tests.
  if (isFetching && !(process.env.NODE_ENV === 'test')) {
    throw new Error('Worker is already fetching data!');
  }
  isFetching = true;

  const {
    url,
    hasObjectResponse = false,
    headers = {},
    chunkSize = Number.MAX_SAFE_INTEGER,
    limit = Number.MAX_SAFE_INTEGER,
    path = 'data.*',
    withCredentials = false,
  } = data;
  let nodes: ArrayChunk | ObjectChunk = hasObjectResponse ? {} : [];
  let totalNodeCount = 0;

  // Important to use oboe 2.1.4!! 2.1.5 can't be used in web workers!
  oboeInstance = oboe({ url, headers, withCredentials })
    .node(path, function(this: oboe.Oboe, node, _path) {
      totalNodeCount++;

      if (hasObjectResponse) {
        (nodes as ObjectChunk)[_path[_path.length - 1]] = node;
      } else {
        nodes.push(node);
      }

      const chunkNodeCount = hasObjectResponse ? Object.keys(nodes).length : nodes.length;
      if (chunkNodeCount % chunkSize === 0) {
        callback(nodes);
        nodes = hasObjectResponse ? {} : [];
      }

      if (totalNodeCount >= limit) {
        if (chunkNodeCount > 0) {
          callback(nodes);
        }
        this.abort();
        callback(StreamJSONCommandOut.Done);
        return oboe.drop;
      }

      // Since we stream chunks, we don't need oboe to build an object.
      // Reduces RAM use dramatically!
      return oboe.drop;
    })
    .fail(error => {
      // If e.g. 405 happens, oboe will trigger this twice. Once with
      // the request failure error and once with its own error about not
      // being able to parse the response.
      if (error.statusCode) {
        throw error;
      }
    })
    .done(() => {
      if (nodes.length > 0 || Object.keys(nodes).length > 0) {
        callback(nodes);
      }
      callback(StreamJSONCommandOut.Done);
    });
}

self.onmessage = function({ data }: { data: StreamJSONResponseOptions | StreamJSONCommandIn }) {
  if (typeof data === 'object') {
    // TODO: Remove `postMessage` here and instead use assertion to assign a stricter type to
    // `postMessage` globally.
    streamJSONResponse(data, postMessage);
    return;
  }

  if (data === StreamJSONCommandIn.Abort) {
    oboeInstance.abort();
  }
};

export default function dummyRequiredForJestMockImplementationToWork() {}
