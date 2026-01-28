
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

export interface TutorialStep {
  label: string;
  content: string;
  type: 'text' | 'tables' | 'logic' | 'code';
  code?: string;
  highlightedTables?: string[];
}

export interface Level {
  id: number;
  sector: number; // 1: Basi, 2: Join, 3: Analisi, 4: Trigger
  title: string;
  description: string;
  difficulty: Difficulty;
  type: TaskType;
  prompt: string;
  theory: string;
  steps: TutorialStep[];
  x: number;
  y: number;
}

export type SectorID = 'basi' | 'join' | 'analisi' | 'trigger';
export type DatabaseID = 'aste' | 'ospedale';

export interface GameState {
  currentDatabase: DatabaseID | null;
  currentSectorId: SectorID | null;
  currentLevelId: number | null;
  completedLevels: Record<string, number[]>; // key: "db_sector"
  userCode: string;
  isEvaluating: boolean;
  feedback: string | null;
  isSuccess: boolean | null;
  charPos: { x: number, y: number };
  isTraveling: boolean;
}
