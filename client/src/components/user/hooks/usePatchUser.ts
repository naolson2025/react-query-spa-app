import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User | null) => patchUserOnServer(newUserData, user),
    {
      // onMutate returns context that is passed to onError
      onMutate: (newData: User | null) => {
        // cancel any outgoing requests, so old server data
        // doesn't overwrite new data
        queryClient.cancelQueries(queryKeys.user);
        // snapshot of previous value
        const previousUserDataContext: User = queryClient.getQueryData(
          queryKeys.user,
        );
        // optimistically update the cache with the new value
        updateUser(newData);
        // return context object with snapshot of previous value
        return { previousUserDataContext };
      },
      onError: (error, newData, context) => {
        // roll back cache to previous value
        // if we have a previous value
        if (context.previousUserDataContext) {
          updateUser(context.previousUserDataContext);
          toast({
            title: 'User updated failed, restoring previous data',
            status: 'error',
          });
        }
      },
      onSuccess: (userData: User | null) => {
        if (user) {
          toast({
            title: 'User updated',
            status: 'success',
          });
        }
      },
      onSettled: () => {
        // invalidate cache, in order to trigger a re-fetch
        // to make sure our data is up-to-date
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return patchUser;
}
