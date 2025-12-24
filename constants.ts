
export const TILE_SIZE = 40;
export const PLAYER_SIZE = 30;
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 1500;

export const COLORS = {
  floor: '#1e293b', // Slate 800 - darker floor
  grid: '#334155', // Slate 700
  wall: '#0f172a', // Slate 900
  rack: '#b45309', // Amber 700 - Industrial orange
  rackHighlight: '#f59e0b', // Amber 500
  rackDetail: '#78350f', // Darker wood/metal
  zoneIn: '#166534', // Green 800
  zoneOut: '#991b1b', // Red 800
  truck: '#e2e8f0', // Slate 200
  player: '#3b82f6', // Blue 500
  playerStaminaLow: '#ef4444', // Red 500
  text: '#f8fafc',
  hazardYellow: '#fbbf24', // Amber 400
  hazardBlack: '#171717', // Neutral 900
  pallet: '#b45309', // Wood color
  sortingTable: '#475569', // Slate 600
  spill: '#000000', // Oil color (with opacity in code)
};

export const PHYSICS = {
  // Empty Jack: Stops quickly (Responsive), starts fast.
  friction: 0.82, 
  accel: 1.8,
  maxSpeed: 10,

  // Full Load: Glides due to mass (High Inertia), starts very slowly.
  frictionLoaded: 0.96, 
  accelLoaded: 0.3,
  maxSpeedLoaded: 5,
  
  // Slippery surface (Oil)
  frictionOil: 0.99, // Very little stopping power
  accelOil: 0.5, // Hard to get grip
  
  sprintMultiplier: 1.4,
};

export const TEXTS = [
  "Спина ноет...",
  "Где этот накладной лист?",
  "Обед скоро?",
  "Опять пересорт...",
  "Колесико скрипит...",
  "Надо бы кофе...",
  "Кто так паллеты ставит?!",
  "Батарея садится...",
  "Холодно тут...",
  "Кто разлил масло?!",
  "Сортировка не ждет.",
];

export const RANKS = [
    "Стажер",           // Lvl 1
    "Грузчик 3 разряда", // Lvl 2
    "Грузчик 5 разряда", // Lvl 3
    "Водитель Рохли",   // Lvl 4
    "Оператор Погрузчика", // Lvl 5
    "Кладовщик",        // Lvl 6
    "Старший Смены",    // Lvl 7
    "Мастер Склада"     // Lvl 8 (Final)
];
