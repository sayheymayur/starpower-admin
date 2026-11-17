import React, { useState } from "react";
import TaskFilterTabs from "../components/task/TaskFilterTabs";
import TaskItem from "../components/task/TaskItem";
import TaskAddModal from "../components/task/TaskAddModal";
import { useModal } from "../context/ModalContext";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  tag?: string;
  dueDate?: string;
  commentsCount?: number;
  assigneeAvatarUrl?: string;
  status: "todo" | "inprogress" | "completed";
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Finish user onboarding",
    completed: false,
    tag: "Marketing",
    dueDate: "Tomorrow",
    commentsCount: 3,
    assigneeAvatarUrl: "/images/user/user-01.jpg",
    status: "todo",
  },
  {
    id: "2",
    title: "Solve the Dribbble prioritisation issue with the team",
    completed: false,
    dueDate: "Jan 8, 2027",
    commentsCount: 2,
    assigneeAvatarUrl: "/images/user/user-02.jpg",
    status: "todo",
  },
  {
    id: "3",
    title: "Change license and remove products",
    completed: false,
    tag: "Marketing",
    dueDate: "Feb 12, 2027",
    commentsCount: 1,
    assigneeAvatarUrl: "/images/user/user-03.jpg",
    status: "todo",
  },
  {
    id: "4",
    title: "Work In Progress (WIP) Dashboard",
    completed: false,
    dueDate: "Today",
    commentsCount: 1,
    assigneeAvatarUrl: "/images/user/user-04.jpg",
    status: "inprogress",
  },
  {
    id: "5",
    title: "Kanban Flow Manager",
    completed: false,
    tag: "Template",
    dueDate: "Feb 12, 2027",
    commentsCount: 8,
    assigneeAvatarUrl: "/images/user/user-05.jpg",
    status: "inprogress",
  },
  {
    id: "6",
    title: "Product Update - Q4 2024",
    completed: false,
    dueDate: "Feb 12, 2027",
    commentsCount: 8,
    assigneeAvatarUrl: "/images/user/user-06.jpg",
    status: "inprogress",
  },
  {
    id: "7",
    title: "Make figbot send comment when ticket is auto-moved back to inbox",
    completed: false,
    dueDate: "Mar 08, 2027",
    commentsCount: 1,
    assigneeAvatarUrl: "/images/user/user-07.jpg",
    status: "inprogress",
  },
  {
    id: "8",
    title: "Manage internal feedback",
    completed: true,
    dueDate: "Tomorrow",
    commentsCount: 1,
    assigneeAvatarUrl: "/images/user/user-08.jpg",
    status: "completed",
  },
  {
    id: "9",
    title: "Do some projects on React Native with Flutter",
    completed: true,
    tag: "Development",
    dueDate: "Jan 8, 2027",
    commentsCount: 1,
    assigneeAvatarUrl: "/images/user/user-09.jpg",
    status: "completed",
  },
  {
    id: "10",
    title: "Design marketing assets",
    completed: true,
    tag: "Marketing",
    dueDate: "Jan 8, 2027",
    commentsCount: 2,
    assigneeAvatarUrl: "/images/user/user-10.jpg",
    status: "completed",
  },
  {
    id: "11",
    title: "Kanban Flow Manager",
    completed: true,
    tag: "Template",
    dueDate: "Feb 12, 2027",
    commentsCount: 8,
    assigneeAvatarUrl: "/images/user/user-05.jpg",
    status: "completed",
  }
];


const tabs = [
  { label: "All Tasks", count: initialTasks.length, key: "all" },
  { label: "To do", count: initialTasks.filter((t) => t.status === "todo").length, key: "todo" },
  { label: "In Progress", count: initialTasks.filter((t) => t.status === "inprogress").length, key: "inprogress" },
  { label: "Completed", count: initialTasks.filter((t) => t.status === "completed").length, key: "completed" },
];

const TaskList: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [tasks, setTasks] = useState(initialTasks);
  const { isAddTaskModalOpen, setAddTaskModalOpen } = useModal();

  const filteredTasks = activeTab === "all" ? tasks : tasks.filter((t) => t.status === activeTab);

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed, status: !task.completed ? "completed" : "todo" } : task
      )
    );
  };

  const handleAddTaskClick = () => {
    setAddTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddTaskModalOpen(false);
  };

  const handleAddTask = (newTask: {
    title: string;
    dueDate: string;
    status: string;
    tag: string;
    assignee: string;
    description: string;
  }) => {
    const newTaskObj: Task = {
      id: (tasks.length + 1).toString(),
      title: newTask.title,
      completed: newTask.status === "Completed",
      tag: newTask.tag,
      dueDate: newTask.dueDate,
      commentsCount: 0,
      assigneeAvatarUrl: "/images/user/user-01.jpg",
      status: newTask.status.toLowerCase() as "todo" | "inprogress" | "completed",
    };
    setTasks((prev) => [...prev, newTaskObj]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Task List</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10h18M9 16h6m-6 4h6" />
            </svg>
            Filter & Sort
          </button>
          <button
            onClick={handleAddTaskClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add New Task
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <TaskFilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="col-span-6">Task</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Tags</div>
          <div className="col-span-2">Assignee</div>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">No tasks found.</div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} {...task} onToggleComplete={handleToggleComplete} />
          ))
        )}
      </div>

      <TaskAddModal isOpen={isAddTaskModalOpen} onClose={handleCloseModal} onAddTask={handleAddTask} />
    </div>
  );
};

export default TaskList;
