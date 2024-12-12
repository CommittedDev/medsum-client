import { readLocalStorageValue, useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';

interface IObject {
  [key: string]: any;
}

const perfix = 'medplum-';

export const readPersistStateGetInitialValue = <T>(args: { key: string; currentValue?: T }) => {
  const value = readLocalStorageValue({
    key: `${perfix}${args.key}`,
  });
  return value && typeof value == 'string' ? safeParse(value) : (args.currentValue as T);
};

export const usePersistStateOnValueChange = <T>(args: { key: string; updateValue?: T }) => {
  const [_value, setValue] = useLocalStorage({
    key: `${perfix}${args.key}`,
    defaultValue: args.updateValue ? JSON.stringify(args.updateValue) : null,
  });

  const setUpdateValue = (val: any) => {
    setValue(val ? JSON.stringify(val) : null);
  };

  useEffect(() => {
    setUpdateValue(args.updateValue);
  }, [args.updateValue]);
};

const safeParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return undefined;
  }
};
