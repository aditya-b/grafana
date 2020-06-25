import { StreamJSONCommandOut } from '../consts';

export class MockWorker {
  mockData: any;
  onmessage: (arg: any) => void;

  constructor(mockData: any) {
    this.mockData = mockData;
  }

  postMessage = jest.fn(function(this: any) {
    this.onmessage({ data: this.mockData });
    this.onmessage({ data: StreamJSONCommandOut.Done });
  });

  terminate() {}
}
