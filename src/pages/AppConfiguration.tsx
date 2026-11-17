import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  appConfigAPI,
  AppConfigData,
  AppConfigResponse,
  AppConfigValue,
} from "../services/api";

type ActiveTab = "user" | "partner";

type ValueType = "boolean" | "number" | "string";

function inferValueType(value: AppConfigValue): ValueType {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "string";
}

function diffPatch(
  current: AppConfigData,
  baseline: AppConfigData
): Partial<AppConfigData> {
  const patch: Partial<AppConfigData> = {};
  const keys = new Set([...Object.keys(current), ...Object.keys(baseline)]);
  keys.forEach((key) => {
    if (current[key] !== baseline[key]) {
      patch[key] = current[key];
    }
  });
  return patch;
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function parseNewValue(raw: string, type: ValueType): AppConfigValue | null {
  if (type === "boolean") {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  }
  if (type === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return raw;
}

type ConfigPanelProps = {
  title: string;
  description: string;
  load: () => Promise<AppConfigResponse>;
  save: (patch: Partial<AppConfigData>) => Promise<AppConfigResponse>;
};

function ConfigPanel({ title, description, load, save }: ConfigPanelProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [serverConfig, setServerConfig] = useState<AppConfigData | null>(null);
  const [defaults, setDefaults] = useState<AppConfigData>({});
  const [keys, setKeys] = useState<string[]>([]);
  const [draftConfig, setDraftConfig] = useState<AppConfigData>({});

  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<ValueType>("boolean");
  const [newValue, setNewValue] = useState("true");

  const patch = useMemo(() => {
    if (!serverConfig) return {};
    return diffPatch(draftConfig, serverConfig);
  }, [draftConfig, serverConfig]);

  const isDirty = serverConfig ? Object.keys(patch).length > 0 : false;

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await load();
      setServerConfig(res.data);
      setDraftConfig(res.data);
      setDefaults(res.defaults ?? {});
      setKeys(res.keys ?? Object.keys(res.data));
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to load configuration";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggle = (key: string) => {
    setDraftConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess(null);
    setError(null);
  };

  const onValueChange = (key: string, value: AppConfigValue) => {
    setDraftConfig((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
    setError(null);
  };

  const onReset = () => {
    if (!serverConfig) return;
    setDraftConfig(serverConfig);
    setSuccess(null);
    setError(null);
  };

  const onSave = async () => {
    if (!serverConfig || Object.keys(patch).length === 0) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await save(patch);
      setServerConfig(res.data);
      setDraftConfig(res.data);
      setDefaults(res.defaults ?? defaults);
      setKeys(res.keys ?? Object.keys(res.data));
      setSuccess("Configuration updated.");
    } catch (e) {
      if (e instanceof ApiError) {
        const response = e.response as { errors?: string[] };
        const validationErrors = response?.errors;
        if (Array.isArray(validationErrors) && validationErrors.length) {
          setError(validationErrors.join("\n"));
        } else {
          setError(e.message);
        }
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to update configuration");
      }
    } finally {
      setSaving(false);
    }
  };

  const onAddKey = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey) {
      setError("Key name is required.");
      return;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmedKey)) {
      setError("Key must start with a letter and contain only letters, numbers, or underscores.");
      return;
    }
    if (draftConfig[trimmedKey] !== undefined) {
      setError(`Key "${trimmedKey}" already exists.`);
      return;
    }

    const parsed = parseNewValue(newValue, newType);
    if (parsed === null) {
      setError(`Invalid ${newType} value.`);
      return;
    }

    setDraftConfig((prev) => ({ ...prev, [trimmedKey]: parsed }));
    setKeys((prev) => (prev.includes(trimmedKey) ? prev : [...prev, trimmedKey]));
    setNewKey("");
    setNewValue(newType === "boolean" ? "true" : newType === "number" ? "0" : "");
    setSuccess(null);
    setError(null);
  };

  const sortedKeys = useMemo(() => {
    const all = new Set([...keys, ...Object.keys(draftConfig)]);
    return Array.from(all).sort();
  }, [keys, draftConfig]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchConfig}
            disabled={loading || saving}
            className="px-3 py-2 text-sm font-semibold rounded-md border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            Refresh
          </button>
          <button
            onClick={onReset}
            disabled={!isDirty || loading || saving}
            className="px-3 py-2 text-sm font-semibold rounded-md border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            Reset
          </button>
          <button
            onClick={onSave}
            disabled={!isDirty || loading || saving}
            className="px-3 py-2 text-sm font-semibold rounded-md bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200 whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          {success}
        </div>
      )}

      {loading && !serverConfig ? (
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedKeys.map((key) => {
            const value = draftConfig[key];
            const type = inferValueType(
              value ?? defaults[key] ?? (typeof value === "number" ? 0 : "")
            );
            const defaultValue = defaults[key];

            return (
              <div
                key={key}
                className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatLabel(key)}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Key: <span className="font-mono">{key}</span>
                      {defaultValue !== undefined && value !== defaultValue && (
                        <span className="ml-2 text-amber-600 dark:text-amber-400">
                          (default: {String(defaultValue)})
                        </span>
                      )}
                    </div>
                  </div>

                  {type === "boolean" ? (
                    <button
                      onClick={() => onToggle(key)}
                      disabled={loading || saving || !serverConfig}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        value ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
                      } disabled:opacity-60`}
                      aria-pressed={!!value}
                      aria-label={`Toggle ${key}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          value ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  ) : type === "number" ? (
                    <input
                      type="number"
                      value={typeof value === "number" ? value : ""}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n)) onValueChange(key, n);
                      }}
                      disabled={loading || saving || !serverConfig}
                      className="w-28 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  ) : (
                    <input
                      type="text"
                      value={typeof value === "string" ? value : String(value ?? "")}
                      onChange={(e) => onValueChange(key, e.target.value)}
                      disabled={loading || saving || !serverConfig}
                      className="w-full max-w-[180px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Add new key
        </h3>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          New keys are saved with the next update — no backend deploy required.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key
            </label>
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="showWalletBanner"
              className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={newType}
              onChange={(e) => {
                const t = e.target.value as ValueType;
                setNewType(t);
                setNewValue(t === "boolean" ? "true" : t === "number" ? "0" : "");
              }}
              className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              <option value="boolean">boolean</option>
              <option value="number">number</option>
              <option value="string">string</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Value
            </label>
            {newType === "boolean" ? (
              <select
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <input
                type={newType === "number" ? "number" : "text"}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            )}
          </div>
          <button
            onClick={onAddKey}
            disabled={loading || saving}
            className="px-3 py-2 text-sm font-semibold rounded-md border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            Add to draft
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Pending update payload (only changed keys)
        </div>
        <pre className="mt-2 text-xs overflow-auto text-gray-800 dark:text-gray-200">
          {JSON.stringify(patch, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function AppConfiguration() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("user");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Configuration
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage User App and Partner App feature flags and dynamic config keys.
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-md bg-gray-100 dark:bg-gray-800 p-1">
        <button
          onClick={() => setActiveTab("user")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeTab === "user"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
              : "text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          User App
        </button>
        <button
          onClick={() => setActiveTab("partner")}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeTab === "partner"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
              : "text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Partner App
        </button>
      </div>

      {activeTab === "user" ? (
        <ConfigPanel
          key="user"
          title="User App Config"
          description="Reads from GET and updates via partial POST to /api/app/user-app-config."
          load={() => appConfigAPI.getUserAppConfig()}
          save={(patch) => appConfigAPI.updateUserAppConfigPartial(patch)}
        />
      ) : (
        <ConfigPanel
          key="partner"
          title="Partner App Config"
          description="Reads from GET and updates via partial POST to /api/app/partner-app-config."
          load={() => appConfigAPI.getPartnerAppConfig()}
          save={(patch) => appConfigAPI.updatePartnerAppConfigPartial(patch)}
        />
      )}
    </div>
  );
}
