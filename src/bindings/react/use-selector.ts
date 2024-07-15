import { useMemo } from 'react';
import { Signal } from '@pl-beta/signals';

export const useSelector = () => {
  return useMemo(() => new Signal.State('TODO'), []);
};
