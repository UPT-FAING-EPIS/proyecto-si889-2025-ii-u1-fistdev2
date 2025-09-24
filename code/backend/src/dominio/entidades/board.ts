export interface Board {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // userId
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  color: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string; // userId
  assignedToUser?: {
    id: string;
    name: string;
    email: string;
  };
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  position: number;
  status: string; // columna actual
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // userId
  lastModifiedBy: string; // userId
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invitedBy: string;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'moved' | 'assigned' | 'commented' | 'completed';
  details: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}