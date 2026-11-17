import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import Badge from "../components/ui/badge";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import TextArea from "../components/form/input/TextArea";
import Label from "../components/form/Label";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import dashboardAPI from "../services/dashboardAPI";

interface TodoGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface TodoTask {
  id: string;
  title: string;
  description?: string;
  group: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  eta?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  assignedTo?: string;
  tags?: string[];
}

interface TaskStats {
  total: number;
  draft: number;
  active: number;
  completed: number;
  cancelled: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPriorityBadgeColor = (priority: string): "primary" | "success" | "warning" | "error" | "info" => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'info';
  }
};

const getStatusBadgeColor = (status: string): "primary" | "success" | "warning" | "error" | "dark" => {
  switch (status) {
    case 'completed': return 'success';
    case 'active': return 'primary';
    case 'cancelled': return 'dark';
    case 'draft': return 'light';
    default: return 'info';
  }
};

type ViewMode = 'table' | 'kanban' | 'list';

export default function Tasks() {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Task modal
  const taskModal = useModal();
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    group: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
    eta: '',
    assignedTo: '',
    tags: '',
  });

  // Group modal
  const groupModal = useModal();
  const [editingGroup, setEditingGroup] = useState<TodoGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  // Delete confirmation
  const deleteModal = useModal();
  const [itemToDelete, setItemToDelete] = useState<{ type: 'task' | 'group'; id: string; name: string } | null>(null);

  // Fetch data
  const fetchTasks = async () => {
    try {
      const filters: any = {};
      if (selectedGroup) filters.group = selectedGroup;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedPriority) filters.priority = selectedPriority;
      if (searchQuery) filters.search = searchQuery;

      const response = await dashboardAPI.getAllTasks(filters);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await dashboardAPI.getAllGroups();
      if (response.success && response.data) {
        setGroups(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getTaskStats(selectedGroup || undefined);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchGroups(), fetchTasks(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [selectedGroup, selectedStatus, selectedPriority, searchQuery]);

  // Get group name by ID
  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || groupId;
  };

  const getGroupColor = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.color || '#3B82F6';
  };

  // Task handlers
  const openTaskModal = (task?: TodoTask) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        group: task.group,
        priority: task.priority,
        status: task.status,
        eta: task.eta ? new Date(task.eta).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo || '',
        tags: task.tags?.join(', ') || '',
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        group: selectedGroup || (groups.length > 0 ? groups[0].id : ''),
        priority: 'medium',
        status: 'draft',
        eta: '',
        assignedTo: '',
        tags: '',
      });
    }
    taskModal.openModal();
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData: any = {
        title: taskForm.title,
        description: taskForm.description || undefined,
        group: taskForm.group,
        priority: taskForm.priority,
        status: taskForm.status,
        assignedTo: taskForm.assignedTo || undefined,
        tags: taskForm.tags ? taskForm.tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
      };

      if (taskForm.eta) {
        taskData.eta = new Date(taskForm.eta).toISOString();
      }

      if (editingTask) {
        await dashboardAPI.updateTask(editingTask.id, taskData);
      } else {
        await dashboardAPI.createTask(taskData);
      }

      taskModal.closeModal();
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: 'draft' | 'active' | 'completed' | 'cancelled') => {
    try {
      await dashboardAPI.updateTask(taskId, { status: newStatus });
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  // Drag and drop handlers
  const [draggedTask, setDraggedTask] = useState<TodoTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Mobile Kanban: selected status tab
  const [selectedKanbanStatus, setSelectedKanbanStatus] = useState<'draft' | 'active' | 'completed' | 'cancelled'>('active');

  const handleDragStart = (e: React.DragEvent, task: TodoTask) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    setIsDragging(false);
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the column (not just moving to a child element)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: 'draft' | 'active' | 'completed' | 'cancelled') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);
    setIsDragging(false);
    
    if (!draggedTask) return;

    // Don't update if dropped in the same column
    if (draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    // Update task status
    await handleQuickStatusChange(draggedTask.id, targetStatus);
    setDraggedTask(null);
  };

  const handleDeleteTask = async () => {
    if (!itemToDelete) return;
    try {
      await dashboardAPI.deleteTask(itemToDelete.id);
      deleteModal.closeModal();
      setItemToDelete(null);
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // Group handlers
  const openGroupModal = (group?: TodoGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        description: group.description || '',
        color: group.color || '#3B82F6',
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        name: '',
        description: '',
        color: '#3B82F6',
      });
    }
    groupModal.openModal();
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await dashboardAPI.updateGroup(editingGroup.id, groupForm);
      } else {
        await dashboardAPI.createGroup(groupForm);
      }

      groupModal.closeModal();
      await fetchGroups();
      if (!selectedGroup && groups.length === 0) {
        // If no group was selected and this is the first group, select it
        const response = await dashboardAPI.getAllGroups();
        if (response.success && response.data && response.data.length > 0) {
          setSelectedGroup(response.data[0].id);
        }
      }
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!itemToDelete) return;
    try {
      await dashboardAPI.deleteGroup(itemToDelete.id);
      deleteModal.closeModal();
      setItemToDelete(null);
      await fetchGroups();
      if (selectedGroup === itemToDelete.id) {
        setSelectedGroup('');
      }
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const confirmDelete = (type: 'task' | 'group', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'task') {
      handleDeleteTask();
    } else {
      handleDeleteGroup();
    }
  };

  // Filtered tasks count
  const filteredTasksCount = tasks.length;

  // Group tasks by status for Kanban view - must be before any conditional returns
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, TodoTask[]> = {
      draft: [],
      active: [],
      completed: [],
      cancelled: [],
    };
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const statusColumns = [
    { key: 'draft', label: 'Draft', color: 'gray' },
    { key: 'active', label: 'Active', color: 'blue' },
    { key: 'completed', label: 'Completed', color: 'green' },
    { key: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tasks Management</h1>
        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Kanban View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <Button onClick={() => openGroupModal()} variant="outline">
            Manage Groups
          </Button>
          <Button onClick={() => openTaskModal()}>
            + New Task
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Statistics - Hidden on mobile */}
      {stats && (
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Draft</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.draft}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{stats.active}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            <div className="text-2xl font-bold text-success-600 dark:text-success-400 mt-1">{stats.completed}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Cancelled</div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.cancelled}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Search</Label>
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Label>Group</Label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <Label>Priority</Label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        {(selectedGroup || selectedStatus || selectedPriority || searchQuery) && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedGroup('');
                setSelectedStatus('');
                setSelectedPriority('');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredTasksCount} task{filteredTasksCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Tasks Views */}
      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task to get started.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-700">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Task Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Group
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Priority
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    ETA
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-white">{task.title}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        color="info"
                        variant="light"
                        style={{ backgroundColor: getGroupColor(task.group) + '20', color: getGroupColor(task.group) }}
                      >
                        {getGroupName(task.group)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge color={getPriorityBadgeColor(task.priority)} variant="light">
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge color={getStatusBadgeColor(task.status)} variant="light">
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(task.eta)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.status !== 'active' && (
                          <button
                            onClick={() => handleQuickStatusChange(task.id, 'active')}
                            className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                            title="Mark as Active"
                          >
                            Active
                          </button>
                        )}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleQuickStatusChange(task.id, 'completed')}
                            className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                        )}
                        {task.status !== 'draft' && (
                          <button
                            onClick={() => handleQuickStatusChange(task.id, 'draft')}
                            className="px-2 py-1 text-xs font-medium rounded bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
                            title="Mark as Draft"
                          >
                            Draft
                          </button>
                        )}
                        {task.status !== 'cancelled' && (
                          <button
                            onClick={() => handleQuickStatusChange(task.id, 'cancelled')}
                            className="px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                            title="Mark as Cancelled"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => openTaskModal(task)}
                          className="px-2 py-1 text-xs font-medium rounded bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 transition-colors"
                          title="Edit Task"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete('task', task.id, task.title)}
                          className="px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="space-y-4">
          {/* Mobile: Status Tabs - Hidden on desktop */}
          <div className="md:hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-6 px-6">
              {statusColumns.map((column) => (
                <button
                  key={column.key}
                  onClick={() => setSelectedKanbanStatus(column.key as 'draft' | 'active' | 'completed' | 'cancelled')}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    selectedKanbanStatus === column.key
                      ? `bg-${column.color === 'gray' ? 'gray' : column.color}-500 text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {column.label}
                  <Badge
                    color={getStatusBadgeColor(column.key)}
                    variant={selectedKanbanStatus === column.key ? 'solid' : 'light'}
                    size="sm"
                    className={selectedKanbanStatus === column.key ? 'bg-white/20 text-white' : ''}
                  >
                    {tasksByStatus[column.key]?.length || 0}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: All columns side by side */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColumns.map((column) => (
              <div
                key={column.key}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-colors ${
                  dragOverColumn === column.key
                    ? 'border-brand-500 dark:border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key as 'draft' | 'active' | 'completed' | 'cancelled')}
              >
                <div className={`p-4 border-b border-gray-200 dark:border-gray-700 bg-${column.color}-50 dark:bg-${column.color}-900/20`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{column.label}</h3>
                    <Badge color={getStatusBadgeColor(column.key)} variant="light" size="sm">
                      {tasksByStatus[column.key]?.length || 0}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {tasksByStatus[column.key] && tasksByStatus[column.key].length > 0 ? (
                    tasksByStatus[column.key].map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-move ${
                          draggedTask?.id === task.id ? 'opacity-50' : ''
                        }`}
                        onClick={(e) => {
                          // Don't open modal if dragging
                          if (!isDragging && draggedTask?.id !== task.id) {
                            openTaskModal(task);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-800 dark:text-white text-sm flex-1">{task.title}</h4>
                          <svg
                            className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
                          </svg>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            color="info"
                            variant="light"
                            size="sm"
                            style={{ backgroundColor: getGroupColor(task.group) + '20', color: getGroupColor(task.group) }}
                          >
                            {getGroupName(task.group)}
                          </Badge>
                          <Badge color={getPriorityBadgeColor(task.priority)} variant="light" size="sm">
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </div>
                        {task.eta && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            📅 {formatDate(task.eta)}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          {task.status !== 'active' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(task.id, 'active'); }}
                              className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                              title="Mark as Active"
                            >
                              Active
                            </button>
                          )}
                          {task.status !== 'completed' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(task.id, 'completed'); }}
                              className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                              title="Mark as Completed"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed rounded-lg transition-colors ${
                        dragOverColumn === column.key
                          ? 'border-brand-400 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                          : 'border-transparent'
                      }`}
                    >
                      {dragOverColumn === column.key ? 'Drop task here' : `No ${column.label.toLowerCase()} tasks`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Single column view based on selected tab */}
          <div className="md:hidden">
            {statusColumns.map((column) => {
              if (selectedKanbanStatus !== column.key) return null;
              
              return (
                <div
                  key={column.key}
                  className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-colors ${
                    dragOverColumn === column.key
                      ? 'border-brand-500 dark:border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.key as 'draft' | 'active' | 'completed' | 'cancelled')}
                >
                  <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                    column.color === 'gray' ? 'bg-gray-50 dark:bg-gray-900/20' :
                    column.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    column.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                    'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{column.label}</h3>
                      <Badge color={getStatusBadgeColor(column.key)} variant="light" size="sm">
                        {tasksByStatus[column.key]?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                    {tasksByStatus[column.key] && tasksByStatus[column.key].length > 0 ? (
                      tasksByStatus[column.key].map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-move ${
                            draggedTask?.id === task.id ? 'opacity-50' : ''
                          }`}
                          onClick={() => {
                            // Don't open modal if dragging
                            if (!isDragging && draggedTask?.id !== task.id) {
                              openTaskModal(task);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-800 dark:text-white text-sm flex-1">{task.title}</h4>
                            <svg
                              className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8h16M4 16h16"
                              />
                            </svg>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: getGroupColor(task.group) + '20', color: getGroupColor(task.group) }}
                            >
                              {getGroupName(task.group)}
                            </span>
                            <Badge color={getPriorityBadgeColor(task.priority)} variant="light" size="sm">
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </div>
                          {task.eta && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              📅 {formatDate(task.eta)}
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            {task.status !== 'active' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(task.id, 'active'); }}
                                className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                                title="Mark as Active"
                              >
                                Active
                              </button>
                            )}
                            {task.status !== 'completed' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleQuickStatusChange(task.id, 'completed'); }}
                                className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                title="Mark as Completed"
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className={`text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed rounded-lg transition-colors ${
                          dragOverColumn === column.key
                            ? 'border-brand-400 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                            : 'border-transparent'
                        }`}
                      >
                        {dragOverColumn === column.key ? 'Drop task here' : `No ${column.label.toLowerCase()} tasks`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{task.title}</h3>
                    <Badge color={getStatusBadgeColor(task.status)} variant="light" size="sm">
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                    <Badge color={getPriorityBadgeColor(task.priority)} variant="light" size="sm">
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    <Badge
                      color="info"
                      variant="light"
                      size="sm"
                      style={{ backgroundColor: getGroupColor(task.group) + '20', color: getGroupColor(task.group) }}
                    >
                      {getGroupName(task.group)}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {task.eta && <span>📅 ETA: {formatDate(task.eta)}</span>}
                    {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        {task.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} color="light" variant="light" size="sm">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && <span>+{task.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.status !== 'active' && (
                    <button
                      onClick={() => handleQuickStatusChange(task.id, 'active')}
                      className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                      title="Mark as Active"
                    >
                      Active
                    </button>
                  )}
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleQuickStatusChange(task.id, 'completed')}
                      className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                      title="Mark as Completed"
                    >
                      Complete
                    </button>
                  )}
                  {task.status !== 'draft' && (
                    <button
                      onClick={() => handleQuickStatusChange(task.id, 'draft')}
                      className="px-2 py-1 text-xs font-medium rounded bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 transition-colors"
                      title="Mark as Draft"
                    >
                      Draft
                    </button>
                  )}
                  {task.status !== 'cancelled' && (
                    <button
                      onClick={() => handleQuickStatusChange(task.id, 'cancelled')}
                      className="px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                      title="Mark as Cancelled"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => openTaskModal(task)}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete('task', task.id, task.title)}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <Modal isOpen={taskModal.isOpen} onClose={taskModal.closeModal} className="max-w-2xl m-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <TextArea
                value={taskForm.description}
                onChange={(value) => setTaskForm({ ...taskForm, description: value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="group">Group *</Label>
                <select
                  id="group"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={taskForm.group}
                  onChange={(e) => setTaskForm({ ...taskForm, group: e.target.value })}
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label htmlFor="eta">ETA</Label>
                <Input
                  id="eta"
                  type="date"
                  value={taskForm.eta}
                  onChange={(e) => setTaskForm({ ...taskForm, eta: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                type="text"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                placeholder="User ID or name"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                type="text"
                value={taskForm.tags}
                onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                placeholder="Comma-separated tags (e.g., bug, frontend, urgent)"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={taskModal.closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Group Modal */}
      <Modal isOpen={groupModal.isOpen} onClose={groupModal.closeModal} className="max-w-xl m-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {editingGroup ? 'Edit Group' : 'Create New Group'}
          </h2>
          <form onSubmit={handleGroupSubmit} className="space-y-4">
            <div>
              <Label htmlFor="groupName">Name *</Label>
              <Input
                id="groupName"
                type="text"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                placeholder="Enter group name"
                required
              />
            </div>
            <div>
              <Label htmlFor="groupDescription">Description</Label>
              <TextArea
                value={groupForm.description}
                onChange={(value) => setGroupForm({ ...groupForm, description: value })}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="groupColor">Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="groupColor"
                  type="color"
                  value={groupForm.color}
                  onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={groupForm.color}
                  onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={groupModal.closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGroup ? 'Update Group' : 'Create Group'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Groups Management Modal */}
      {groups.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Groups</h3>
            <Button size="sm" onClick={() => openGroupModal()}>
              + New Group
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
                style={{ borderLeftColor: group.color || '#3B82F6', borderLeftWidth: '4px' }}
              >
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{group.name}</div>
                  {group.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openGroupModal(group)}
                    className="text-brand-500 hover:text-brand-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete('group', group.id, group.name)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-md m-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirm Delete</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete {itemToDelete?.type === 'task' ? 'task' : 'group'}{' '}
            <span className="font-semibold">"{itemToDelete?.name}"</span>? This action cannot be undone.
          </p>
          {itemToDelete?.type === 'group' && (
            <p className="text-sm text-warning-600 dark:text-warning-400 mb-6">
              Note: Groups with existing tasks cannot be deleted. Please delete or move all tasks first.
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={deleteModal.closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

