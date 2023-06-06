import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useQuery } from 'react-query';

import type { Staff } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { filterByTreatment } from '../utils';

// for when we need a query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get('/staff');
  return data;
}

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}

export function useStaff(): UseStaff {
  // for filtering staff by treatment
  const [filter, setFilter] = useState('all');

  // useCallback to memoize the select function
  // if the inputs haven't changed (filter, unfilteredStaff), then the function will not be run again
  const selectFn = useCallback(
    (unfilteredStaff) => filterByTreatment(unfilteredStaff, filter),
    [filter],
  );

  // select will receive the data returned from the query function (getStaff)
  const fallback = [];
  const { data: staff = fallback } = useQuery(queryKeys.staff, getStaff, {
    select: filter !== 'all' ? selectFn : undefined,
  });

  return { staff, filter, setFilter };
}
