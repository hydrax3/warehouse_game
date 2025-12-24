
export type Vector2 = { x: number; y: number };

export enum GameMode {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  ENDING = 'ENDING',
}

export enum TaskType {
  INBOUND = 'INBOUND',   // Unload truck -> Put on Rack
  OUTBOUND = 'OUTBOUND', // Take from Rack -> Load truck
  INVENTORY = 'INVENTORY', // Go to Rack -> Count items
  SORTING = 'SORTING',    // Go to Sorting Table -> Sort bad/good items
  CLEANING = 'CLEANING',   // Go to Spill -> Clean it up
  ELECTRICAL = 'ELECTRICAL' // Fix wires
}

export type TruckState = 'arriving' | 'waiting' | 'departing';

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'wall' | 'rack' | 'zone_in' | 'zone_out' | 'truck' | 'decoration' | 'pallet' | 'sorting_table' | 'spill' | 'electrical_panel' | 'operator_console';
  subtype?: 'stain' | 'crack' | 'tire_mark' | 'invisible'; // Added invisible subtype for truck collision
  rotation?: number;
  
  // Specific properties
  truckState?: TruckState;
  targetY?: number;
  loadProgress?: number; // 0-1 for visual loading bar on truck
  inventory?: number; // Number of boxes stored on a rack
  linkedTruckId?: string; // For walls attached to a truck
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  life: number; // frames remaining
  color: string;
}

export interface GameState {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    stamina: number;
    maxStamina: number;
    money: number;
    hasPallet: boolean;
    loadCount: number; // 0 to maxLoad
    maxLoad: number;
    speedMultiplier: number; // Upgradeable
  };
  level: {
    current: number; // This maps to RANKS index
    xp: number;
    xpToNext: number;
  };
  dailyQuota: {
    current: number; // Boxes moved today
    required: number; // Goal for the day
  };
  keys: { [key: string]: boolean };
  camera: Vector2;
  entities: Entity[];
  activeTask: {
    id: string;
    type: TaskType;
    step: 'pickup' | 'deliver' | 'count' | 'sort' | 'clean' | 'fix' | 'sign';
    targetId: string; // Entity ID (Truck or Rack)
    description: string;
    reward: number;
    boxCount: number;
    truckId?: string; // Link to the truck entity
  } | null;
  floatingTexts: FloatingText[];
  stats: {
    boxesMoved: number;
    daysWorked: number;
  };
  upgrades: {
    coffee: boolean;
    gloves: boolean;
    electricJack: boolean;
  };
}

export type MiniGameType = 'PACKING' | 'INVENTORY' | 'SORTING' | 'CLEANING' | 'PAPERWORK' | 'WIRES';

export interface MiniGameState {
  type: MiniGameType;
  targetId: string; // The rack/entity involved
  data?: any; // Specific data for the game (e.g. correct count)
  onComplete: (success: boolean, score?: number) => void;
}
