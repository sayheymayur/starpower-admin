import { setAccountsMode, useAccountsMode } from '../utils/accountsMode';

/** Header switch: show test accounts' data instead of real data on every page. */
export default function TestDataToggle() {
  const mode = useAccountsMode();
  const on = mode === 'test';
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 select-none" title="Show only test accounts' data">
      <span className={`text-xs font-medium ${on ? 'text-amber-700 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400'}`}>
        Test data
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setAccountsMode(on ? 'real' : 'test')}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          on ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            on ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}
