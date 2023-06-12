import { render, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';

import { generateQueryClient } from '../react-query/queryClient';

// import { defaultQueryClientOptions } from '../react-query/queryClient';

// react-query logging
setLogger({
  // allow logging
  // eslint-disable-next-line no-console
  log: console.log,
  // allow warnings
  // eslint-disable-next-line no-console
  warn: console.warn,
  error: () => {
    // ignore errors
  },
});

// make a fn to generate a unique query client for each test
export const generateTestQueryClient = (): QueryClient => {
  const client = generateQueryClient();
  const options = client.getDefaultOptions();
  // update the options so that queries don't retry for tests
  options.queries = { ...options.queries, retry: false };
  return client;
};

export function renderWithQueryClient(
  ui: React.ReactElement,
  client?: QueryClient,
): RenderResult {
  const queryClient = client ?? generateTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

// from https://tkdodo.eu/blog/testing-react-query#for-custom-hooks
export const createQueryClientWrapper = (): React.FC => {
  const queryClient = generateTestQueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
