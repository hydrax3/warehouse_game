import React, { useEffect, useRef, useState } from 'react';
import { GameState, GameMode, TaskType, Entity, FloatingText, MiniGameState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT, COLORS, PHYSICS, TILE_SIZE, TEXTS, PLAYER_SIZE, RANKS } from '../constants';
import { Package, Banknote, Truck as TruckIcon, ShoppingCart, Coffee, Zap, Hand, Settings, Flashlight, Volume2, VolumeX, CheckCircle, Box, ClipboardCheck, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star, TrendingUp, CalendarCheck, Droplets, ArrowLeftRight, Eraser, FileText, PenTool, Cable, Monitor, Container, Smile, Pizza, Cigarette } from 'lucide-react';

interface MiniGameProps {
  data?: any;
  onComplete: (success: boolean, score?: number) => void;
  playSound: (type: 'success' | 'click' | 'tape' | 'levelup' | 'error' | 'clean') => void;
  onClose: () => void;
}

// --- NEW MINI GAMES ---

const TruckLoadingMiniGame: React.FC<MiniGameProps> = ({ data, onComplete, playSound, onClose }) => {
    // data.mode = 'LOAD' (Outbound) or 'UNLOAD' (Inbound)
    // data.targetCount = number of boxes
    
    const mode = data?.mode || 'LOAD';
    const targetCount = data?.targetCount || 5;
    
    // Direction: 0=Up, 1=Down, 2=Left, 3=Right
    const [queue, setQueue] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [animating, setAnimating] = useState<string | null>(null); // 'correct' | 'wrong'

    // Initialize Queue
    useEffect(() => {
        const newQueue = Array.from({ length: targetCount }).map(() => Math.floor(Math.random() * 4));
        setQueue(newQueue);
    }, [targetCount]);

    const handleInput = (direction: number) => {
        if (queue.length === 0) return;

        const expected = queue[0];
        if (direction === expected) {
            playSound('click');
            setScore(s => s + 1);
            setAnimating('correct');
            
            // Remove first item
            setTimeout(() => {
                setQueue(prev => prev.slice(1));
                setAnimating(null);
                
                // Check win condition inside the timeout to allow animation to play
                if (queue.length <= 1) { // 1 because we haven't sliced yet in the state check logic usually, but here we check queue length
                     setTimeout(() => onComplete(true), 200);
                }
            }, 100);
        } else {
            playSound('error');
            setAnimating('wrong');
            setTimeout(() => setAnimating(null), 200);
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (queue.length === 0) return;

            let dir = -1;
            if (e.code === 'ArrowUp' || e.code === 'KeyW') dir = 0;
            else if (e.code === 'ArrowDown' || e.code === 'KeyS') dir = 1;
            else if (e.code === 'ArrowLeft' || e.code === 'KeyA') dir = 2;
            else if (e.code === 'ArrowRight' || e.code === 'KeyD') dir = 3;

            if (dir !== -1) {
                e.preventDefault();
                handleInput(dir);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [queue]);

    const isComplete = score >= targetCount;

    const renderArrow = (dir: number, size: number = 24) => {
        switch(dir) {
            case 0: return <ArrowUp size={size} />;
            case 1: return <ArrowDown size={size} />;
            case 2: return <ArrowLeft size={size} />;
            case 3: return <ArrowRight size={size} />;
            default: return null;
        }
    };

    const getDirColor = (dir: number) => {
        switch(dir) {
            case 0: return 'text-yellow-400';
            case 1: return 'text-blue-400';
            case 2: return 'text-red-400';
            case 3: return 'text-green-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in zoom-in duration-200">
             <div className="bg-slate-800 border-2 border-slate-500 rounded-lg p-6 w-[400px] shadow-2xl relative overflow-hidden flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Container className="text-slate-400" /> {mode === 'LOAD' ? 'ПОГРУЗКА' : 'РАЗГРУЗКА'}
                    </h2>
                    <div className="font-mono text-xl font-bold text-emerald-400">{score} / {targetCount}</div>
                </div>

                <div className="relative h-64 w-full flex flex-col items-center justify-center mb-4">
                     
                     {/* Background Truck Interior */}
                     <div className="absolute inset-0 bg-slate-900 border-4 border-slate-700 rounded-lg overflow-hidden">
                         <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)_100%)] bg-[length:20px_20px]"></div>
                     </div>

                     {/* The Queue (Next items) */}
                     <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-50">
                         {queue.slice(1, 4).map((dir, i) => (
                             <div key={i} className="w-10 h-10 bg-slate-700 border border-slate-500 rounded flex items-center justify-center">
                                 <span className={getDirColor(dir)}>{renderArrow(dir, 16)}</span>
                             </div>
                         ))}
                     </div>

                     {/* Active Box */}
                     {queue.length > 0 ? (
                         <div className={`relative w-32 h-32 bg-amber-600 border-4 border-amber-800 rounded-lg shadow-2xl flex items-center justify-center transition-all duration-100 
                            ${animating === 'correct' ? 'scale-110 opacity-0 translate-y-10' : ''}
                            ${animating === 'wrong' ? 'translate-x-2 border-red-500 bg-red-900' : ''}
                         `}>
                             {/* Box details */}
                             <div className="absolute top-2 left-2 w-full h-px bg-amber-400/30"></div>
                             <div className="absolute bottom-0 right-0 w-8 h-8 border-t border-l border-amber-800/50"></div>
                             
                             {/* Arrow Prompt */}
                             <div className={`transform scale-150 ${getDirColor(queue[0])} drop-shadow-md`}>
                                 {renderArrow(queue[0], 48)}
                             </div>
                             
                             <div className="absolute -bottom-8 text-xs text-slate-400 font-mono uppercase tracking-widest animate-pulse">
                                Нажми
                             </div>
                         </div>
                     ) : (
                         <div className="text-emerald-500 font-bold text-2xl animate-bounce">ГОТОВО!</div>
                     )}

                </div>

                <div className="text-center w-full bg-slate-900/50 p-2 rounded border border-slate-700">
                    <p className="text-slate-400 text-xs font-mono">
                        Используйте <span className="text-white font-bold">WASD</span> или <span className="text-white font-bold">СТРЕЛКИ</span>
                    </p>
                </div>
             </div>
        </div>
    );
};

