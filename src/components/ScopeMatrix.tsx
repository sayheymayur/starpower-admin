import { useMemo, useState } from 'react';
import { SETTINGS_TH_CLASS, SETTINGS_TD_CLASS } from './settings/settingsUi';
import { moduleScopeStrings } from '../utils/scopes';
import type { ScopeEndpoint, ScopeModule } from '../services/auth';

interface ScopeMatrixProps {
  catalog: ScopeModule[];
  selected: Set<string>;
  onChange: (scopes: Set<string>) => void;
  disabled?: boolean;
}

function readWriteScopes(endpoint: ScopeEndpoint): { read?: string; write?: string } {
  const read = endpoint.scopes.find((s) => s.endsWith(':read'));
  const write = endpoint.scopes.find((s) => s.endsWith(':write'));
  return { read, write };
}

function legacyModuleScopes(mod: ScopeModule): { read: string; write: string } {
  const read = mod.scopes?.find((s) => s.endsWith(':read')) ?? `${mod.id}:read`;
  const write = mod.scopes?.find((s) => s.endsWith(':write')) ?? `${mod.id}:write`;
  return { read, write };
}

function MethodBadge({ method }: { method?: string }) {
  if (!method) return null;
  const color =
    method === 'WS'
      ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
      : method === 'GET'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
        : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300';
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${color}`}>
      {method}
    </span>
  );
}

export default function ScopeMatrix({
  catalog,
  selected,
  onChange,
  disabled = false,
}: ScopeMatrixProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const map = new Map<string, ScopeModule[]>();
    for (const mod of catalog) {
      const group = mod.group || 'other';
      const list = map.get(group) ?? [];
      list.push(mod);
      map.set(group, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  const toggle = (scope: string) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(scope)) next.delete(scope);
    else next.add(scope);
    onChange(next);
  };

  const toggleMany = (scopes: string[], checked: boolean) => {
    if (disabled) return;
    const next = new Set(selected);
    for (const s of scopes) {
      if (checked) next.add(s);
      else next.delete(s);
    }
    onChange(next);
  };

  const toggleModule = (mod: ScopeModule, action: 'read' | 'write' | 'all', checked: boolean) => {
    const scopes: string[] = [];
    if (mod.endpoints?.length) {
      for (const ep of mod.endpoints) {
        const { read, write } = readWriteScopes(ep);
        if ((action === 'read' || action === 'all') && read) scopes.push(read);
        if ((action === 'write' || action === 'all') && write) scopes.push(write);
      }
    } else {
      const { read, write } = legacyModuleScopes(mod);
      if (action === 'read' || action === 'all') scopes.push(read);
      if (action === 'write' || action === 'all') scopes.push(write);
    }
    toggleMany(scopes, checked);
  };

  const isModuleOpen = (id: string) => openModules[id] !== false;

  const groupLabel = (group: string) => {
    if (group === 'core') return 'Core';
    if (group === 'astro') return 'Astro';
    if (group === 'admin') return 'Admin';
    return group.charAt(0).toUpperCase() + group.slice(1);
  };

  const moduleSelectionState = (mod: ScopeModule) => {
    const all = moduleScopeStrings(mod);
    const selectedCount = all.filter((s) => selected.has(s)).length;
    return { all, selectedCount, total: all.length };
  };

  const groupScopes = (modules: ScopeModule[]) =>
    [...new Set(modules.flatMap((mod) => moduleScopeStrings(mod)))];

  const toggleGroup = (
    modules: ScopeModule[],
    action: 'read' | 'write' | 'all',
    checked: boolean
  ) => {
    const scopes = groupScopes(modules).filter((s) => {
      if (action === 'read') return s.endsWith(':read');
      if (action === 'write') return s.endsWith(':write');
      return true;
    });
    toggleMany(scopes, checked);
  };

  const groupSelectionState = (modules: ScopeModule[]) => {
    const all = groupScopes(modules);
    const readScopes = all.filter((s) => s.endsWith(':read'));
    const writeScopes = all.filter((s) => s.endsWith(':write'));
    return {
      all,
      selectedCount: all.filter((s) => selected.has(s)).length,
      allReadSelected: readScopes.length > 0 && readScopes.every((s) => selected.has(s)),
      allWriteSelected: writeScopes.length > 0 && writeScopes.every((s) => selected.has(s)),
      allSelected: all.length > 0 && all.every((s) => selected.has(s)),
    };
  };

  return (
    <div className="space-y-5">
      {groups.map(([group, modules]) => {
        const groupState = groupSelectionState(modules);
        return (
          <div key={group}>
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {groupLabel(group)}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {groupState.selectedCount}/{groupState.all.length} scopes selected
              </p>
            </div>
            {!disabled && groupState.all.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/60">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Select all in category:
                </span>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={groupState.allReadSelected}
                    onChange={(e) => toggleGroup(modules, 'read', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  Read
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={groupState.allWriteSelected}
                    onChange={(e) => toggleGroup(modules, 'write', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  Write
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={groupState.allSelected}
                    onChange={(e) => toggleGroup(modules, 'all', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  All
                </label>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {modules.map((mod) => {
              const { all, selectedCount, total } = moduleSelectionState(mod);
              const open = isModuleOpen(mod.id);
              const hasEndpoints = Boolean(mod.endpoints?.length);

              return (
                <div
                  key={mod.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenModules((p) => ({ ...p, [mod.id]: !open }))
                    }
                    className="flex w-full items-center gap-3 bg-gray-50 px-4 py-3 text-left dark:bg-gray-800/60"
                  >
                    <span className="text-gray-400">{open ? '▾' : '▸'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{mod.label}</p>
                      <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{mod.id}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {selectedCount}/{total} scopes
                    </span>
                  </button>

                  {open && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                          <tr>
                            <th className={SETTINGS_TH_CLASS}>
                              {hasEndpoints ? 'Endpoint' : 'Module'}
                            </th>
                            <th className={`${SETTINGS_TH_CLASS} w-16 text-center`}>Read</th>
                            <th className={`${SETTINGS_TH_CLASS} w-16 text-center`}>Write</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {hasEndpoints
                            ? mod.endpoints!.map((ep) => {
                                const { read, write } = readWriteScopes(ep);
                                return (
                                  <tr
                                    key={ep.id}
                                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                                  >
                                    <td className={SETTINGS_TD_CLASS}>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <MethodBadge method={ep.method} />
                                        <span className="text-gray-900 dark:text-white">
                                          {ep.label}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 font-mono text-xs text-gray-400">
                                        {ep.id}
                                        {ep.path && ` · ${ep.path}`}
                                        {ep.command && ` · /${ep.command}`}
                                      </p>
                                    </td>
                                    <td className={`${SETTINGS_TD_CLASS} text-center`}>
                                      {read ? (
                                        <input
                                          type="checkbox"
                                          checked={selected.has(read)}
                                          disabled={disabled}
                                          onChange={() => toggle(read)}
                                          className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                        />
                                      ) : (
                                        '—'
                                      )}
                                    </td>
                                    <td className={`${SETTINGS_TD_CLASS} text-center`}>
                                      {write ? (
                                        <input
                                          type="checkbox"
                                          checked={selected.has(write)}
                                          disabled={disabled}
                                          onChange={() => toggle(write)}
                                          className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                        />
                                      ) : (
                                        '—'
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            : (() => {
                                const { read, write } = legacyModuleScopes(mod);
                                return (
                                  <tr className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                                    <td className={SETTINGS_TD_CLASS}>
                                      <span className="text-gray-900 dark:text-white">
                                        All {mod.label} endpoints
                                      </span>
                                    </td>
                                    <td className={`${SETTINGS_TD_CLASS} text-center`}>
                                      <input
                                        type="checkbox"
                                        checked={selected.has(read)}
                                        disabled={disabled}
                                        onChange={() => toggle(read)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                      />
                                    </td>
                                    <td className={`${SETTINGS_TD_CLASS} text-center`}>
                                      <input
                                        type="checkbox"
                                        checked={selected.has(write)}
                                        disabled={disabled}
                                        onChange={() => toggle(write)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-500"
                                      />
                                    </td>
                                  </tr>
                                );
                              })()}
                          <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                            <td className={`${SETTINGS_TD_CLASS} text-xs font-medium text-gray-500`}>
                              Select all in module
                            </td>
                            <td className={`${SETTINGS_TD_CLASS} text-center`}>
                              <input
                                type="checkbox"
                                checked={all.filter((s) => s.endsWith(':read')).every((s) => selected.has(s))}
                                disabled={disabled}
                                onChange={(e) => toggleModule(mod, 'read', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500"
                              />
                            </td>
                            <td className={`${SETTINGS_TD_CLASS} text-center`}>
                              <input
                                type="checkbox"
                                checked={all.filter((s) => s.endsWith(':write')).every((s) => selected.has(s))}
                                disabled={disabled}
                                onChange={(e) => toggleModule(mod, 'write', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-brand-500"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        );
      })}
    </div>
  );
}
