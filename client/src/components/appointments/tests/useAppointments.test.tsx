import { act, renderHook } from '@testing-library/react-hooks';

import { createQueryClientWrapper } from '../../../test-utils';
import { useAppointments } from '../hooks/useAppointments';

// testing just the hook
test('filter appointments by availability', async () => {
  const { result, waitFor } = renderHook(() => useAppointments(), {
    wrapper: createQueryClientWrapper(),
  });

  const filteredAppointmentsLength = Object.keys(
    result.current.appointments,
  ).length;
  await waitFor(() => filteredAppointmentsLength > 0);

  // set show all appointments
  act(() => result.current.setShowAll(true));

  // wait for the appointments to be filtered
  await waitFor(
    () =>
      Object.keys(result.current.appointments).length >
      filteredAppointmentsLength,
  );
});
