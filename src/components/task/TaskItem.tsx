import React from "react";

type TaskItemProps = {
  id: string;
  title: string;
  completed: boolean;
  tag?: string;
  dueDate?: string;
  commentsCount?: number;
  assigneeAvatarUrl?: string;
  onToggleComplete: (id: string) => void;
};

const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  tag,
  dueDate,
  commentsCount,
  assigneeAvatarUrl,
  onToggleComplete,
}) => {
  return (
    <div className="grid grid-cols-12 items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg mx-2 my-1">
      <div className="col-span-6 flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 cursor-move" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
        <button
          onClick={() => onToggleComplete(id)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            completed ? "bg-blue-600 border-blue-600" : "border-gray-400 dark:border-gray-600"
          }`}
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {completed && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <span className={`${completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
          {title}
        </span>
      </div>
      <div className="col-span-2 text-gray-600 dark:text-gray-300 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
        </svg>
        <span>{dueDate}</span>
      </div>
      <div className="col-span-2 flex items-center space-x-2">
        {tag && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
            {tag}
          </span>
        )}
      </div>
      <div className="col-span-2 flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4-4h.01M7 8h.01M7 12h.01M7 16h.01M11 16h6" />
          </svg>
          <span>{commentsCount}</span>
        </div>
        {assigneeAvatarUrl && (
          <img
            src={assigneeAvatarUrl}
            alt="Assignee"
            className="w-6 h-6 rounded-full"
          />
        )}
      </div>
    </div>
  );
};

export default TaskItem;
