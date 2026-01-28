
export enum Difficulty {
  BEGINNER = 'Novizio',
  EASY = 'Facile',
  MEDIUM = 'Intermedio',
  HARD = 'Avanzato',
  EXAM = 'Master'
}

export enum TaskType {
  QUERY = 'SQL Query',
  TRIGGER = 'PL/SQL Trigger',
}

export interface TableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
}

export interface Level {
  id: number;
  zone: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  type: TaskType;
  schema: TableSchema[];
  prompt: string;
  tutorial: string;
  expectedGoal: string;
  x: number; // Position on world map
  y: number;
}

export interface GameState {
  currentLevelId: number | null;
  completedLevels: number[];
  userCode: string;
  isEvaluating: boolean;
  feedback: string | null;
  isSuccess: boolean | null;
  charPos: { x: number, y: number };
  viewMode: 'world' | 'terminal';
}
