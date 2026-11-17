import React from "react";

type Tab = {
  label: string;
  count: number;
  key: string;
};

type TaskFilterTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
};

const TaskFilterTabs: React.FC<TaskFilterTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="inline-flex rounded-md bg-gray-100 dark:bg-gray-800 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeTab === tab.key
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
              : "text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {tab.label} <span className="ml-2 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs font-semibold">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TaskFilterTabs;