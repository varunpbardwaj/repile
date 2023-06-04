import { signal as repileSignal } from "@preact/signals-react";

function persistSignal<T>(state: T, identifier: string) {
  const getStorageSignal: () => string = () =>
    localStorage.getItem(`repile:${identifier}`) || "";

  if (!getStorageSignal())
    localStorage.setItem(`repile:${identifier}`, JSON.stringify(state));

  const combineSignals = {
    ...state,
    ...JSON.parse(getStorageSignal()),
  };

  localStorage.setItem(`repile:${identifier}`, JSON.stringify(combineSignals));

  const signal = repileSignal(combineSignals);

  function next<T>(key: string, payload: T) {
    const newValue = { ...signal.value, [key]: payload };
    signal.value = { ...newValue };
    localStorage.setItem(`repile:${identifier}`, JSON.stringify(newValue));
  }

  const getValue: () => T = () => signal.value;

  return { getValue, next };
}

function regularSignal<T>(state: T) {
  const signal = repileSignal(state);

  function next<T>(key: string, payload: T) {
    const newValue = { ...signal.value, [key]: payload };
    signal.value = { ...newValue };
  }

  const getValue: () => T = () => signal.value;

  return { getValue, next };
}

export default function createRepile<T>({
  state,
  persist,
  identifier = "state",
}: {
  state: T;
  persist?: boolean;
  identifier?: string;
}) {
  return persist ? persistSignal(state, identifier) : regularSignal(state);
}