const PaperworkMiniGame: React.FC<MiniGameProps> = ({ onComplete, playSound, onClose }) => {
    const [checks, setChecks] = useState([false, false, false]);
    const [signature, setSignature] = useState<{x: number, y: number}[]>([]);
    const isDrawing = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCheck = (i: number) => {
        playSound('click');
        const newChecks = [...checks];
        newChecks[i] = true;
        setChecks(newChecks);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setSignature(prev => [...prev, {x, y}]);
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000088';
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const startDrawing = (e: React.MouseEvent) => {
        isDrawing.current = true;
        const rect = canvasRef.current!.getBoundingClientRect();
        const ctx = canvasRef.current!.getContext('2d');
        ctx?.beginPath();
        ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const isComplete = checks.every(c => c) && signature.length > 20;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
             <div className="bg-white text-slate-900 border-2 border-slate-300 rounded p-8 w-[400px] shadow-2xl relative font-sans">
                 <div className="absolute top-0 right-0 p-2 opacity-50 pointer-events-none text-6xl font-black text-red-500/20 rotate-12 border-4 border-red-500/20 rounded m-4">КОПИЯ</div>
                 
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                     <FileText size={24}/> ТОВАРНАЯ НАКЛАДНАЯ
                 </h2>

                 <div className="space-y-3 mb-6 font-mono text-sm">
                     {['Груз проверен', 'Упаковка целая', 'Пломба на месте'].map((label, i) => (
                         <label key={i} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 rounded">
                             <div 
                                onClick={() => !checks[i] && handleCheck(i)}
                                className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-all ${checks[i] ? 'bg-black text-white' : 'bg-white'}`}
                             >
                                 {checks[i] && <CheckCircle size={16}/>}
                             </div>
                             <span className={checks[i] ? 'line-through text-slate-500' : ''}>{label}</span>
                         </label>
                     ))}
                 </div>

                 <div className="mb-4">
                     <div className="text-xs uppercase font-bold mb-1 text-slate-500">Подпись водителя</div>
                     <canvas 
                        ref={canvasRef}
                        width={330}
                        height={100}
                        className="border-b-2 border-black bg-slate-50 cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseUp={() => isDrawing.current = false}
                        onMouseLeave={() => isDrawing.current = false}
                        onMouseMove={handleMouseMove}
                     />
                     <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-blue-800 flex items-center gap-1"><PenTool size={10}/> Поставьте подпись</span>
                     </div>
                 </div>

                 <button 
                    disabled={!isComplete}
                    onClick={() => { playSound('success'); onComplete(true); }}
                    className={`w-full py-3 font-bold uppercase tracking-widest transition-all ${isComplete ? 'bg-black text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                 >
                     Подтвердить
                 </button>
             </div>
        </div>
    );
};

const WiresMiniGame: React.FC<MiniGameProps> = ({ onComplete, playSound, onClose }) => {
    // 0: Red, 1: Blue, 2: Yellow, 3: Green
    const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];
    const [leftSide] = useState<number[]>([0, 1, 2, 3].sort(() => Math.random() - 0.5));
    const [rightSide] = useState<number[]>([0, 1, 2, 3].sort(() => Math.random() - 0.5));
    const [connections, setConnections] = useState<{[key: number]: number}>({}); // leftIndex -> rightIndex
    const [activeWire, setActiveWire] = useState<{start: number, endPos: {x:number, y:number}} | null>(null);

    const isSolved = Object.keys(connections).length === 4;

    useEffect(() => {
        if (isSolved) {
            setTimeout(() => onComplete(true), 500);
        }
    }, [isSolved]);

    const handleMouseDown = (index: number) => {
        if (connections[index] !== undefined) return;
        playSound('click');
        setActiveWire({ start: index, endPos: {x: 0, y: 0} });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!activeWire) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setActiveWire({ 
            ...activeWire, 
            endPos: { x: e.clientX - rect.left, y: e.clientY - rect.top } 
        });
    };

    const handleMouseUp = (e: React.MouseEvent, rightIndex?: number) => {
        if (!activeWire) return;
        
        if (rightIndex !== undefined) {
             // Check if match
             const leftColor = leftSide[activeWire.start];
             const rightColor = rightSide[rightIndex];
             
             if (leftColor === rightColor) {
                 playSound('success');
                 setConnections(prev => ({...prev, [activeWire.start]: rightIndex}));
             } else {
                 playSound('error');
             }
        }
        
        setActiveWire(null);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in zoom-in duration-200">
             <div className="bg-slate-800 border-2 border-yellow-500 rounded p-6 w-[500px] shadow-2xl relative" onMouseMove={handleMouseMove} onMouseUp={(e) => handleMouseUp(e)}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="text-yellow-400" /> ЭЛЕКТРОЩИТОК
                    </h2>
                    <div className="text-xs text-slate-400 uppercase tracking-widest">ВОССТАНОВИТЕ ЦЕПЬ</div>
                </div>
                
                <div className="flex justify-between relative h-[300px] bg-slate-900 rounded p-4 border border-slate-700">
                    {/* Active Wire SVG Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                        {Object.entries(connections).map(([leftIdx, rightIdx]) => {
                             const l = parseInt(leftIdx);
                             const r = Number(rightIdx);
                             const y1 = 40 + l * 70;
                             const y2 = 40 + r * 70;
                             return <line key={l} x1="40" y1={y1} x2="440" y2={y2} stroke={colors[leftSide[l]]} strokeWidth="8" strokeLinecap="round" opacity="0.8" />;
                        })}
                        {activeWire && (
                            <line 
                                x1="40" 
                                y1={40 + activeWire.start * 70} 
                                x2={activeWire.endPos.x - 24} // Offset for padding
                                y2={activeWire.endPos.y - 80} // Offset for padding relative to container
                                stroke={colors[leftSide[activeWire.start]]} 
                                strokeWidth="8" 
                                strokeLinecap="round" 
                            />
                        )}
                    </svg>

                    {/* Left Plugs */}
                    <div className="flex flex-col justify-between z-20">
                        {leftSide.map((colorIdx, i) => (
                            <div 
                                key={i} 
                                onMouseDown={() => handleMouseDown(i)}
                                className={`w-8 h-12 rounded-r flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${connections[i] !== undefined ? 'opacity-50' : ''}`}
                                style={{backgroundColor: colors[colorIdx]}}
                            >
                                <div className="w-2 h-2 bg-black/30 rounded-full"></div>
                            </div>
                        ))}
                    </div>

                    {/* Right Plugs */}
                    <div className="flex flex-col justify-between z-20">
                        {rightSide.map((colorIdx, i) => (
                            <div 
                                key={i} 
                                onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(e, i); }}
                                className="w-8 h-12 rounded-l flex items-center justify-center cursor-pointer hover:brightness-110"
                                style={{backgroundColor: colors[colorIdx]}}
                            >
                                <div className="w-2 h-2 bg-black/30 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </div>
    );
};

const CleaningMiniGame: React.FC<MiniGameProps> = ({ onComplete, playSound, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const isDrawing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill with "dirt"
        ctx.fillStyle = '#332f2c'; // Dirt color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some texture to dirt
        for(let i=0; i<500; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#1c1917' : '#451a03';
            ctx.beginPath();
            ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*5 + 2, 0, Math.PI*2);
            ctx.fill();
        }
    }, []);

    const checkProgress = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Sample pixels to check how much is transparent (cleaned)
        // We only sample every 10th pixel for performance
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let transparentPixels = 0;
        const totalPixels = data.length / 4;
        const sampleRate = 10;
        let sampledCount = 0;

        for (let i = 0; i < totalPixels; i += sampleRate) {
            sampledCount++;
            if (data[i * 4 + 3] === 0) { // Alpha channel
                transparentPixels++;
            }
        }

        const currentProgress = (transparentPixels / sampledCount) * 100;
        setProgress(currentProgress);

        if (currentProgress > 90) {
            onComplete(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        if (Math.random() < 0.1) playSound('clean');

        checkProgress();
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-slate-800 border-2 border-slate-500 rounded-lg p-6 w-[400px] shadow-2xl relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Eraser className="text-slate-400" /> УБОРКА
                    </h2>
                    <div className="font-mono text-emerald-400">{Math.floor(progress)}%</div>
                </div>
                
                <div className="relative w-[350px] h-[350px] mx-auto bg-slate-700 rounded overflow-hidden cursor-crosshair border border-slate-600">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold opacity-30 pointer-events-none">
                        ПОТРИТЕ ПЯТНО
                    </div>
                    <canvas 
                        ref={canvasRef}
                        width={350}
                        height={350}
                        onMouseDown={() => isDrawing.current = true}
                        onMouseUp={() => isDrawing.current = false}
                        onMouseLeave={() => isDrawing.current = false}
                        onMouseMove={handleMouseMove}
                        className="relative z-10"
                    />
                </div>
            </div>
        </div>
    );
};

const InventoryMiniGame: React.FC<MiniGameProps> = ({ data, onComplete, playSound }) => {
    const [options] = useState(() => {
        const correctCount = typeof data?.count === 'number' ? data.count : 0;
        return [correctCount, correctCount - 1, correctCount + 1].sort(() => Math.random() - 0.5);
    });
    
    const correctCount = typeof data?.count === 'number' ? data.count : 0;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-slate-800 border-2 border-indigo-500 rounded-lg p-6 w-[400px] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ClipboardCheck className="text-indigo-400" /> ИНВЕНТАРИЗАЦИЯ
                    </h2>
                    <div className="text-xs text-slate-400 uppercase tracking-widest">Задача</div>
                </div>
                
                <div className="bg-slate-900 rounded p-8 mb-6 flex flex-wrap justify-center gap-4 border border-slate-700 min-h-[160px] items-center">
                    {Array.from({length: correctCount}).map((_, i) => (
                        <div key={i} className="w-12 h-12 bg-amber-600 rounded shadow-lg border-t border-white/20 relative animate-in fade-in slide-in-from-bottom-2 duration-500" style={{animationDelay: `${i*100}ms`}}>
                             <div className="absolute top-2 right-2 w-8 h-1 bg-black/10"></div>
                             <div className="absolute bottom-0 w-full h-1 bg-black/30"></div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-slate-300 mb-4 font-mono">Сколько коробок на полке?</p>

                <div className="grid grid-cols-3 gap-4">
                    {options.map((opt, i) => (
                        <button 
                            key={i}
                            onClick={() => {
                                const isCorrect = opt === correctCount;
                                playSound(isCorrect ? 'success' : 'click');
                                onComplete(isCorrect);
                            }}
                            className="bg-slate-700 hover:bg-indigo-600 text-white font-bold py-4 rounded text-xl transition-all active:scale-95"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SortingMiniGame: React.FC<MiniGameProps> = ({ onComplete, playSound, onClose }) => {
    // Items: 0 = Bad (Red/Left), 1 = Good (Green/Right)
    const [queue, setQueue] = useState<number[]>(() => Array.from({length: 20}, () => Math.random() > 0.5 ? 1 : 0));
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (gameOver) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    clearInterval(timer);
                    setGameOver(true);
                    setTimeout(() => onComplete(true, score), 1000);
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);
        return () => clearInterval(timer);
    }, [gameOver, score]);

    const handleSort = (direction: 'left' | 'right') => {
        if (gameOver || queue.length === 0) return;

        const currentItem = queue[0];
        const isCorrect = (direction === 'left' && currentItem === 0) || (direction === 'right' && currentItem === 1);

        if (isCorrect) {
            playSound('click');
            setScore(s => s + 1);
        } else {
            playSound('error');
            setScore(s => Math.max(0, s - 2));
            // Visual shake could go here
        }
        
        setQueue(prev => {
            const next = prev.slice(1);
            next.push(Math.random() > 0.5 ? 1 : 0); // Add new item
            return next;
        });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') handleSort('left');
            if (e.code === 'ArrowRight' || e.code === 'KeyD') handleSort('right');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [queue, gameOver]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
             <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6 w-[500px] shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ArrowLeftRight className="text-blue-400" /> СОРТИРОВКА
                    </h2>
                    <div className="font-mono text-xl font-bold text-white">{Math.floor(timeLeft)}с</div>
                </div>
                
                {/* Conveyor */}
                <div className="h-32 bg-slate-900 border-y border-slate-700 relative flex items-center justify-center overflow-hidden mb-6">
                     <div className="absolute inset-0 flex items-center justify-center gap-4 transition-all duration-100">
                         {/* Next Items (Ghosted) */}
                         <div className={`w-16 h-16 rounded opacity-20 scale-75 ${queue[2] === 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                         <div className={`w-16 h-16 rounded opacity-50 scale-90 ${queue[1] === 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                         
                         {/* Active Item */}
                         <div className={`w-20 h-20 rounded shadow-xl border-4 z-10 ${queue[0] === 0 ? 'bg-red-600 border-red-400' : 'bg-green-600 border-green-400'}`}>
                            <div className="flex items-center justify-center h-full text-white font-bold opacity-50">
                                {queue[0] === 0 ? 'БРАК' : 'НОРМ'}
                            </div>
                         </div>
                     </div>
                     
                     {/* Arrows Overlay */}
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/30 animate-pulse">
                         <ArrowLeft size={40} />
                     </div>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500/30 animate-pulse">
                         <ArrowRight size={40} />
                     </div>
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-400 mb-4">
                    <div className="text-red-400 flex items-center gap-1"><ArrowLeft size={16}/> В БРАК</div>
                    <div className="text-white text-lg">СЧЕТ: {score}</div>
                    <div className="text-green-400 flex items-center gap-1">НА СКЛАД <ArrowRight size={16}/></div>
                </div>
                
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col z-20 animate-in fade-in">
                        <div className="text-3xl font-bold text-white mb-2">ГОТОВО!</div>
                        <div className="text-emerald-400 font-mono text-xl">Собрано: {score}</div>
                    </div>
                )}
             </div>
        </div>
    );
};

const PackingMiniGame: React.FC<MiniGameProps> = ({ onComplete, playSound, onClose }) => {
    const [flaps, setFlaps] = useState([false, false, false, false]);
    const allFlapsClosed = flaps.every(f => f);
    const [tapeProgress, setTapeProgress] = useState(0);

    const handleFlapClick = (i: number) => {
        if (!flaps[i]) {
            playSound('click');
            setFlaps(prev => {
                const newFlaps = [...prev];
                newFlaps[i] = true;
                return newFlaps;
            });
        }
    };

    const handleTapeClick = () => {
        if (allFlapsClosed && tapeProgress < 100) {
            playSound('tape');
            setTapeProgress(prev => {
                const newProgress = prev + 34; // 3 clicks to finish roughly
                if (newProgress >= 100) {
                    setTimeout(() => onComplete(true), 300);
                    return 100;
                }
                return newProgress;
            });
        }
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (tapeProgress >= 100) return;

            // Flap controls
            if (e.code === 'ArrowUp' || e.code === 'KeyW') handleFlapClick(0);
            if (e.code === 'ArrowDown' || e.code === 'KeyS') handleFlapClick(1);
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') handleFlapClick(2);
            if (e.code === 'ArrowRight' || e.code === 'KeyD') handleFlapClick(3);

            // Space to tape
            if (e.code === 'Space' && allFlapsClosed) {
                e.preventDefault(); // Prevent page scroll
                handleTapeClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flaps, allFlapsClosed, tapeProgress]);

    return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
        <div className="bg-slate-800 border-2 border-emerald-500 rounded-lg p-6 w-[400px] shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Box className="text-emerald-400" /> УПАКОВКА
                </h2>
                <button onClick={() => onClose()} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>

            <p className="text-slate-400 text-xs text-center mb-4 font-mono">
                Используйте <span className="text-white font-bold">WASD</span> или <span className="text-white font-bold">КЛИК</span> чтобы закрыть коробку.
                <br/>Пробел - заклеить.
            </p>

            <div className="relative w-64 h-64 mx-auto bg-amber-700/50 rounded-lg mb-6 flex items-center justify-center overflow-hidden border-4 border-amber-900 shadow-inner">
                    {/* Box Interior */}
                    <div className="absolute inset-4 bg-amber-900/50 rounded flex items-center justify-center shadow-inner">
                        <span className="text-amber-900/50 font-bold text-4xl select-none rotate-[-15deg]">FRAGILE</span>
                    </div>

                    {/* Flaps */}
                    {/* Top (0) */}
                    <button 
                        onClick={() => handleFlapClick(0)}
                        disabled={flaps[0]}
                        className={`absolute top-0 w-full h-1/2 bg-amber-600 origin-top transition-transform duration-300 border-b border-amber-800 hover:bg-amber-500 flex items-start justify-center pt-2 ${flaps[0] ? 'translate-y-0 z-20 pointer-events-none' : '-translate-y-full rotate-x-180 opacity-60 hover:opacity-100'}`}
                    >
                        {!flaps[0] && <ArrowDown className="text-amber-900/40 animate-bounce" />}
                    </button>
                    
                    {/* Bottom (1) */}
                    <button 
                        onClick={() => handleFlapClick(1)}
                        disabled={flaps[1]}
                        className={`absolute bottom-0 w-full h-1/2 bg-amber-600 origin-bottom transition-transform duration-300 border-t border-amber-800 hover:bg-amber-500 flex items-end justify-center pb-2 ${flaps[1] ? 'translate-y-0 z-20 pointer-events-none' : 'translate-y-full rotate-x-180 opacity-60 hover:opacity-100'}`}
                    >
                        {!flaps[1] && <ArrowUp className="text-amber-900/40 animate-bounce" />}
                    </button>
                    
                    {/* Left (2) */}
                    <button 
                        onClick={() => handleFlapClick(2)}
                        disabled={flaps[2]}
                        className={`absolute left-0 h-full w-1/2 bg-amber-500 origin-left transition-transform duration-300 border-r border-amber-700 hover:bg-amber-400 flex items-center justify-start pl-2 ${flaps[2] ? 'translate-x-0 z-30 pointer-events-none' : '-translate-x-full rotate-y-180 opacity-60 hover:opacity-100'}`}
                    >
                        {!flaps[2] && <ArrowRight className="text-amber-900/40 animate-bounce" />}
                    </button>
                    
                    {/* Right (3) */}
                    <button 
                        onClick={() => handleFlapClick(3)}
                        disabled={flaps[3]}
                        className={`absolute right-0 h-full w-1/2 bg-amber-500 origin-right transition-transform duration-300 border-l border-amber-700 hover:bg-amber-400 flex items-center justify-end pr-2 ${flaps[3] ? 'translate-x-0 z-30 pointer-events-none' : 'translate-x-full rotate-y-180 opacity-60 hover:opacity-100'}`}
                    >
                        {!flaps[3] && <ArrowLeft className="text-amber-900/40 animate-bounce" />}
                    </button>

                    {/* Tape Visual */}
                    {tapeProgress > 0 && (
                        <div className="absolute top-1/2 left-0 h-16 bg-white/90 -translate-y-1/2 z-40 transition-all duration-200 shadow-md transform rotate-1" style={{width: `${tapeProgress}%`}}>
                             <div className="w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        </div>
                    )}
            </div>

            <div className="text-center h-14 relative z-50">
                <button 
                    onClick={() => handleTapeClick()}
                    disabled={!allFlapsClosed}
                    className={`w-full font-bold py-3 rounded uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2
                        ${allFlapsClosed 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:translate-y-1 cursor-pointer' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'}`}
                >
                    {allFlapsClosed ? (
                         <><CheckCircle size={20}/> ЗАКЛЕИТЬ ({Math.min(100, tapeProgress)}%)</>
                    ) : (
                         'Закройте клапаны'
                    )}
                </button>
            </div>
        </div>
    </div>
    );
};

interface GameProps {
  onGameOver: (score: number) => void;
  onWin: () => void;
  onExit: () => void;
}

const Game: React.FC<GameProps> = ({ onGameOver, onWin, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const ambienceNodesRef = useRef<AudioNode[]>([]);

  const patternsRef = useRef<{ [key: string]: CanvasPattern | null }>({
    zoneIn: null,
    zoneOut: null,
    floor: null,
    asphalt: null,
    hazard: null
  });

  const [uiState, setUiState] = useState({
    money: 0,
    stamina: 100,
    happiness: 100, // UI State
    currentLoad: 0,
    mode: 'WAITING', 
    taskDescription: 'Ожидание задачи...',
    isShopOpen: false,
    day: 1,
    isMuted: false,
    level: 0,
    xp: 0,
    xpToNext: 500,
    quotaCurrent: 0,
    quotaTotal: 10
  });

  const [miniGame, setMiniGame] = useState<MiniGameState | null>(null);

  const gameState = useRef<GameState>({
    player: {
      x: 300,
      y: 800,
      vx: 0,
      vy: 0,
      angle: 0,
      stamina: 100,
      maxStamina: 100,
      happiness: 100,
      money: 100,
      hasPallet: false,
      loadCount: 0,
      maxLoad: 6,
      speedMultiplier: 1.0,
    },
    level: {
        current: 0,
        xp: 0,
        xpToNext: 500
    },
    dailyQuota: {
        current: 0,
        required: 12
    },
    keys: {},
    camera: { x: 0, y: 0 },
    entities: [],
    activeTask: null,
    floatingTexts: [],
    stats: { boxesMoved: 0, daysWorked: 1 },
    upgrades: { coffee: false, gloves: false, electricJack: false }
  });

  // --- Pattern Generation ---
  const createPatterns = (ctx: CanvasRenderingContext2D) => {
    const createStripe = (c1: string, c2: string) => {
      const c = document.createElement('canvas');
      c.width = 40; c.height = 40;
      const cx = c.getContext('2d');
      if (!cx) return null;
      cx.fillStyle = c1;
      cx.fillRect(0,0,40,40);
      cx.fillStyle = c2;
      cx.beginPath();
      cx.moveTo(0, 40); cx.lineTo(40, 0); cx.lineTo(25, 0); cx.lineTo(0, 25); cx.fill();
      cx.beginPath();
      cx.moveTo(25, 40); cx.lineTo(40, 25); cx.lineTo(40, 40); cx.fill();
      return ctx.createPattern(c, 'repeat');
    };

    const createFloor = () => {
        const c = document.createElement('canvas');
        c.width = TILE_SIZE; c.height = TILE_SIZE;
        const cx = c.getContext('2d');
        if (!cx) return null;
        cx.fillStyle = COLORS.floor;
        cx.fillRect(0,0,TILE_SIZE,TILE_SIZE);
        cx.fillStyle = 'rgba(255,255,255,0.02)';
        cx.fillRect(0,0,TILE_SIZE,2);
        cx.fillStyle = 'rgba(0,0,0,0.1)';
        cx.fillRect(TILE_SIZE-2,0,2,TILE_SIZE);
        return ctx.createPattern(c, 'repeat');
    };

    const createAsphalt = () => {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const cx = c.getContext('2d');
        if (!cx) return null;
        cx.fillStyle = '#1e1e1e';
        cx.fillRect(0,0,128,128);
        for(let i=0; i<100; i++) {
            cx.fillStyle = Math.random() > 0.5 ? '#262626' : '#171717';
            cx.fillRect(Math.random()*128, Math.random()*128, 4, 4);
        }
        // Road markings
        cx.fillStyle = '#facc15';
        cx.fillRect(60, 0, 8, 40);
        cx.fillRect(60, 64, 8, 40);
        return ctx.createPattern(c, 'repeat');
    };

    const createHazard = () => {
        const c = document.createElement('canvas');
        c.width = 20; c.height = 20;
        const cx = c.getContext('2d');
        if (!cx) return null;
        cx.fillStyle = '#fbbf24';
        cx.fillRect(0,0,20,20);
        cx.fillStyle = '#000';
        cx.beginPath(); cx.moveTo(10,0); cx.lineTo(20,0); cx.lineTo(10,20); cx.lineTo(0,20); cx.fill();
        return ctx.createPattern(c, 'repeat');
    };

    patternsRef.current.zoneIn = createStripe(COLORS.zoneIn, '#052e16');
    patternsRef.current.zoneOut = createStripe(COLORS.zoneOut, '#450a0a');
    patternsRef.current.floor = createFloor();
    patternsRef.current.asphalt = createAsphalt();
    patternsRef.current.hazard = createHazard();
  };

  // --- Audio System ---
  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
        if (audioCtxRef.current) return;
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        // Fix: Provide an empty option object to constructor if strict checking requires 1 argument
        const ctx = new AudioContext({ latencyHint: 'interactive' });
        audioCtxRef.current = ctx;
        
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.4; // Master volume
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // 1. Ventilation Hum (Procedural Noise)
        const bufferSize = ctx.sampleRate * 2; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // White noise
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 120; // Lower rumble
        noiseFilter.Q.value = 1;

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.25; // Louder industrial ambient

        noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
        noise.start();
        ambienceNodesRef.current.push(noise);

        // 2. Electrical Buzz / Distant Machinery
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 50; // Mains hum frequency

        const oscFilter = ctx.createBiquadFilter();
        oscFilter.type = 'lowpass';
        oscFilter.frequency.value = 120;

        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.05;

        osc.connect(oscFilter).connect(oscGain).connect(masterGain);
        osc.start();
        ambienceNodesRef.current.push(osc);
    };

    // Attempt to start audio on first user interaction if blocked
    const handleInteraction = () => {
        if (!audioCtxRef.current) {
            initAudio();
        } else if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('click', handleInteraction);
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };
  }, []);

  // Handle Mute Toggle
  useEffect(() => {
    if (masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(uiState.isMuted ? 0 : 0.4, audioCtxRef.current!.currentTime, 0.1);
    }
  }, [uiState.isMuted]);

  const playRandomBeep = () => {
    if (uiState.isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Distant scanner beep or forklift reverse or metal clank
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const type = Math.random();
    if (type < 0.3) {
        // High pitch beep (Scanner)
        osc.frequency.setValueAtTime(1200 + Math.random() * 500, ctx.currentTime);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    } else if (type < 0.6) {
        // Low clank (Metal)
        osc.frequency.setValueAtTime(100 + Math.random() * 50, ctx.currentTime);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else {
        // Distant drill
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    }
    
    // Lowpass to make it sound "distant"
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    osc.connect(filter).connect(gain).connect(masterGainRef.current!);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  const playSound = (type: 'success' | 'click' | 'tape' | 'levelup' | 'error' | 'clean') => {
      if (uiState.isMuted || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'success') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, t);
          osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      } else if (type === 'click') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, t);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      } else if (type === 'error') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      } else if (type === 'tape') {
          osc.type = 'sawtooth'; // Rip sound
          const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for(let i=0; i<data.length; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 2000;
          
          noise.connect(filter).connect(gain).connect(masterGainRef.current!);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0, t+0.2);
          noise.start();
          return;
      } else if (type === 'clean') {
          const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for(let i=0; i<data.length; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 800;
          
          noise.connect(filter).connect(gain).connect(masterGainRef.current!);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t+0.1);
          noise.start();
          return;
      } else if (type === 'levelup') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, t);
          osc.frequency.setValueAtTime(554, t + 0.1);
          osc.frequency.setValueAtTime(659, t + 0.2);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.6);
      }

      osc.connect(gain).connect(masterGainRef.current!);
      osc.start();
      osc.stop(t + 0.6);
  };

  // --- Initialization ---
  useEffect(() => {
    const entities: Entity[] = [];
    
    // -- Layout Constants --
    const WALL_THICKNESS = 80;
    const DOOR_WIDTH = 300; 
    const INBOUND_X = 150;
    const OUTBOUND_X = WORLD_WIDTH - 150 - DOOR_WIDTH;

    // Walls
    entities.push({ id: 'wall_top_left', x: -50, y: -50, width: INBOUND_X + 50, height: WALL_THICKNESS + 50, color: COLORS.wall, type: 'wall' });
    entities.push({ id: 'wall_top_mid', x: INBOUND_X + DOOR_WIDTH, y: -50, width: OUTBOUND_X - (INBOUND_X + DOOR_WIDTH), height: WALL_THICKNESS + 50, color: COLORS.wall, type: 'wall' });
    entities.push({ id: 'wall_top_right', x: OUTBOUND_X + DOOR_WIDTH, y: -50, width: WORLD_WIDTH - (OUTBOUND_X + DOOR_WIDTH) + 50, height: WALL_THICKNESS + 50, color: COLORS.wall, type: 'wall' });

    entities.push({ id: 'wall_bottom', x: -50, y: WORLD_HEIGHT - 50, width: WORLD_WIDTH+100, height: 100, color: COLORS.wall, type: 'wall' });
    entities.push({ id: 'wall_left', x: -50, y: 0, width: 50, height: WORLD_HEIGHT, color: COLORS.wall, type: 'wall' });
    entities.push({ id: 'wall_right', x: WORLD_WIDTH, y: 0, width: 50, height: WORLD_HEIGHT, color: COLORS.wall, type: 'wall' });

    // --- OPERATOR BOOTH (Glass Office) ---
    const boothX = WORLD_WIDTH / 2 - 150;
    const boothY = 0;
    // Booth Walls (Semi-transparent in renderer)
    entities.push({ id: 'booth_wall_left', x: boothX, y: 0, width: 10, height: 150, color: '#334155', type: 'wall', subtype: 'glass' });
    entities.push({ id: 'booth_wall_right', x: boothX + 300, y: 0, width: 10, height: 150, color: '#334155', type: 'wall', subtype: 'glass' });
    entities.push({ id: 'booth_wall_front_1', x: boothX, y: 150, width: 100, height: 10, color: '#334155', type: 'wall', subtype: 'glass' });
    entities.push({ id: 'booth_wall_front_2', x: boothX + 200, y: 150, width: 110, height: 10, color: '#334155', type: 'wall', subtype: 'glass' });
    
    // Console / Desk
    entities.push({ id: 'operator_console', x: boothX + 100, y: 50, width: 100, height: 60, color: '#475569', type: 'operator_console' });
    
    // --- ELECTRICAL ROOM (Industrial Cage) ---
    const elecX = 0;
    const elecY = WORLD_HEIGHT - 200;
    // Room Walls (Cage Mesh)
    entities.push({ id: 'elec_wall_top', x: elecX, y: elecY, width: 250, height: 10, color: '#facc15', type: 'wall' });
    entities.push({ id: 'elec_wall_right_1', x: 250, y: elecY, width: 10, height: 60, color: '#facc15', type: 'wall' });
    entities.push({ id: 'elec_wall_right_2', x: 250, y: elecY + 140, width: 10, height: 60, color: '#facc15', type: 'wall' });
    
    // Transformer Booth (The Box)
    entities.push({ id: 'transformer_box', x: 30, y: WORLD_HEIGHT - 170, width: 100, height: 100, color: '#334155', type: 'transformer_box' });

    // Panel (Permanent)
    entities.push({ id: 'main_electrical_panel', x: 140, y: WORLD_HEIGHT - 170, width: 60, height: 40, color: '#fbbf24', type: 'electrical_panel' });

    // --- SMOKING AREA (Outdoor/Street style) ---
    const smokeX = WORLD_WIDTH - 250;
    const smokeY = WORLD_HEIGHT - 250;
    entities.push({ id: 'smoking_zone', x: smokeX, y: smokeY, width: 200, height: 200, color: '#0f172a', type: 'smoking_area' });
    // Benches
    entities.push({ id: 'bench_1', x: smokeX + 20, y: smokeY + 50, width: 160, height: 30, color: '#475569', type: 'bench' });
    entities.push({ id: 'bench_2', x: smokeX + 20, y: smokeY + 120, width: 160, height: 30, color: '#475569', type: 'bench' });


    // Zones
    entities.push({ id: 'zone_inbound', x: INBOUND_X + 20, y: 20, width: DOOR_WIDTH - 40, height: 500, color: COLORS.zoneIn, type: 'zone_in' });
    entities.push({ id: 'zone_outbound', x: OUTBOUND_X + 20, y: 20, width: DOOR_WIDTH - 40, height: 500, color: COLORS.zoneOut, type: 'zone_out' });

    // Sorting Station
    entities.push({
        id: 'sorting_station',
        x: WORLD_WIDTH - 250,
        y: WORLD_HEIGHT / 2 - 100,
        width: 120,
        height: 200,
        color: COLORS.sortingTable,
        type: 'sorting_table'
    });

    // Pallet Zone (Spawn independent pallets)
    for (let i = 0; i < 6; i++) {
        entities.push({
            id: `pallet_${i}`,
            x: 80 + (i % 2) * 60,
            y: 300 + Math.floor(i / 2) * 60,
            width: 36, // Slightly wider than player forks
            height: 32,
            color: COLORS.pallet,
            type: 'pallet',
            rotation: (Math.random() - 0.5) * 0.2 // Slight randomness
        });
    }

    // Racks
    const rows = 4;
    const cols = 5; // Reduced columns to fit wider racks
    const rackWidth = 160; // Widened from 120
    const rackHeight = 54; // Higher from 40
    const startX = 500; // Moved left (was 550) to avoid overlap with outbound zone
    const startY = 250;
    const gapX = 210; // Reduced spacing (was 220)
    const gapY = 240; // Increased vertical spacing

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        entities.push({
          id: `rack_${r}_${c}`,
          x: startX + c * gapX,
          y: startY + r * gapY,
          width: rackWidth,
          height: rackHeight,
          color: COLORS.rack,
          type: 'rack',
          inventory: Math.floor(Math.random() * 12) // Can hold more boxes now
        });
      }
    }

    gameState.current.entities = entities;

    const handleKeyDown = (e: KeyboardEvent) => { gameState.current.keys[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.code] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) createPatterns(ctx);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
    generateTask();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const addFloatingText = (text: string, x: number, y: number, color: string = '#fff') => {
    gameState.current.floatingTexts.push({ id: Math.random().toString(), x, y, text, life: 120, color });
  };

  // --- Logic ---

  const spawnTruck = (type: TaskType) => {
    // Cleanup old trucks first
    const cleanIds = gameState.current.entities
        .filter(e => e.type === 'truck')
        .map(e => e.id);
    
    // Remove truck and its walls
    gameState.current.entities = gameState.current.entities.filter(e => 
        e.type !== 'truck' && !e.linkedTruckId
    );

    const truckId = `truck_${Math.random()}`;
    const isInbound = type === TaskType.INBOUND;
    const doorX = isInbound ? 150 : (WORLD_WIDTH - 150 - 300);
    const x = doorX + (300 - 180)/2; 

    const y = -450; 
    const width = 180;
    const height = 350;
    
    const truck: Entity = {
        id: truckId,
        x: x,
        y: y,
        width: width,
        height: height,
        color: COLORS.truck,
        type: 'truck',
        truckState: 'arriving',
        targetY: 120, 
        loadProgress: 0,
        rotation: Math.PI 
    };
    gameState.current.entities.push(truck);

    // Create invisible collision walls for the truck
    // Cab (Front ~25%)
    const trailerLen = height * 0.75;
    const cabLen = height - trailerLen;
    const wallThick = 5;

    // We only spawn walls when the truck arrives/stops. 
    // Actually, we can spawn them now but move them in sync in updateTrucks?
    // Easier: spawn them but they are offscreen with the truck.
    
    // 1. Cab Block (Solid) - Bottom part visually (since rotated PI, cab is at Y + trailerLen + gap)
    // Wait, drawTruck rotates. Logic coord: Truck is at X,Y.
    // If rotation is PI (180), the drawing is flipped. 
    // Let's assume standard coords and apply logic updates in loop.
    
    return truckId;
  };

  // Create walls around truck once it stops
  const createTruckWalls = (t: Entity) => {
      // Remove existing walls for this truck if any (idempotency)
      gameState.current.entities = gameState.current.entities.filter(e => e.linkedTruckId !== t.id);

      const w = t.width;
      const h = t.height;
      const trailerLen = h * 0.75;
      const cabY = t.y + trailerLen; // Y position where cab starts

      // 1. Cab (Solid Block)
      gameState.current.entities.push({
          id: `${t.id}_wall_cab`,
          linkedTruckId: t.id,
          x: t.x,
          y: cabY,
          width: w,
          height: h - trailerLen,
          type: 'wall',
          subtype: 'invisible',
          color: 'transparent'
      });

      // 2. Trailer Left Wall
      gameState.current.entities.push({
          id: `${t.id}_wall_left`,
          linkedTruckId: t.id,
          x: t.x,
          y: t.y,
          width: 5,
          height: trailerLen,
          type: 'wall',
          subtype: 'invisible',
          color: 'transparent'
      });

      // 3. Trailer Right Wall
      gameState.current.entities.push({
          id: `${t.id}_wall_right`,
          linkedTruckId: t.id,
          x: t.x + w - 5,
          y: t.y,
          width: 5,
          height: trailerLen,
          type: 'wall',
          subtype: 'invisible',
          color: 'transparent'
      });

      // 4. Trailer Front Wall (Near Cab)
      gameState.current.entities.push({
          id: `${t.id}_wall_front`,
          linkedTruckId: t.id,
          x: t.x,
          y: t.y + trailerLen - 5,
          width: w,
          height: 5,
          type: 'wall',
          subtype: 'invisible',
          color: 'transparent'
      });
  };

  const spawnSpill = () => {
      let attempts = 0;
      let valid = false;
      let x = 0;
      let y = 0;
      const width = 80;
      const height = 60;

      while (!valid && attempts < 50) {
          x = 100 + Math.random() * (WORLD_WIDTH - 200);
          y = 100 + Math.random() * (WORLD_HEIGHT - 200);
          
          const spillRect = { x, y, width, height };
          
          // Check collision with critical entities
          const hasCollision = gameState.current.entities.some(e => {
              if (['rack', 'wall', 'sorting_table', 'zone_in', 'zone_out', 'truck', 'operator_console', 'transformer_box', 'bench'].includes(e.type)) {
                  // Simple AABB check
                  return (
                      spillRect.x < e.x + e.width &&
                      spillRect.x + spillRect.width > e.x &&
                      spillRect.y < e.y + e.height &&
                      spillRect.y + spillRect.height > e.y
                  );
              }
              return false;
          });

          if (!hasCollision) {
              valid = true;
          }
          attempts++;
      }

      if (valid) {
          gameState.current.entities.push({
              id: `spill_${Math.random()}`,
              x,
              y,
              width,
              height,
              color: COLORS.spill,
              type: 'spill',
              rotation: Math.random() * Math.PI * 2
          });
      }
  };

  const generateTask = () => {
    const racks = gameState.current.entities.filter(e => e.type === 'rack');
    const rand = Math.random();
    
    // 20% Electrical Task (Increased for better UX)
    if (rand < 0.2) {
        // Point to the permanent panel instead of spawning a new one
        const fault = gameState.current.entities.find(e => e.id === 'main_electrical_panel');
        if (fault) {
             gameState.current.activeTask = {
                 id: Math.random().toString(),
                 type: TaskType.ELECTRICAL,
                 step: 'fix',
                 targetId: fault.id,
                 description: 'СБОЙ: Почините проводку в щитовой!',
                 reward: 120,
                 boxCount: 0
             };
             updateUI();
             return;
        }
    }

    // 15% Chance for Inventory Task
    if (rand < 0.35) {
         const targetRack = racks[Math.floor(Math.random() * racks.length)];
         gameState.current.activeTask = {
             id: Math.random().toString(),
             type: TaskType.INVENTORY,
             step: 'count',
             targetId: targetRack.id,
             description: 'Инвентаризация: Посчитайте остатки',
             reward: 50,
             boxCount: 0,
         };
         updateUI();
         return;
    }

    // 15% Chance for Sorting Task
    if (rand < 0.50) {
        gameState.current.activeTask = {
            id: Math.random().toString(),
            type: TaskType.SORTING,
            step: 'sort',
            targetId: 'sorting_station',
            description: 'Сортировка: Отделите брак',
            reward: 80,
            boxCount: 0,
        };
        updateUI();
        return;
    }

    // 10% Chance to spawn a Spill + Cleaning Task
    if (rand < 0.60) {
        spawnSpill();
        const spill = gameState.current.entities.find(e => e.type === 'spill');
        if (spill) {
            gameState.current.activeTask = {
                id: Math.random().toString(),
                type: TaskType.CLEANING,
                step: 'clean',
                targetId: spill.id,
                description: 'ЧП: Уберите разлив масла!',
                reward: 100,
                boxCount: 0,
            };
            updateUI();
            return;
        }
    }

    // Regular Truck Tasks (remaining 40%)
    const isOutbound = Math.random() > 0.5;
    const truckId = spawnTruck(isOutbound ? TaskType.OUTBOUND : TaskType.INBOUND);

    if (isOutbound) {
      const stockedRacks = racks.filter(r => (r.inventory || 0) > 0);
      const targetRack = stockedRacks.length > 0 ? stockedRacks[Math.floor(Math.random() * stockedRacks.length)] : racks[0];

      gameState.current.activeTask = {
        id: Math.random().toString(),
        type: TaskType.OUTBOUND,
        step: 'pickup',
        targetId: targetRack.id,
        description: 'Сборка: Упакуйте и заберите товар',
        reward: 150,
        boxCount: 4,
        truckId
      };
    } else {
      gameState.current.activeTask = {
        id: Math.random().toString(),
        type: TaskType.INBOUND,
        step: 'pickup',
        targetId: 'zone_inbound', 
        description: 'Приемка: Разгрузите прибывшую фуру',
        reward: 120,
        boxCount: 6,
        truckId
      };
    }
    updateUI();
  };

  const updateTrucks = (dt: number) => {
      gameState.current.entities.forEach(ent => {
          if (ent.type === 'truck') {
              if (ent.truckState === 'arriving' && ent.targetY !== undefined) {
                  const dy = ent.targetY - ent.y;
                  if (Math.abs(dy) > 2) {
                      // Lerp movement: (1 - 0.02)^dt approx decay per frame normalized
                      // Using pow to make it frame rate independent
                      const decay = 1 - Math.pow(0.98, dt);
                      ent.y += dy * decay; 
                      
                      // Scale probability by dt
                      if (Math.random() < 0.05 * dt) {
                          addFloatingText("ПИ-ПИ-ПИ", ent.x + ent.width/2, ent.y + ent.height, '#ef4444');
                      }
                  } else {
                      ent.y = ent.targetY;
                      ent.truckState = 'waiting';
                      // Spawn collision walls for the stopped truck
                      createTruckWalls(ent);
                      addFloatingText("Под погрузку!", ent.x + ent.width/2, ent.y + ent.height/2, '#fbbf24');
                  }
              }
              else if (ent.truckState === 'departing') {
                  // Remove walls immediately when moving starts
                  gameState.current.entities = gameState.current.entities.filter(e => e.linkedTruckId !== ent.id);
                  
                  ent.y -= 5 * dt; 
                  if (ent.y < -500) {
                      gameState.current.entities = gameState.current.entities.filter(e => e.id !== ent.id);
                  }
              }
          }
      });
  };

  const getTruckAccessPoint = (t: Entity) => {
     const cx = t.x + t.width/2;
     const cy = t.y + t.height; 
     return { x: cx, y: cy };
  };

  const checkInteraction = () => {
     const { player, activeTask } = gameState.current;
     const range = 140; 
     
     const target = gameState.current.entities.find(e => {
        if (e.type === 'truck') {
             const ap = getTruckAccessPoint(e);
             const dist = Math.sqrt(Math.pow(player.x - ap.x, 2) + Math.pow(player.y - ap.y, 2));
             return dist < range && e.truckState === 'waiting';
        }
        if (e.type === 'rack') {
            const cx = e.x + e.width/2;
            const cy = e.y + e.height/2;
            const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
            return dist < range;
        }
        if (e.type === 'pallet') {
            const cx = e.x + e.width/2;
            const cy = e.y + e.height/2;
            const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
            return dist < 60;
        }
        if (e.type === 'sorting_table') {
            const cx = e.x + e.width/2;
            const cy = e.y + e.height/2;
            const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
            return dist < 140; 
        }
        if (e.type === 'spill') {
            const cx = e.x + e.width/2;
            const cy = e.y + e.height/2;
            const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
            return dist < 80;
        }
        if (e.type === 'electrical_panel') {
            const cx = e.x + e.width/2;
            const cy = e.y + e.height/2;
            const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
            return dist < 80;
        }
        if (e.type === 'operator_console') {
            const cx = e.x + e.width/2;
            const cy = e.y + e.height/2;
            const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
            return dist < 120;
        }
        return false;
     });

     // Pallet interaction logic (drop/take)
     if (target && target.type === 'pallet') {
         if (!player.hasPallet) {
             player.hasPallet = true;
             gameState.current.entities = gameState.current.entities.filter(e => e.id !== target.id);
             addFloatingText("Поддон взят", player.x, player.y - 40, '#b45309');
         } else {
             addFloatingText("Уже есть поддон", player.x, player.y - 40, '#ef4444');
         }
         return;
     }

     if (!target && player.hasPallet && player.loadCount === 0) {
         player.hasPallet = false;
         gameState.current.entities.push({
             id: `pallet_drop_${Math.random()}`,
             x: player.x - 18 + Math.cos(player.angle)*20,
             y: player.y - 16 + Math.sin(player.angle)*20,
             width: 36,
             height: 32,
             color: COLORS.pallet,
             type: 'pallet',
             rotation: player.angle
         });
         addFloatingText("Поддон сброшен", player.x, player.y - 40, '#94a3b8');
         return;
     }

     // Task Logic
     if (target && activeTask) {
         
         // 1. Cleaning Task
         if (activeTask.type === TaskType.CLEANING && target.type === 'spill' && target.id === activeTask.targetId) {
             setMiniGame({
                 type: 'CLEANING',
                 targetId: target.id,
                 onComplete: (success) => {
                     if (success) {
                        gameState.current.entities = gameState.current.entities.filter(e => e.id !== target.id);
                        addFloatingText("Чисто!", player.x, player.y - 40, '#3b82f6');
                        completeTask(0);
                     }
                     setMiniGame(null);
                 }
             });
             return;
         }
         
         // 2. Electrical Task
         if (activeTask.type === TaskType.ELECTRICAL && target.type === 'electrical_panel' && target.id === activeTask.targetId) {
             setMiniGame({
                 type: 'WIRES',
                 targetId: target.id,
                 onComplete: (success) => {
                     if (success) {
                        // Do not delete permanent panel
                        // gameState.current.entities = gameState.current.entities.filter(e => e.id !== target.id);
                        addFloatingText("Исправлено!", player.x, player.y - 40, '#eab308');
                        completeTask(0);
                     }
                     setMiniGame(null);
                 }
             });
             return;
         }

         // 3. Sorting Task
         if (activeTask.type === TaskType.SORTING && target.type === 'sorting_table') {
             setMiniGame({
                 type: 'SORTING',
                 targetId: target.id,
                 onComplete: (success, score) => {
                     if (success) completeTask(score || 0); // Score adds to money
                     setMiniGame(null);
                 }
             });
             return;
         }

         // 4. Inventory Task
         if (activeTask.type === TaskType.INVENTORY && target.type === 'rack') {
             if (target.id === activeTask.targetId) {
                // Trigger Inventory MiniGame
                setMiniGame({
                    type: 'INVENTORY',
                    targetId: target.id,
                    data: { count: Math.floor(Math.random() * 5) + 3 }, // Random count 3-8
                    onComplete: (success) => {
                        if (success) completeTask(0);
                        setMiniGame(null);
                    }
                });
             }
             return;
         }
         
         // 5. Paperwork Task Step (Now at Operator Console)
         if (activeTask.step === 'sign' && target.type === 'operator_console') {
             setMiniGame({
                 type: 'PAPERWORK',
                 targetId: target.id,
                 onComplete: (success) => {
                     if (success) {
                         completeTask(0);
                     }
                     setMiniGame(null);
                 }
             });
             return;
         }

         // Truck/Rack Logic for Inbound/Outbound (Requre Pallet)
         if (target.type === 'truck' || target.type === 'rack') {
            if (!player.hasPallet) {
                addFloatingText("Нужен поддон!", player.x, player.y - 60, '#ef4444');
                addFloatingText("Возьмите пустой", player.x, player.y - 40, '#ef4444');
                return;
            }

            const targetId = target.type === 'truck' 
                ? (activeTask.type === TaskType.INBOUND ? 'zone_inbound' : 'zone_outbound') 
                : target.id;

            if (activeTask.type === TaskType.OUTBOUND) {
            if (activeTask.step === 'pickup' && targetId === activeTask.targetId) {
                if (player.loadCount < player.maxLoad) {
                    // Trigger Packing MiniGame
                    setMiniGame({
                        type: 'PACKING',
                        targetId: target.id,
                        onComplete: (success) => {
                            if (success) {
                                if (target.type === 'rack') {
                                    target.inventory = Math.max(0, (target.inventory || 0) - activeTask.boxCount);
                                }
                                player.loadCount = activeTask.boxCount;
                                player.stamina -= 10;
                                activeTask.step = 'deliver';
                                activeTask.targetId = 'zone_outbound';
                                activeTask.description = 'Отгрузка: Загрузите товар в фуру';
                                addFloatingText("Груз упакован!", player.x, player.y - 40, '#3b82f6');
                                updateUI();
                            }
                            setMiniGame(null);
                        }
                    });
                }
            } else if (activeTask.step === 'deliver' && targetId === 'zone_outbound') {
                if (player.loadCount > 0) { 
                    // TRIGGER TRUCK LOADING MINI-GAME (New)
                    setMiniGame({
                        type: 'TRUCK_LOAD',
                        targetId: target.id,
                        data: { mode: 'LOAD', targetCount: player.loadCount },
                        onComplete: (success) => {
                             if (success) {
                                player.loadCount = 0; 
                                // Set next step: Paperwork at Booth
                                activeTask.step = 'sign';
                                activeTask.truckId = target.id;
                                activeTask.targetId = 'operator_console';
                                activeTask.description = 'Бюрократия: Подпишите бумаги в операторской';
                                addFloatingText("Груз сдан!", player.x, player.y - 60, '#3b82f6');
                                addFloatingText("Идите в операторскую", player.x, player.y - 40, '#fbbf24');
                                updateUI();
                             }
                             setMiniGame(null);
                        }
                    });
                }
            }
            } else if (activeTask.type === TaskType.INBOUND) {
            if (activeTask.step === 'pickup' && targetId === 'zone_inbound') {
                if (player.loadCount === 0) {
                    // TRIGGER TRUCK UNLOADING MINI-GAME (New)
                    setMiniGame({
                        type: 'TRUCK_LOAD',
                        targetId: target.id,
                        data: { mode: 'UNLOAD', targetCount: activeTask.boxCount },
                        onComplete: (success) => {
                            if (success) {
                                player.loadCount = activeTask.boxCount;
                                player.stamina -= 10;
                                const racks = gameState.current.entities.filter(e => e.type === 'rack');
                                const randomRack = racks[Math.floor(Math.random() * racks.length)];
                                activeTask.step = 'deliver';
                                activeTask.targetId = randomRack.id;
                                activeTask.description = 'Приемка: Разместите товар на стеллаже';
                                addFloatingText("Груз принят", player.x, player.y - 40, '#3b82f6');
                                updateUI();
                            }
                            setMiniGame(null);
                        }
                    });
                }
            } else if (activeTask.step === 'deliver' && targetId === activeTask.targetId) {
                if (player.loadCount > 0) { 
                    if (target.type === 'rack') {
                        target.inventory = (target.inventory || 0) + player.loadCount;
                    }
                    player.loadCount = 0; 
                    completeTask(0); 
                }
            }
            }
         }
     }
  };

  const completeTask = (bonusScore: number) => {
    const { player, activeTask, upgrades, entities, level, dailyQuota, stats } = gameState.current;
    if (!activeTask) return;
    
    if (activeTask.truckId) {
        const truck = entities.find(e => e.id === activeTask.truckId);
        // Only depart if task is fully done
        if (truck && activeTask.step === 'sign') {
             truck.truckState = 'departing';
        } else if (truck && activeTask.type === TaskType.INBOUND && activeTask.step === 'deliver') {
             // Inbound trucks depart when goods are delivered to rack
             truck.truckState = 'departing';
        }
    }

    let reward = activeTask.reward + (bonusScore * 5); // Bonus score money multiplier
    if (upgrades.gloves) reward += 20;
    
    // XP Calculation
    const xpGain = 100 + (activeTask.boxCount * 10) + (bonusScore * 2);
    level.xp += xpGain;

    // Quota Update (Only count actual boxes moved or task completions count as 1 unit of work for sorting/cleaning)
    if (activeTask.boxCount > 0) {
        dailyQuota.current += activeTask.boxCount;
    } else {
        dailyQuota.current += 2; // Cleaning/Sorting counts as 2 units
    }

    // Check Level Up
    if (level.xp >= level.xpToNext) {
        level.current++; // Increase Index
        
        // CHECK IF MAX LEVEL REACHED (FINAL RANK)
        if (level.current >= RANKS.length - 1) {
             onWin(); // TRIGGER ENDING
             return;
        }

        level.xp = level.xp - level.xpToNext;
        level.xpToNext = Math.floor(level.xpToNext * 1.3); // +30% harder each level
        player.stamina = player.maxStamina; // Refill stamina
        player.money += 500; // Level up bonus
        playSound('levelup');
        addFloatingText("ПОВЫШЕНИЕ!", player.x, player.y - 100, '#a855f7');
        addFloatingText(`РАНГ: ${RANKS[level.current]}`, player.x, player.y - 80, '#facc15');
    }

    // Check Daily Quota
    if (dailyQuota.current >= dailyQuota.required) {
        // Shift Complete
        stats.daysWorked++;
        const shiftBonus = 1000 + (stats.daysWorked * 100);
        player.money += shiftBonus;
        player.stamina = player.maxStamina;
        
        // Reset Quota for next day (Harder)
        dailyQuota.current = 0;
        dailyQuota.required = Math.floor(dailyQuota.required * 1.2);
        
        playSound('success');
        addFloatingText("СМЕНА ЗАКРЫТА!", player.x, player.y - 120, '#f59e0b');
        addFloatingText(`+${shiftBonus}₽ БОНУС`, player.x, player.y - 100, '#22c55e');
    } else {
        addFloatingText(`+${reward}₽`, player.x, player.y - 60, '#22c55e');
        addFloatingText(`+${xpGain} XP`, player.x, player.y - 80, '#a855f7');
    }

    player.money += reward;
    player.stamina = Math.min(player.stamina + 5, player.maxStamina);
    gameState.current.stats.boxesMoved += activeTask.boxCount;
    
    
    gameState.current.activeTask = null;
    updateUI();
    setTimeout(generateTask, 3000); 
  };

  const updateUI = () => {
    const { player, activeTask, stats, level, dailyQuota } = gameState.current;
    setUiState(prev => ({
      ...prev,
      money: player.money,
      stamina: player.stamina,
      happiness: player.happiness,
      currentLoad: player.loadCount,
      mode: activeTask ? (
          activeTask.type === TaskType.INVENTORY ? 'INVENTORY' : 
          activeTask.type === TaskType.INBOUND ? 'INBOUND' : 
          activeTask.type === TaskType.OUTBOUND ? 'OUTBOUND' : 
          activeTask.type === TaskType.SORTING ? 'SORTING' : 
          activeTask.type === TaskType.ELECTRICAL ? 'ELECTRICAL' :
          'CLEANING'
        ) : 'WAITING',
      taskDescription: activeTask ? activeTask.description : 'Ожидание прибытия транспорта...',
      day: stats.daysWorked,
      level: level.current,
      xp: level.xp,
      xpToNext: level.xpToNext,
      quotaCurrent: dailyQuota.current,
      quotaTotal: dailyQuota.required
    }));
  };

  // --- Drawing ---
  const drawRack = (ctx: CanvasRenderingContext2D, r: Entity, isActive: boolean) => {
     const isHighlighted = isActive;
     
     // 1. Shadow (Grounding)
     ctx.fillStyle = 'rgba(0,0,0,0.5)';
     ctx.fillRect(r.x + 10, r.y + 10, r.width, r.height);

     // 2. Rack Structure (Back legs)
     const legColor = '#7c2d12'; // Dark Industrial Brown/Orange
     const beamColor = '#ea580c'; // Orange
     ctx.fillStyle = legColor;
     // Rear Left Leg
     ctx.fillRect(r.x, r.y, 6, r.height);
     // Rear Right Leg
     ctx.fillRect(r.x + r.width - 6, r.y, 6, r.height);
     // Middle Support
     ctx.fillRect(r.x + r.width/2 - 3, r.y, 6, r.height);
     
     // Back Crossbar (Detail)
     ctx.fillStyle = '#662408';
     ctx.fillRect(r.x + 6, r.y + r.height/2 - 2, r.width - 12, 4);

     // 3. Shelf Surface (Floor of the rack)
     ctx.fillStyle = '#431407'; // Very dark wood/metal shadow
     ctx.fillRect(r.x + 4, r.y + 4, r.width - 8, r.height - 8);

     // 4. Inventory (Boxes)
     if (r.inventory && r.inventory > 0) {
        // Pseudo-random generator based on rack ID
        const seed = r.id.split('').reduce((a,b) => a+b.charCodeAt(0), 0);
        const rand = (i: number) => {
            const x = Math.sin(seed + i) * 10000;
            return x - Math.floor(x);
        };

        const boxSize = 18;
        const spacing = 22; // Box size + margin
        // Calculate max boxes per row based on width (leaving some padding)
        const availableWidth = r.width - 16;
        const boxesPerRow = Math.floor(availableWidth / spacing);
        
        const startX = r.x + 8;
        const startY = r.y + 8;
        
        for (let i = 0; i < r.inventory; i++) {
            // Visual Limit: If boxes exceed capacity of 2 rows, stop drawing to prevent overflow
            if (i >= boxesPerRow * 2) break; 
            
            const row = Math.floor(i / boxesPerRow);
            const col = i % boxesPerRow;
            
            // Jitter position
            const jitterX = (rand(i) - 0.5) * 4;
            const jitterY = (rand(i + 100) - 0.5) * 4;
            
            const bx = startX + col * spacing + jitterX;
            const by = startY + row * spacing + jitterY;

            // Box Type (Color variation)
            const typeVal = rand(i + 50);
            let boxColor = '#d97706'; // Standard Cardboard
            let tapeColor = '#fcd34d';
            let labelColor = null;

            if (typeVal > 0.8) {
                boxColor = '#e2e8f0'; // White appliance box
                tapeColor = 'rgba(0,0,0,0.1)';
            } else if (typeVal > 0.6) {
                boxColor = '#a16207'; // Darker cardboard
            }

            // Draw Box
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(bx + 2, by + 2, boxSize, boxSize);
            
            // Main body
            ctx.fillStyle = boxColor;
            ctx.fillRect(bx, by, boxSize, boxSize);
            
            // 3D Side/Front Effect (Bevel)
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Side shading
            ctx.fillRect(bx + boxSize - 2, by, 2, boxSize); // Right side
            ctx.fillRect(bx, by + boxSize - 2, boxSize, 2); // Bottom side

            // Details
            if (labelColor || typeVal < 0.8) {
                // Tape
                ctx.fillStyle = tapeColor;
                ctx.fillRect(bx, by + boxSize/2 - 1, boxSize, 2);
            }
            
            // Label
            if (rand(i+200) > 0.5) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(bx + boxSize - 8, by + 4, 6, 4);
                // "Barcode"
                ctx.fillStyle = '#000';
                ctx.fillRect(bx + boxSize - 7, by + 5, 4, 1);
            }
        }
     }

     // 5. Front Structure (Overlays boxes slightly to give depth)
     // Horizontal Beams
     ctx.fillStyle = beamColor;
     // Top Beam
     ctx.beginPath();
     ctx.roundRect(r.x - 2, r.y, r.width + 4, 6, 2);
     ctx.fill();
     // Bottom Beam
     ctx.beginPath();
     ctx.roundRect(r.x - 2, r.y + r.height - 6, r.width + 4, 6, 2);
     ctx.fill();
     
     // Highlight bolts
     ctx.fillStyle = '#fdbabb';
     ctx.beginPath(); ctx.arc(r.x + 3, r.y + 3, 1.5, 0, Math.PI*2); ctx.fill();
     ctx.beginPath(); ctx.arc(r.x + r.width - 3, r.y + 3, 1.5, 0, Math.PI*2); ctx.fill();
     ctx.beginPath(); ctx.arc(r.x + 3, r.y + r.height - 3, 1.5, 0, Math.PI*2); ctx.fill();
     ctx.beginPath(); ctx.arc(r.x + r.width - 3, r.y + r.height - 3, 1.5, 0, Math.PI*2); ctx.fill();

     // 6. Highlight Selection (Pulse)
     if (isHighlighted) {
         const time = Date.now() / 200;
         const alpha = 0.3 + Math.sin(time) * 0.2;
         ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`; // Amber pulse
         ctx.lineWidth = 4;
         ctx.strokeRect(r.x - 4, r.y - 4, r.width + 8, r.height + 8);
         
         // Arrow indicator
         ctx.fillStyle = '#fbbf24';
         ctx.beginPath();
         const arrowY = r.y - 20 + Math.sin(time*2)*5;
         ctx.moveTo(r.x + r.width/2, arrowY + 10);
         ctx.lineTo(r.x + r.width/2 - 10, arrowY);
         ctx.lineTo(r.x + r.width/2 + 10, arrowY);
         ctx.fill();
     }
  };

  const drawSortingTable = (ctx: CanvasRenderingContext2D, t: Entity, isActive: boolean) => {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(t.x + 10, t.y + 10, t.width, t.height);

    // Table Top
    ctx.fillStyle = '#475569'; // Metal grey
    ctx.fillRect(t.x, t.y, t.width, t.height);
    
    // Conveyor Belt Section (Center)
    ctx.fillStyle = '#1e293b'; // Dark belt
    ctx.fillRect(t.x + 20, t.y, t.width - 40, t.height);
    
    // Moving lines on belt (Static visual)
    ctx.fillStyle = '#334155';
    for(let i=10; i<t.height; i+=20) {
        ctx.fillRect(t.x + 20, t.y + i, t.width - 40, 2);
    }

    // Side Rails
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(t.x, t.y, 20, t.height);
    ctx.fillRect(t.x + t.width - 20, t.y, 20, t.height);

    // Computer/Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(t.x + t.width - 15, t.y + 20, 10, 30);
    ctx.fillStyle = isActive ? '#22c55e' : '#dc2626'; // Screen ON/OFF
    ctx.fillRect(t.x + t.width - 13, t.y + 22, 6, 26);

    // Highlight
    if (isActive) {
         const time = Date.now() / 200;
         const alpha = 0.3 + Math.sin(time) * 0.2;
         ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; // Blue pulse
         ctx.lineWidth = 4;
         ctx.strokeRect(t.x - 4, t.y - 4, t.width + 8, t.height + 8);

         // Arrow indicator
         ctx.fillStyle = '#3b82f6';
         ctx.beginPath();
         const arrowY = t.y - 20 + Math.sin(time*2)*5;
         ctx.moveTo(t.x + t.width/2, arrowY + 10);
         ctx.lineTo(t.x + t.width/2 - 10, arrowY);
         ctx.lineTo(t.x + t.width/2 + 10, arrowY);
         ctx.fill();
    }
  };

  const drawTruck = (ctx: CanvasRenderingContext2D, t: Entity) => {
      ctx.save();
      const cx = t.x + t.width/2;
      const cy = t.y + t.height/2;
      ctx.translate(cx, cy);
      ctx.rotate(t.rotation || 0);
      ctx.translate(-t.width/2, -t.height/2);

      const w = t.width;
      const h = t.height;
      const trailerLen = h * 0.75; // 75% trailer
      const cabLen = h - trailerLen - 15; // Gap of 15
      const cabY = trailerLen + 15;

      // Drop shadow for whole truck
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.filter = 'blur(10px)';
      ctx.beginPath();
      ctx.roundRect(10, 10, w - 20, h - 20, 10);
      ctx.fill();
      ctx.filter = 'none';

      // --- Wheels ---
      // Function to draw a detailed tire
      const drawTire = (bx: number, by: number) => {
          ctx.save();
          ctx.translate(bx, by);
          // Tire
          ctx.fillStyle = '#171717'; // Rubber black
          ctx.beginPath();
          ctx.roundRect(-6, -12, 12, 24, 3);
          ctx.fill();
          // Treads
          ctx.fillStyle = '#262626';
          ctx.fillRect(-6, -8, 12, 2);
          ctx.fillRect(-6, 0, 12, 2);
          ctx.fillRect(-6, 8, 12, 2);
          ctx.restore();
      };

      const wheelInset = 2; // Tires stick out slightly or flush
      // Trailer axles (near rear, y=0 end)
      // Usually can slide, but let's put them near y=40 and y=80
      drawTire(wheelInset, 40); drawTire(w - wheelInset, 40);
      drawTire(wheelInset, 75); drawTire(w - wheelInset, 75);

      // Drive axles (Cab rear, under heavy load)
      // Located at cabY + 15 and cabY + 45
      drawTire(wheelInset, cabY + 15); drawTire(w - wheelInset, cabY + 15);
      drawTire(wheelInset, cabY + 45); drawTire(w - wheelInset, cabY + 45);

      // Steer axle (Cab front)
      // Located near front of cab (h - 25)
      drawTire(wheelInset, h - 30); drawTire(w - wheelInset, h - 30);


      // --- Trailer ---
      ctx.save();
      // Metallic Body Gradient
      const trailerGrad = ctx.createLinearGradient(0, 0, w, 0);
      trailerGrad.addColorStop(0, '#94a3b8'); // Darker edge
      trailerGrad.addColorStop(0.2, '#f1f5f9'); // Highlight
      trailerGrad.addColorStop(0.5, '#e2e8f0'); // Mid
      trailerGrad.addColorStop(0.8, '#f1f5f9'); // Highlight
      trailerGrad.addColorStop(1, '#64748b'); // Dark edge

      ctx.fillStyle = trailerGrad;
      // Main Trailer Shape
      ctx.beginPath();
      // Taper slightly at front? No, trailers are boxy.
      ctx.roundRect(4, 0, w - 8, trailerLen, 4); 
      ctx.fill();
      
      // Corrugation / Ribs
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      for(let i = 10; i < trailerLen - 10; i+=15) {
          ctx.fillRect(4, i, w-8, 2);
      }

      // Roof details (center strip)
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(w/2 - 15, 5, 30, trailerLen - 10);

      // Refrigeration Unit at front of trailer (near cab)
      // Local Y = trailerLen
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(w/2 - 20, trailerLen - 25, 40, 20, 2);
      ctx.fill();
      // Grill on reefer
      ctx.fillStyle = '#1e293b';
      for(let i=0; i<3; i++) {
        ctx.fillRect(w/2 - 15, trailerLen - 22 + i*5, 30, 2);
      }

      // Rear Doors (y=0)
      if (t.truckState === 'waiting') {
          // Open Doors
          // Draw dark interior
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(6, 0, w-12, 40);
          
          // Draw doors swung out?
          // Left door
          ctx.save();
          ctx.translate(4, 0);
          ctx.rotate(0.2); // Swing out
          ctx.fillStyle = '#cbd5e1';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.fillRect(-10, 0, 10, 50);
          ctx.strokeRect(-10, 0, 10, 50);
          ctx.restore();

           // Right door
          ctx.save();
          ctx.translate(w-4, 0);
          ctx.rotate(-0.2); // Swing out
          ctx.fillStyle = '#cbd5e1';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.fillRect(0, 0, 10, 50);
          ctx.strokeRect(0, 0, 10, 50);
          ctx.restore();

      } else {
          // Closed Doors
          ctx.fillStyle = '#cbd5e1'; // Door color
          ctx.fillRect(4, 0, w/2 - 4, 10); // Left
          ctx.fillRect(w/2, 0, w/2 - 4, 10); // Right
          
          // Hinges / Bars
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(w/4, 0, 4, 20);
          ctx.fillRect(w*0.75, 0, 4, 20);

          // Taillights on frame
          ctx.fillStyle = '#dc2626';
          ctx.beginPath(); ctx.arc(10, 2, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(w-10, 2, 3, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();

      // --- Connector (Fifth Wheel) ---
      ctx.fillStyle = '#1e293b'; // Dark grease
      ctx.beginPath();
      ctx.arc(w/2, cabY + 10, 12, 0, Math.PI*2);
      ctx.fill();
      // Slide rails
      ctx.fillStyle = '#334155';
      ctx.fillRect(w/2 - 14, cabY - 5, 4, 30);
      ctx.fillRect(w/2 + 10, cabY - 5, 4, 30);


      // --- Cab ---
      ctx.save();
      const cabColor = t.id.includes('0.5') ? '#ef4444' : '#2563eb'; // Red or Blue
      const cabDark = t.id.includes('0.5') ? '#b91c1c' : '#1e40af';
      
      // Sleeper / Main Body
      ctx.fillStyle = cabColor;
      ctx.beginPath();
      ctx.roundRect(8, cabY, w - 16, cabLen, 6);
      ctx.fill();

      // Roof Fairing (Aerodynamic spoiler)
      // Slopes up from front to back of cab
      const fairingGrad = ctx.createLinearGradient(0, cabY, 0, h);
      fairingGrad.addColorStop(0, cabDark);
      fairingGrad.addColorStop(1, cabColor);
      ctx.fillStyle = fairingGrad;
      ctx.beginPath();
      ctx.moveTo(12, cabY + 10);
      ctx.lineTo(w/2, cabY - 5); // Peak near trailer
      ctx.lineTo(w-12, cabY + 10);
      ctx.lineTo(w-12, cabY + 50);
      ctx.lineTo(12, cabY + 50);
      ctx.fill();

      // Windshield
      ctx.fillStyle = '#1e293b'; // Dark glass
      ctx.beginPath();
      // Curved windshield shape
      ctx.moveTo(14, cabY + 45);
      ctx.quadraticCurveTo(w/2, cabY + 40, w-14, cabY + 45);
      ctx.lineTo(w-16, cabY + 60);
      ctx.quadraticCurveTo(w/2, cabY + 58, 16, cabY + 60);
      ctx.fill();
      // Glare
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(16, cabY + 46);
      ctx.lineTo(24, cabY + 46);
      ctx.lineTo(20, cabY + 58);
      ctx.lineTo(14, cabY + 58);
      ctx.fill();

      // Hood
      ctx.fillStyle = cabColor;
      ctx.fillRect(16, cabY + 60, w - 32, 40);
      // Hood center ridge
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(w/2 - 2, cabY + 60, 4, 40);

      // Grille
      ctx.fillStyle = '#e2e8f0'; // Chrome
      ctx.beginPath();
      ctx.roundRect(18, h - 15, w - 36, 10, 2);
      ctx.fill();
      // Grille slots
      ctx.fillStyle = '#0f172a';
      for(let i=0; i<6; i++) {
          ctx.fillRect(22 + i*((w-44)/5), h - 14, 2, 8);
      }

      // Headlights
      ctx.fillStyle = '#fef08a'; // Yellowish light
      ctx.beginPath();
      ctx.roundRect(8, h - 20, 8, 12, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(w - 16, h - 20, 8, 12, 2);
      ctx.fill();

      // Side Mirrors
      ctx.fillStyle = '#e2e8f0'; // Chrome backs
      ctx.beginPath();
      // Left
      ctx.moveTo(8, cabY + 50);
      ctx.lineTo(0, cabY + 45);
      ctx.lineTo(0, cabY + 65);
      ctx.lineTo(8, cabY + 60);
      ctx.fill();
      // Right
      ctx.moveTo(w-8, cabY + 50);
      ctx.lineTo(w, cabY + 45);
      ctx.lineTo(w, cabY + 65);
      ctx.lineTo(w-8, cabY + 60);
      ctx.fill();

      // Exhaust Stacks (Chrome pipes behind cab)
      ctx.fillStyle = '#cbd5e1'; // Chrome
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      // Left stack
      ctx.beginPath(); ctx.arc(10, cabY + 15, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      // Right stack
      ctx.beginPath(); ctx.arc(w-10, cabY + 15, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();

      ctx.restore();

      ctx.restore();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: GameState['player']) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    
    // --- SHADOWS ---
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    // Jack Shadow
    ctx.beginPath();
    ctx.roundRect(-22, -16, 56, 32, 6);
    ctx.fill();
    // Operator Shadow (offset slightly)
    ctx.beginPath();
    ctx.ellipse(-38, 2, 14, 14, 0, 0, Math.PI*2);
    ctx.fill();

    const isElectric = gameState.current.upgrades.electricJack;
    const isMoving = Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1;

    // --- 1. FORKS (Bottom) ---
    const forkColor = '#94a3b8'; // Slate 400
    const forkDark = '#64748b'; // Slate 500
    
    // Left Fork
    ctx.fillStyle = forkColor;
    ctx.beginPath(); ctx.roundRect(0, -12, 34, 8, 1); ctx.fill();
    ctx.fillStyle = forkDark; ctx.fillRect(0, -5, 34, 1); // Depth
    
    // Right Fork
    ctx.fillStyle = forkColor;
    ctx.beginPath(); ctx.roundRect(0, 4, 34, 8, 1); ctx.fill();
    ctx.fillStyle = forkDark; ctx.fillRect(0, 11, 34, 1); // Depth

    // Small Wheels at tip
    ctx.fillStyle = '#334155';
    ctx.fillRect(26, -12, 4, 8);
    ctx.fillRect(26, 4, 4, 8);


    // --- 2. PALLET & CARGO ---
    if (p.hasPallet) {
        // Wood Pallet
        ctx.fillStyle = '#b45309';
        ctx.fillRect(2, -15, 34, 30);
        // Detail lines (planks)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(12, -15, 1, 30);
        ctx.fillRect(23, -15, 1, 30);
        ctx.fillRect(2, -4, 34, 8); // Center beam

        // Boxes
        if (p.loadCount > 0) {
            const boxSize = 10;
            const offsets = [
                {x: 4, y: -11}, {x: 4, y: 1},
                {x: 15, y: -11}, {x: 15, y: 1},
                {x: 26, y: -11}, {x: 26, y: 1},
            ];
    
            ctx.strokeStyle = '#78350f'; 
            ctx.lineWidth = 1;
    
            for (let i = 0; i < p.loadCount; i++) {
                if (i >= offsets.length) break;
                const pos = offsets[i];
                
                // Box Body
                ctx.fillStyle = '#d97706'; 
                ctx.fillRect(pos.x, pos.y, boxSize, boxSize);
                ctx.strokeRect(pos.x, pos.y, boxSize, boxSize);
                
                // Tape
                ctx.fillStyle = '#fcd34d'; 
                ctx.fillRect(pos.x, pos.y + 4, boxSize, 2);
            }
        }
    }

    // --- 3. JACK UNIT BODY ---
    // Pivot context for body
    ctx.save();
    ctx.translate(-18, 0); 
    
    if (isElectric) {
        // Electric Jack (Yellow/Black Industrial)
        ctx.fillStyle = '#eab308'; // Safety Yellow base
        ctx.beginPath(); ctx.roundRect(-10, -14, 26, 28, 4); ctx.fill();
        
        // Battery cover
        ctx.fillStyle = '#1e293b'; // Dark Grey/Black
        ctx.fillRect(-6, -10, 16, 20);
        
        // Dashboard / Controls
        ctx.fillStyle = '#475569';
        ctx.beginPath(); ctx.roundRect(-12, -6, 8, 12, 2); ctx.fill();
    } else {
        // Manual Jack (Red/Orange Hydraulics)
        ctx.fillStyle = '#dc2626'; // Red
        ctx.beginPath(); ctx.roundRect(-8, -8, 16, 16, 4); ctx.fill();
        
        // Hydraulic Pump Piston
        ctx.fillStyle = '#e2e8f0'; // Silver
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#64748b'; // Inner
        ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // --- 4. HANDLE BAR ---
    ctx.save();
    ctx.translate(-18, 0); // From body pivot
    
    // Angled arm connecting to handle
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, 0);
    ctx.stroke();
    
    // T-Handle
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -10);
    ctx.lineTo(-18, 10);
    ctx.stroke();
    
    // Handle Grips
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-18, -10); ctx.lineTo(-18, -5);
    ctx.moveTo(-18, 5); ctx.lineTo(-18, 10);
    ctx.stroke();
    ctx.restore();

    // --- 5. OPERATOR ---
    // Positioned behind handle
    ctx.save();
    ctx.translate(-40, 0); // Operator center

    // Feet (Animation)
    const walkPhase = isMoving ? Math.sin(Date.now() / 60) * 3 : 0;
    
    ctx.fillStyle = '#0f172a'; // Black boots
    // Left Foot
    ctx.beginPath(); ctx.ellipse(2 + walkPhase, -7, 6, 3.5, 0, 0, Math.PI*2); ctx.fill();
    // Right Foot
    ctx.beginPath(); ctx.ellipse(2 - walkPhase, 7, 6, 3.5, 0, 0, Math.PI*2); ctx.fill();

    // Body (Shoulders)
    ctx.fillStyle = '#1e3a8a'; // Work Shirt Blue
    ctx.beginPath(); ctx.roundRect(-6, -11, 14, 22, 6); ctx.fill();

    // High-Vis Vest
    ctx.fillStyle = '#f97316'; // Safety Orange
    ctx.beginPath(); ctx.roundRect(-6, -11, 14, 22, 6); ctx.fill();
    
    // Reflective Stripes
    ctx.fillStyle = '#fef08a'; // Reflective Yellow
    ctx.fillRect(-6, -11, 4, 22); // Left stripe
    ctx.fillRect(2, -11, 4, 22); // Right stripe
    ctx.fillRect(-6, -2, 14, 4); // Horizontal stripe

    // Arms reaching forward
    ctx.strokeStyle = '#fca5a5'; // Skin tone
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    
    // Arms (reaching to handle at local x = ~ +20, y = +/- 8)
    // Left Arm
    ctx.beginPath();
    ctx.moveTo(0, -9); // Shoulder
    ctx.quadraticCurveTo(10, -10, 22, -8); // Elbow -> Hand
    ctx.stroke();
    
    // Right Arm
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.quadraticCurveTo(10, 10, 22, 8);
    ctx.stroke();

    // Gloves
    ctx.fillStyle = gameState.current.upgrades.gloves ? '#4b5563' : '#fca5a5';
    ctx.beginPath(); ctx.arc(22, -8, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(22, 8, 3, 0, Math.PI*2); ctx.fill();

    // Head / Helmet
    // Rank colors
    const rankColors = [
        ['#facc15', '#a16207'], // Yellow (Default)
        ['#facc15', '#a16207'],
        ['#fb923c', '#c2410c'], // Orange
        ['#fb923c', '#c2410c'],
        ['#22c55e', '#15803d'], // Green
        ['#3b82f6', '#1d4ed8'], // Blue
        ['#ffffff', '#94a3b8'], // White (Boss)
        ['#fef08a', '#ca8a04'], // Gold (Master)
    ];
    const rankIdx = Math.min(gameState.current.level.current, rankColors.length - 1);
    const [helmetMain, helmetDark] = rankColors[rankIdx];

    // Helmet shell
    const grad = ctx.createRadialGradient(-2, -2, 0, 0, 0, 8);
    grad.addColorStop(0, '#ffffff'); 
    grad.addColorStop(0.5, helmetMain);
    grad.addColorStop(1, helmetDark);
    
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI*2); ctx.fill();
    // Helmet rim/brim
    ctx.strokeStyle = helmetDark;
    ctx.lineWidth = 1;
    ctx.stroke();
    // Front brim
    ctx.fillStyle = helmetDark;
    ctx.beginPath(); ctx.ellipse(6, 0, 3, 6, 0, 0, Math.PI*2); ctx.fill();

    ctx.restore();
    ctx.restore();
  };

  const gameLoop = (timestamp: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // --- Delta Time Calculation ---
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const rawDelta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    const dt = Math.min(rawDelta, 100) / 16.666;

    const state = gameState.current;
    const player = state.player;

    const onSmokingArea = state.entities.some(e =>
        e.type === 'smoking_area' &&
        player.x > e.x && player.x < e.x + e.width &&
        player.y > e.y && player.y < e.y + e.height
    );

    if (miniGame) {
         // Render static background for immersion? 
    } else {
        updateTrucks(dt);

        // Check for special zones
        const onSpill = state.entities.some(e => 
            e.type === 'spill' && 
            Math.abs(player.x - (e.x + e.width/2)) < e.width/2 && 
            Math.abs(player.y - (e.y + e.height/2)) < e.height/2
        );

        // Happiness Logic
        if (onSmokingArea) {
            player.happiness = Math.min(100, player.happiness + 0.1 * dt); // Restore happiness
            // Smoke particles could go here conceptually
        } else {
            player.happiness = Math.max(0, player.happiness - 0.01 * dt); // Decay happiness
        }

        // Calculate Physics Parameters
        const loadFactor = player.loadCount / player.maxLoad; // 0 to 1
        
        let currentAccel = (PHYSICS.accel * (1 - loadFactor)) + (PHYSICS.accelLoaded * loadFactor);
        let currentFriction = (PHYSICS.friction * (1 - loadFactor)) + (PHYSICS.frictionLoaded * loadFactor);
        let currentMaxSpeed = ((PHYSICS.maxSpeed * (1 - loadFactor)) + (PHYSICS.maxSpeedLoaded * loadFactor)) * (state.upgrades.electricJack ? 1.5 : 1) * player.speedMultiplier;

        if (onSpill) {
            currentAccel = PHYSICS.accelOil;
            currentFriction = PHYSICS.frictionOil;
        }

        // Depression penalty
        if (player.happiness < 10) {
            currentMaxSpeed *= 0.5; // Walk slow
        }

        let ax = 0; let ay = 0;
        const isSprinting = state.keys['ShiftLeft'] || state.keys['ShiftRight'];
        
        if (state.keys['KeyW'] || state.keys['ArrowUp']) ay -= currentAccel;
        if (state.keys['KeyS'] || state.keys['ArrowDown']) ay += currentAccel;
        if (state.keys['KeyA'] || state.keys['ArrowLeft']) ax -= currentAccel;
        if (state.keys['KeyD'] || state.keys['ArrowRight']) ax += currentAccel;
        
        ax *= dt; 
        ay *= dt;
        
        if (isSprinting && player.stamina > 0 && !onSpill) {
           ax *= PHYSICS.sprintMultiplier; ay *= PHYSICS.sprintMultiplier; 
           player.stamina -= 0.2 * dt;
        } else if (player.stamina < player.maxStamina) { 
           player.stamina += 0.05 * dt; 
        }
        
        player.vx += ax; 
        player.vy += ay; 
        
        const frictionFactor = Math.pow(currentFriction, dt);
        player.vx *= frictionFactor; 
        player.vy *= frictionFactor;
        
        const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (speed > currentMaxSpeed) { const r = currentMaxSpeed / speed; player.vx *= r; player.vy *= r; }
        
        let nextX = player.x + player.vx * dt; 
        let nextY = player.y + player.vy * dt;

        if (nextX < 20) nextX = 20; if (nextX > WORLD_WIDTH - 20) nextX = WORLD_WIDTH - 20;
        if (nextY < 20) nextY = 20; if (nextY > WORLD_HEIGHT - 20) nextY = WORLD_HEIGHT - 20;
        
        const playerRect = { x: nextX - PLAYER_SIZE/2, y: nextY - PLAYER_SIZE/2, w: PLAYER_SIZE, h: PLAYER_SIZE };
        for (const ent of state.entities) {
            const isCollidable = 
                ent.type === 'rack' || 
                ent.type === 'wall' || 
                ent.type === 'sorting_table' || 
                ent.type === 'operator_console' ||
                ent.type === 'transformer_box' || // Collide with transformer
                ent.type === 'bench' || // Collide with bench
                (ent.type === 'truck' && ent.truckState !== 'waiting'); 

            if (isCollidable) {
                if (playerRect.x < ent.x + ent.width && playerRect.x + playerRect.w > ent.x &&
                    playerRect.y < ent.y + ent.height && playerRect.y + playerRect.h > ent.y) {
                    player.vx *= -0.5; player.vy *= -0.5; nextX = player.x; nextY = player.y;
                }
            }
        }
        player.x = nextX; player.y = nextY;
        if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) { player.angle = Math.atan2(player.vy, player.vx); }
        if (state.keys['Space']) { if (!state.keys['Space_latched']) { checkInteraction(); state.keys['Space_latched'] = true; } } else { state.keys['Space_latched'] = false; }
        
        if (Math.random() < 0.002 * dt) addFloatingText(TEXTS[Math.floor(Math.random() * TEXTS.length)], player.x, player.y - 50, '#94a3b8');
        
        // Ambient Events
        if (Math.random() < 0.005 * dt) playRandomBeep();

        if (player.stamina <= 0) { onGameOver(player.money); return; }

        state.camera.x = player.x - CANVAS_WIDTH / 2;
        state.camera.y = player.y - CANVAS_HEIGHT / 2;
        state.camera.x = Math.max(0, Math.min(state.camera.x, WORLD_WIDTH - CANVAS_WIDTH));
        state.camera.y = Math.max(-300, Math.min(state.camera.y, WORLD_HEIGHT - CANVAS_HEIGHT));
    }

    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);
    
    // 1. Draw Asphalt
    if (patternsRef.current.asphalt) {
        ctx.fillStyle = patternsRef.current.asphalt;
        ctx.fillRect(-200, -1000, WORLD_WIDTH + 400, 1080); 
    }

    // 2. Draw Floor
    if (patternsRef.current.floor) {
        ctx.fillStyle = patternsRef.current.floor;
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    } else {
        ctx.fillStyle = COLORS.floor;
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

    // Draw markings for new rooms
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    // Electrical Room Zone
    ctx.strokeRect(10, WORLD_HEIGHT - 190, 230, 180);
    // Operator Booth Zone
    const boothX = WORLD_WIDTH / 2 - 150;
    ctx.strokeRect(boothX + 10, 10, 280, 130);
    ctx.restore();

    // 3. Draw Zones
    const zones = state.entities.filter(e => e.type.startsWith('zone') && e.type !== 'smoking_area'); // Smoking area is distinct
    const renderableEntities = state.entities.filter(e => !e.type.startsWith('zone') && e.subtype !== 'invisible');

    for (const ent of zones) {
        const pattern = ent.type === 'zone_in' ? patternsRef.current.zoneIn : patternsRef.current.zoneOut;
        ctx.fillStyle = pattern || ent.color;
        ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
        
        ctx.strokeStyle = ent.type === 'zone_in' ? '#15803d' : '#b91c1c';
        ctx.lineWidth = 2;
        ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
        
        ctx.fillStyle = COLORS.hazardYellow;
        for(let i=0; i<ent.width; i+=40) {
            ctx.fillRect(ent.x + i, ent.y, 20, 5);
        }
        
        if (patternsRef.current.hazard) {
            ctx.fillStyle = patternsRef.current.hazard;
            ctx.fillRect(ent.x - 10, ent.y - 40, 10, 80);
            ctx.fillRect(ent.x + ent.width, ent.y - 40, 10, 80);
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(ent.x - 10, ent.y - 40, 10, 80);
        ctx.strokeRect(ent.x + ent.width, ent.y - 40, 10, 80);
    }

    // Draw Smoking Area
    const smokingArea = state.entities.find(e => e.type === 'smoking_area');
    if (smokingArea) {
        ctx.fillStyle = '#334155'; // Concrete
        ctx.fillRect(smokingArea.x, smokingArea.y, smokingArea.width, smokingArea.height);
        
        // Border
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.strokeRect(smokingArea.x, smokingArea.y, smokingArea.width, smokingArea.height);

        // Litter (Cigarette butts)
        ctx.fillStyle = '#cbd5e1';
        // Random noise based on pos
        for(let i=0; i<30; i++) {
            const rx = (Math.sin(i*123) + 1) / 2 * (smokingArea.width - 10);
            const ry = (Math.cos(i*321) + 1) / 2 * (smokingArea.height - 10);
            ctx.fillRect(smokingArea.x + 5 + rx, smokingArea.y + 5 + ry, 3, 1);
        }
    }

    // 4. Draw Gate Labels
    ctx.save();
    ctx.font = 'bold 30px "Roboto Mono"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.translate(300, 200); ctx.rotate(-Math.PI/2); ctx.fillText("ПРИЕМКА", 0, 0); ctx.restore();
    ctx.save();
    ctx.translate(WORLD_WIDTH - 300, 200); ctx.rotate(Math.PI/2); ctx.fillText("ОТГРУЗКА", 0, 0); ctx.restore();

    // 5. Sorted Entities
    const sortedEntities = renderableEntities.sort((a,b) => (a.y + a.height) - (b.y + b.height));

    for (const ent of sortedEntities) {
      if (ent.type === 'decoration') {
          ctx.save(); ctx.translate(ent.x, ent.y); ctx.rotate(ent.rotation || 0); ctx.fillStyle = ent.color;
          if (ent.subtype === 'stain') { ctx.beginPath(); ctx.ellipse(0,0, ent.width/2, ent.height/2, 0, 0, Math.PI*2); ctx.fill(); }
          else if (ent.subtype === 'crack') { ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-ent.width/2, 0); ctx.lineTo(0, ent.height/4); ctx.lineTo(ent.width/2, -ent.height/4); ctx.stroke(); }
          ctx.restore(); continue;
      }
      if (ent.type === 'spill') {
          ctx.save(); ctx.translate(ent.x + ent.width/2, ent.y + ent.height/2); ctx.rotate(ent.rotation || 0);
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.beginPath(); ctx.ellipse(0, 0, ent.width/2, ent.height/2, 0, 0, Math.PI*2); ctx.fill();
          // Shiny gloss
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.beginPath(); ctx.ellipse(-10, -5, 10, 5, 0.5, 0, Math.PI*2); ctx.fill();
          ctx.restore();
          continue;
      }
      if (ent.type === 'bench') {
          // Legs
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ent.x + 5, ent.y + 5, 5, 20);
          ctx.fillRect(ent.x + ent.width - 10, ent.y + 5, 5, 20);
          // Seat
          ctx.fillStyle = '#3f6212'; // Dark green wood
          ctx.fillRect(ent.x, ent.y, ent.width, 10);
          // Highlight
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(ent.x, ent.y, ent.width, 2);
          continue;
      }
      if (ent.type === 'transformer_box') {
          // Main Box
          ctx.fillStyle = '#475569';
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          // Vents
          ctx.fillStyle = '#1e293b';
          for(let i=10; i<ent.height-10; i+=10) {
              ctx.fillRect(ent.x + 10, ent.y + i, ent.width - 20, 4);
          }
          // Warning Sign
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(ent.x + ent.width/2, ent.y + 20);
          ctx.lineTo(ent.x + ent.width/2 - 15, ent.y + 50);
          ctx.lineTo(ent.x + ent.width/2 + 15, ent.y + 50);
          ctx.fill();
          // Bolt
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.font = '20px Arial';
          ctx.fillText("⚡", ent.x + ent.width/2, ent.y + 45);
          continue;
      }
      if (ent.type === 'electrical_panel') {
          ctx.fillStyle = '#4b5563';
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath(); ctx.arc(ent.x + ent.width/2, ent.y + ent.height/2, 10, 0, Math.PI*2); ctx.fill();
          // Spark particles?
          if (state.activeTask?.targetId === ent.id && Math.random() < 0.1) {
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(ent.x + Math.random()*ent.width, ent.y + Math.random()*ent.height, 4, 4);
          }
          // Icon
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.font = '20px sans-serif';
          ctx.fillText("⚡", ent.x + ent.width/2, ent.y + ent.height/2 + 7);
          continue;
      }
      if (ent.type === 'operator_console') {
          // Desk
          ctx.fillStyle = '#1e293b'; // Dark wood/metal
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
          // Monitors
          ctx.fillStyle = '#000';
          ctx.fillRect(ent.x + 10, ent.y + 10, 30, 25); // Left
          ctx.fillRect(ent.x + 45, ent.y + 5, 40, 30); // Center
          ctx.fillRect(ent.x + 90, ent.y + 10, 30, 25); // Right
          
          // Screen Glow
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(ent.x + 12, ent.y + 12, 26, 21);
          ctx.fillStyle = state.activeTask?.step === 'sign' ? '#3b82f6' : '#0ea5e9'; 
          ctx.fillRect(ent.x + 47, ent.y + 7, 36, 26);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(ent.x + 92, ent.y + 12, 26, 21);
          
          // Chair back
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(ent.x + 65, ent.y + 60, 15, Math.PI, 0);
          ctx.fill();

          if (state.activeTask?.step === 'sign') {
              // Blink text on screen
              if (Math.floor(Date.now() / 500) % 2 === 0) {
                  ctx.fillStyle = '#fff';
                  ctx.font = '10px monospace';
                  ctx.fillText("SIGN", ent.x + 65, ent.y + 25);
              }
          }
          continue;
      }
      if (ent.type === 'sorting_table') {
          drawSortingTable(ctx, ent, (state.activeTask && state.activeTask.targetId === ent.id) || false);
          continue;
      }
      if (ent.type === 'pallet') {
          ctx.save();
          ctx.translate(ent.x + ent.width/2, ent.y + ent.height/2);
          ctx.rotate(ent.rotation || 0);
          ctx.translate(-ent.width/2, -ent.height/2);
          
          ctx.fillStyle = ent.color; // Wood
          ctx.fillRect(0, 0, ent.width, ent.height); // Main platform
          
          ctx.fillStyle = '#78350f'; // Darker details
          ctx.fillRect(10, 0, 2, ent.height);
          ctx.fillRect(ent.width - 12, 0, 2, ent.height);
          ctx.fillRect(ent.width/2 - 1, 0, 2, ent.height);
          
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(2, 2, ent.width-4, 4);
          ctx.restore();
          continue;
      }
      if (ent.type === 'wall') {
          if (ent.subtype === 'glass') {
              // Glass Walls
              ctx.fillStyle = 'rgba(148, 163, 184, 0.2)'; // Transparent blue-ish
              ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
              ctx.strokeStyle = 'rgba(255,255,255,0.3)';
              ctx.lineWidth = 1;
              ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
              // Reflection lines
              ctx.beginPath();
              ctx.moveTo(ent.x, ent.y + ent.height);
              ctx.lineTo(ent.x + ent.width, ent.y);
              ctx.stroke();
          } else if (ent.id.includes('elec')) {
              // Cage Walls (Yellow Mesh)
              ctx.strokeStyle = ent.color; // Yellow
              ctx.lineWidth = 4;
              ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
              // Crosshatch pattern
              ctx.save();
              ctx.beginPath();
              ctx.rect(ent.x, ent.y, ent.width, ent.height);
              ctx.clip();
              ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
              ctx.lineWidth = 2;
              for(let i=-50; i<300; i+=10) {
                  ctx.moveTo(ent.x + i, ent.y);
                  ctx.lineTo(ent.x + i + 50, ent.y + 150);
              }
              ctx.stroke();
              ctx.restore();
          } else {
              // Standard Walls
              ctx.fillStyle = ent.color; ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
              ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(ent.x, ent.y, ent.width, 10);
          }
          continue;
      }
      if (ent.type === 'truck') {
          drawTruck(ctx, ent);
          continue;
      }
      if (ent.type === 'rack') {
         drawRack(ctx, ent, (state.activeTask && ent.id === state.activeTask.targetId) || false);
         continue;
      }
    }

    drawPlayer(ctx, player);
    
    // Draw Smoke Particles if player is in smoking area
    if (onSmokingArea) {
        ctx.save();
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        for(let i=0; i<5; i++) {
            const px = player.x + (Math.random()-0.5)*20;
            const py = player.y - 30 - Math.random()*20;
            const size = Math.random()*10 + 5;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }

    // 6. Draw Overhead Shutter Boxes
    // Inbound
    ctx.fillStyle = '#475569';
    ctx.fillRect(150, -60, 300, 20); 
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(150, -40, 300, 5); 
    // Outbound
    const outboundX = WORLD_WIDTH - 150 - 300;
    ctx.fillStyle = '#475569';
    ctx.fillRect(outboundX, -60, 300, 20);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(outboundX, -40, 300, 5);

    // Floating Text
    state.floatingTexts = state.floatingTexts.filter(ft => ft.life > 0);
    for (const ft of state.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 20px "Roboto Mono"'; 
      ctx.textAlign = 'center';
      ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.shadowBlur = 0;
      ft.y -= 0.5 * dt; ft.life -= dt;
    }

    ctx.restore();

    // Lighting
    const screenX = player.x - state.camera.x;
    const screenY = player.y - state.camera.y;
    const gradient = ctx.createRadialGradient(screenX, screenY, 50, screenX, screenY, 600);
    gradient.addColorStop(0, 'rgba(0,0,0,0)'); 
    gradient.addColorStop(0.2, 'rgba(0,0,0,0.1)'); 
    gradient.addColorStop(1, 'rgba(0, 5, 20, 0.7)'); 
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalCompositeOperation = 'overlay'; 
    const beamGrad = ctx.createLinearGradient(screenX, screenY, screenX + Math.cos(player.angle)*300, screenY + Math.sin(player.angle)*300);
    beamGrad.addColorStop(0, 'rgba(255, 255, 200, 0.4)'); beamGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.beginPath(); ctx.moveTo(screenX, screenY); ctx.arc(screenX, screenY, 300, player.angle - 0.3, player.angle + 0.3); ctx.fillStyle = beamGrad; ctx.fill();
    ctx.restore();

    if (Math.random() < 0.1 * dt) updateUI();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const buyItem = (item: 'coffee' | 'gloves' | 'electricJack' | 'pizza', cost: number) => {
    if (gameState.current.player.money >= cost) {
      gameState.current.player.money -= cost;
      if (item === 'coffee') {
        gameState.current.player.stamina = Math.min(gameState.current.player.stamina + 30, gameState.current.player.maxStamina);
        addFloatingText("Бодрость!", gameState.current.player.x, gameState.current.player.y - 40, '#38bdf8');
      } else if (item === 'pizza') {
        gameState.current.player.happiness = Math.min(gameState.current.player.happiness + 100, 100);
        gameState.current.player.stamina = Math.min(gameState.current.player.stamina + 50, gameState.current.player.maxStamina);
        addFloatingText("ВКУСНОТИЩА!", gameState.current.player.x, gameState.current.player.y - 40, '#facc15');
      } else if (item === 'gloves') {
        gameState.current.upgrades.gloves = true;
      } else if (item === 'electricJack') {
        gameState.current.upgrades.electricJack = true;
      }
      updateUI();
    }
  };

  // --- Mini Games Overlays ---
  
  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden font-mono select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={`block mx-auto border-4 border-slate-800 shadow-2xl rounded-sm transition-opacity duration-300 ${miniGame ? 'opacity-50 blur-sm' : 'opacity-100'}`}
        style={{ cursor: 'none' }} 
      />
      
      {/* HUD - Status */}
      <div className={`absolute top-6 left-6 flex flex-col gap-3 pointer-events-none animate-in slide-in-from-left-4 fade-in duration-500 ${miniGame ? 'opacity-20' : 'opacity-100'}`}>
        <div className="bg-slate-900/80 backdrop-blur-sm border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-xl w-80">
           <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
             <span className="text-xs text-slate-400 font-bold tracking-widest flex items-center gap-1"><CalendarCheck size={12}/> СМЕНА #{uiState.day}</span>
             <span className="text-emerald-400 font-bold font-mono text-xl flex items-center gap-2">
                <Banknote size={20}/> {uiState.money} ₽
             </span>
           </div>

           {/* Stamina */}
           <div className="mt-3">
             <div className="flex justify-between text-xs mb-1 font-bold text-slate-300">
               <span>ВЫНОСЛИВОСТЬ</span>
               <span className={uiState.stamina < 30 ? 'text-red-500 animate-pulse' : 'text-blue-400'}>{Math.floor(uiState.stamina)}%</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-sm overflow-hidden border border-slate-700 mb-4">
               <div 
                 className={`h-full transition-all duration-300 ${uiState.stamina < 30 ? 'bg-red-600' : 'bg-blue-600'}`} 
                 style={{ width: `${uiState.stamina}%` }}
               />
             </div>
           </div>

           {/* Happiness */}
           <div className="mt-1">
             <div className="flex justify-between text-xs mb-1 font-bold text-slate-300">
               <span className="flex items-center gap-1"><Smile size={12} className={uiState.happiness < 30 ? 'text-red-500' : 'text-yellow-400'}/> НАСТРОЕНИЕ</span>
               <span className={uiState.happiness < 30 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}>{Math.floor(uiState.happiness)}%</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-sm overflow-hidden border border-slate-700 mb-4">
               <div 
                 className={`h-full transition-all duration-300 ${uiState.happiness < 30 ? 'bg-red-600' : 'bg-yellow-500'}`} 
                 style={{ width: `${uiState.happiness}%` }}
               />
             </div>
           </div>

           {/* XP / Level */}
           <div className="flex gap-2 items-center">
              <div className="bg-indigo-600 w-8 h-8 rounded flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                  {uiState.level + 1}
              </div>
              <div className="flex-1">
                  <div className="flex justify-between text-[10px] uppercase text-slate-400 font-bold mb-1">
                      <span>{RANKS[uiState.level] || 'Мастер'}</span>
                      <span>{uiState.xp} / {uiState.xpToNext}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-sm overflow-hidden border border-slate-700">
                     <div 
                       className="h-full bg-indigo-500 transition-all duration-300"
                       style={{ width: `${Math.min(100, (uiState.xp / uiState.xpToNext) * 100)}%` }}
                     />
                  </div>
              </div>
           </div>

        </div>
      </div>

      {/* HUD - Quota */}
      <div className={`absolute top-6 right-6 flex flex-col gap-3 pointer-events-none animate-in slide-in-from-right-4 fade-in duration-500 ${miniGame ? 'opacity-20' : 'opacity-100'}`}>
         <div className="bg-slate-900/80 backdrop-blur-sm border-r-4 border-amber-500 p-4 rounded-l-lg shadow-xl w-64">
             <div className="flex items-center gap-2 text-amber-500 font-bold mb-3">
                 <TrendingUp size={18}/>
                 <span className="uppercase tracking-widest text-sm">План Смены</span>
             </div>
             <div className="flex justify-between items-end mb-1">
                 <span className="text-3xl font-mono text-white font-bold">{uiState.quotaCurrent}</span>
                 <span className="text-sm text-slate-500 font-mono mb-1">/ {uiState.quotaTotal} ящ.</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-sm overflow-hidden border border-slate-700">
                  <div 
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (uiState.quotaCurrent / uiState.quotaTotal) * 100)}%` }}
                  />
             </div>
         </div>
      </div>


      {/* HUD - Task */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none w-[500px] transition-opacity duration-300 ${miniGame ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`relative px-6 py-4 rounded-sm border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-colors duration-500 ${uiState.mode === 'INBOUND' ? 'bg-green-950/80 border-green-600/50' : uiState.mode === 'OUTBOUND' ? 'bg-amber-950/80 border-amber-600/50' : uiState.mode === 'INVENTORY' ? 'bg-indigo-950/80 border-indigo-600/50' : uiState.mode === 'SORTING' ? 'bg-blue-950/80 border-blue-600/50' : uiState.mode === 'ELECTRICAL' ? 'bg-yellow-950/80 border-yellow-600/50' : uiState.mode === 'CLEANING' ? 'bg-red-950/80 border-red-600/50' : 'bg-slate-900/80 border-slate-700'}`}>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
          
          <div className={`p-3 rounded bg-black/40 ${uiState.mode === 'INBOUND' ? 'text-green-400' : uiState.mode === 'INVENTORY' ? 'text-indigo-400' : uiState.mode === 'SORTING' ? 'text-blue-400' : uiState.mode === 'ELECTRICAL' ? 'text-yellow-400' : uiState.mode === 'CLEANING' ? 'text-red-400' : 'text-amber-400'}`}>
             {uiState.mode === 'INBOUND' ? <TruckIcon size={28} /> : uiState.mode === 'INVENTORY' ? <ClipboardCheck size={28} /> : uiState.mode === 'SORTING' ? <ArrowLeftRight size={28}/> : uiState.mode === 'CLEANING' ? <Droplets size={28}/> : uiState.mode === 'ELECTRICAL' ? <Zap size={28}/> : <Package size={28} />}
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">{uiState.mode === 'WAITING' ? 'СИСТЕМА ОЖИДАНИЯ' : 'ТЕКУЩАЯ ЗАДАЧА'}</div>
            <div className="font-bold text-white text-lg leading-tight tracking-tight drop-shadow-md">{uiState.taskDescription}</div>
          </div>
          {uiState.currentLoad > 0 && (
             <div className="flex flex-col items-center justify-center bg-black/40 p-2 rounded border border-slate-600/50">
                <span className="text-[10px] text-slate-400 uppercase">ГРУЗ</span>
                <span className="text-xl font-mono font-bold text-white">{uiState.currentLoad}/6</span>
             </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-6 right-6 text-right pointer-events-none opacity-80 transition-opacity duration-300 ${miniGame ? 'opacity-0' : 'opacity-100'}`}>
         <div className="bg-slate-900/90 backdrop-blur p-4 rounded-lg border border-slate-700 shadow-xl">
           <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-700 pb-1">УПРАВЛЕНИЕ</div>
           <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
             <span className="text-slate-400">WASD</span> <span className="text-white font-bold">ДВИЖЕНИЕ</span>
             <span className="text-slate-400">SHIFT</span> <span className="text-white font-bold">БЕГ</span>
             <span className="text-slate-400">SPACE</span> <span className="text-white font-bold">ДЕЙСТВИЕ</span>
           </div>
         </div>
      </div>

      {/* Bottom Left Buttons */}
      <div className={`absolute bottom-6 left-6 flex gap-4 transition-opacity duration-300 ${miniGame ? 'opacity-0' : 'opacity-100'}`}>
        {/* Shop Button */}
        <button 
          onClick={() => setUiState(prev => ({ ...prev, isShopOpen: !prev.isShopOpen }))}
          className="group relative bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] border-2 border-indigo-400 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <ShoppingCart size={24} />
          {!uiState.isShopOpen && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
        </button>

        {/* Audio Toggle */}
        <button 
          onClick={() => setUiState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
          className="group bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-full shadow-lg border-2 border-slate-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          {uiState.isMuted ? <VolumeX size={24} className="text-slate-400" /> : <Volume2 size={24} className="text-emerald-400" />}
        </button>
      </div>

      {/* Mini Games */}
      {miniGame && miniGame.type === 'CLEANING' && (
          <CleaningMiniGame
            onComplete={miniGame.onComplete}
            playSound={playSound}
            onClose={() => setMiniGame(null)}
          />
      )}
      {miniGame && miniGame.type === 'INVENTORY' && (
          <InventoryMiniGame 
            data={miniGame.data} 
            onComplete={miniGame.onComplete} 
            playSound={playSound}
            onClose={() => setMiniGame(null)}
          />
      )}
      {miniGame && miniGame.type === 'PACKING' && (
          <PackingMiniGame 
            onComplete={miniGame.onComplete} 
            playSound={playSound}
            onClose={() => setMiniGame(null)}
          />
      )}
      {miniGame && miniGame.type === 'SORTING' && (
          <SortingMiniGame
            onComplete={miniGame.onComplete}
            playSound={playSound}
            onClose={() => setMiniGame(null)}
          />
      )}
      {miniGame && miniGame.type === 'PAPERWORK' && (
          <PaperworkMiniGame
            onComplete={miniGame.onComplete}
            playSound={playSound}
            onClose={() => setMiniGame(null)}
          />
      )}
      {miniGame && miniGame.type === 'WIRES' && (
          <WiresMiniGame
            onComplete={miniGame.onComplete}
            playSound={playSound}
            onClose={() => setMiniGame(null)}
          />
      )}
      {miniGame && miniGame.type === 'TRUCK_LOAD' && (
          <TruckLoadingMiniGame
            data={miniGame.data}
            onComplete={miniGame.onComplete}
            playSound={playSound}
            onClose={() => setMiniGame(null)}
          />
      )}

      {/* Shop Modal */}
      {uiState.isShopOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-indigo-500/50 p-0 rounded-xl w-[400px] shadow-2xl relative overflow-hidden">
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
               <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingCart className="text-indigo-400"/> МАГАЗИН</h2>
               <button onClick={() => setUiState(s => ({...s, isShopOpen: false}))} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Coffee */}
              <div className="group bg-slate-800/50 hover:bg-slate-800 p-3 rounded border border-slate-700 hover:border-indigo-500/50 transition-all flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-950/50 p-2 rounded text-amber-500"><Coffee size={24} /></div>
                  <div>
                    <div className="font-bold text-white">Кофе 3в1</div>
                    <div className="text-xs text-slate-400">+30 Энергии</div>
                  </div>
                </div>
                <button onClick={() => buyItem('coffee', 50)} className="bg-slate-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors">50 ₽</button>
              </div>

              {/* Pizza */}
              <div className="group bg-slate-800/50 hover:bg-slate-800 p-3 rounded border border-slate-700 hover:border-indigo-500/50 transition-all flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-red-950/50 p-2 rounded text-red-500"><Pizza size={24} /></div>
                  <div>
                    <div className="font-bold text-white">Пицца</div>
                    <div className="text-xs text-slate-400">Та самая легенда. +100 Счастья</div>
                  </div>
                </div>
                <button onClick={() => buyItem('pizza', 300)} className="bg-slate-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors">300 ₽</button>
              </div>

              {/* Gloves */}
              <div className="group bg-slate-800/50 hover:bg-slate-800 p-3 rounded border border-slate-700 hover:border-indigo-500/50 transition-all flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-950/50 p-2 rounded text-blue-500"><Hand size={24} /></div>
                  <div>
                    <div className="font-bold text-white">Перчатки</div>
                    <div className="text-xs text-slate-400">+20 Бонус/Заказ</div>
                  </div>
                </div>
                 {gameState.current.upgrades.gloves ? (
                    <span className="text-green-500 text-xs font-bold uppercase border border-green-500/30 px-2 py-1 rounded">Куплено</span>
                 ) : (
                    <button onClick={() => buyItem('gloves', 500)} className="bg-slate-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors">500 ₽</button>
                 )}
              </div>

              {/* Jack */}
              <div className="group bg-slate-800/50 hover:bg-slate-800 p-3 rounded border border-slate-700 hover:border-indigo-500/50 transition-all flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-950/50 p-2 rounded text-yellow-500"><Zap size={24} /></div>
                  <div>
                    <div className="font-bold text-white">Электро-Рохля</div>
                    <div className="text-xs text-slate-400">Скорость x1.5</div>
                  </div>
                </div>
                {gameState.current.upgrades.electricJack ? (
                    <span className="text-green-500 text-xs font-bold uppercase border border-green-500/30 px-2 py-1 rounded">Куплено</span>
                 ) : (
                    <button onClick={() => buyItem('electricJack', 2000)} className="bg-slate-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors">2000 ₽</button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interact Prompt */}
      {activeInteraction(gameState.current) && !miniGame && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-24 animate-bounce z-10 pointer-events-none">
           <div className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center gap-2">
             <span className="bg-black text-white rounded px-1.5 py-0.5 text-xs">SPACE</span>
             <span>ДЕЙСТВИЕ</span>
           </div>
        </div>
      )}
    </div>
  );
};

// Helper for UI prompt
function activeInteraction(state: GameState): boolean {
  if (!state || !state.activeTask) return false;
  const { player } = state;
  const range = 140; // Increased interaction range
  
  const target = state.entities.find(e => {
    if (e.type === 'truck') {
         const cx = e.x + e.width/2;
         const isRotated = e.rotation && Math.abs(e.rotation - Math.PI) < 0.1;
         const cy = isRotated ? e.y + e.height : e.y;
         const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
         return dist < range && e.truckState === 'waiting';
    }
    if (e.type === 'rack') {
        const cx = e.x + e.width/2;
        const cy = e.y + e.height/2;
        const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
        return dist < range;
    }
    if (e.type === 'pallet') {
        const cx = e.x + e.width/2;
        const cy = e.y + e.height/2;
        const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
        return dist < 60;
    }
    if (e.type === 'sorting_table') {
        const cx = e.x + e.width/2;
        const cy = e.y + e.height/2;
        const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
        return dist < 140; 
    }
    if (e.type === 'spill') {
        const cx = e.x + e.width/2;
        const cy = e.y + e.height/2;
        const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
        return dist < 80;
    }
    if (e.type === 'electrical_panel') {
        const cx = e.x + e.width/2;
        const cy = e.y + e.height/2;
        const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
        return dist < 80;
    }
    if (e.type === 'operator_console') {
        const cx = e.x + e.width/2;
        const cy = e.y + e.height/2;
        const dist = Math.sqrt(Math.pow(player.x - cx, 2) + Math.pow(player.y - cy, 2));
        return dist < 120;
    }
    return false;
 });
 
 if (!target) return false;

  const targetId = target.type === 'truck' 
    ? (state.activeTask.type === TaskType.INBOUND ? 'zone_inbound' : 'zone_outbound') 
    : target.id;
    
  if (target.type === 'pallet') return true;

  // Cleanup task
  if (state.activeTask.type === TaskType.CLEANING && target.type === 'spill') {
      return target.id === state.activeTask.targetId;
  }
  
  if (state.activeTask.type === TaskType.ELECTRICAL && target.type === 'electrical_panel') {
      return target.id === state.activeTask.targetId;
  }

  // Sorting task
  if (state.activeTask.type === TaskType.SORTING && target.type === 'sorting_table') {
      return targetId === state.activeTask.targetId;
  }

  // Inventory task
  if (state.activeTask.type === TaskType.INVENTORY && target.type === 'rack') {
      return targetId === state.activeTask.targetId;
  }
  
  // Paperwork
  if (state.activeTask.step === 'sign' && target.type === 'operator_console') {
      return true;
  }

  // Check Step Match
  if (state.activeTask.step === 'pickup') {
     if (state.activeTask.type === TaskType.INBOUND) return targetId === 'zone_inbound';
     if (state.activeTask.type === TaskType.OUTBOUND) return targetId === state.activeTask.targetId;
  } else if (state.activeTask.step === 'deliver') {
     if (state.activeTask.type === TaskType.INBOUND) return targetId === state.activeTask.targetId;
     if (state.activeTask.type === TaskType.OUTBOUND) return targetId === 'zone_outbound';
  }

  return false;
}

export default Game;