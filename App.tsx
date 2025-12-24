import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import { GameMode } from './types';
import { PackageOpen, Play, AlertTriangle, Truck, Container, Terminal, Trophy, Disc, Star } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [lastScore, setLastScore] = useState(0);
  const [bootSequence, setBootSequence] = useState(true);

  // Intro "Boot" sequence effect
  useEffect(() => {
    if (mode === GameMode.MENU) {
      setBootSequence(true);
      const timer = setTimeout(() => setBootSequence(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const startGame = () => setMode(GameMode.PLAYING);
  const exitGame = () => setMode(GameMode.MENU);
  
  const handleGameOver = (score: number) => {
    setLastScore(score);
    setMode(GameMode.GAME_OVER);
  };
  
  const handleWin = () => {
    setMode(GameMode.ENDING);
  };

  return (
    <div className="w-screen h-screen bg-[#050505] flex flex-col items-center justify-center text-slate-100 overflow-hidden relative font-mono select-none">
      
      {/* --- GLOBAL RETRO EFFECTS --- */}
      
      {/* 1. Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%]"></div>
      
      {/* 2. CRT Vignette & Glow */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,0.4)_100%)] shadow-[inset_0_0_5rem_rgba(0,0,0,0.7)]"></div>

      {mode === GameMode.MENU && (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* Animated Background: Conveyor Belt Floor */}
          <div className="absolute inset-0 bg-[#111] opacity-50 flex flex-col gap-20 transform -rotate-12 scale-150 origin-center pointer-events-none">
             {/* Generate multiple "conveyor" lines */}
             {Array.from({ length: 10 }).map((_, i) => (
               <div key={i} className={`flex gap-12 ${i % 2 === 0 ? 'animate-[slideRight_10s_linear_infinite]' : 'animate-[slideLeft_12s_linear_infinite]'}`}>
                  {Array.from({ length: 20 }).map((__, j) => (
                    <div key={j} className="w-16 h-16 border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center">
                       {Math.random() > 0.7 && <div className="w-10 h-10 bg-amber-700/80 border border-amber-500"></div>}
                    </div>
                  ))}
               </div>
             ))}
          </div>

          {/* Main Menu Container (Terminal Window) */}
          <div className={`z-30 relative bg-[#1a1b26] border-4 border-slate-500 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] p-2 max-w-2xl w-full mx-4 transition-all duration-500 ${bootSequence ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100'}`}>
            
            {/* Window Header */}
            <div className="bg-slate-500 p-1 flex justify-between items-center mb-2">
                <span className="text-black font-bold text-xs px-2 flex items-center gap-2">
                   <Terminal size={14}/> WAREHOUSE_OS_V1.1.EXE
                </span>
                <div className="flex gap-1 px-1">
                    <div className="w-3 h-3 bg-slate-400 border border-slate-600"></div>
                    <div className="w-3 h-3 bg-slate-400 border border-slate-600"></div>
                    <div className="w-3 h-3 bg-red-500 border border-red-800"></div>
                </div>
            </div>

            {/* Inner Content */}
            <div className="bg-[#0f0f14] border-2 border-slate-700 p-8 flex flex-col items-center relative overflow-hidden">
                
                {/* Decorative Grid Background in Menu */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(50,50,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(50,50,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

                {/* Logo Area */}
                <div className="mb-10 text-center relative z-10">
                    <div className="inline-block border-4 border-amber-500 px-6 py-2 bg-amber-900/20 mb-4 shadow-[4px_4px_0px_0px_#b45309]">
                        <h1 className="text-5xl md:text-7xl font-black text-amber-500 tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center gap-4">
                           <Truck size={48} className="transform -scale-x-100" /> 
                           СКЛАД
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-emerald-500 font-bold tracking-widest text-sm uppercase">
                        <span className="animate-pulse">● Online</span>
                        <span>Shift Manager Sim</span>
                        <span>16-BIT</span>
                    </div>
                </div>

                {/* Menu Buttons */}
                <div className="flex flex-col gap-4 w-full max-w-xs z-10">
                    <button 
                        onClick={startGame}
                        className="group relative bg-emerald-700 border-b-4 border-r-4 border-emerald-900 text-white py-4 px-6 font-bold text-lg hover:bg-emerald-600 hover:translate-y-1 hover:border-b-0 hover:border-r-0 hover:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] transition-all active:translate-y-1"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Play className="fill-white group-hover:animate-ping" size={20}/>
                            НАЧАТЬ СМЕНУ
                        </div>
                    </button>
                </div>

                {/* Footer / Credits */}
                <div className="mt-12 text-[10px] text-slate-600 font-mono text-center z-10">
                    <p>COPYRIGHT (C) 2024 LOGISTICS CORP.</p>
                    <p>ALL RIGHTS RESERVED.</p>
                    <p className="mt-2 text-amber-900/50 animate-pulse">INSERT COIN TO CONTINUE</p>
                </div>

                {/* CSS Art: Idle Forklift Decoration */}
                <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none transform scale-75">
                    {/* Simplified CSS Forklift */}
                    <div className="w-24 h-12 bg-slate-800 rounded-sm relative">
                        <div className="absolute -top-10 right-0 w-12 h-10 bg-slate-800 border-l border-white/10"></div>
                        <div className="absolute -top-8 right-2 w-8 h-6 bg-slate-900"></div> {/* Window */}
                        <div className="absolute bottom-0 -left-12 w-16 h-2 bg-slate-600"></div> {/* Forks */}
                        <div className="absolute -bottom-3 left-2 w-6 h-6 bg-black rounded-full border-2 border-slate-700"></div>
                        <div className="absolute -bottom-3 right-2 w-6 h-6 bg-black rounded-full border-2 border-slate-700"></div>
                    </div>
                </div>

            </div>
          </div>
          
          {/* Boot Sequence Overlay */}
          {bootSequence && (
             <div className="absolute inset-0 bg-black z-50 flex flex-col p-8 font-mono text-green-500 text-sm">
                <p>> BOOTING SYSTEM...</p>
                <p>> CHECKING MEMORY... OK</p>
                <p>> LOADING ASSETS... OK</p>
                <p>> CONNECTING TO SERVER... OK</p>
                <p>> INITIALIZING HYDRAULICS...</p>
                <p className="animate-pulse mt-4">_</p>
             </div>
          )}

        </div>
      )}

      {mode === GameMode.PLAYING && (
        <Game onGameOver={handleGameOver} onExit={exitGame} onWin={handleWin} />
      )}

      {mode === GameMode.GAME_OVER && (
        <div className="z-30 text-center p-1 bg-slate-500 border-4 border-slate-700 shadow-[10px_10px_0_0_rgba(0,0,0,0.8)] max-w-md animate-in zoom-in duration-300">
          <div className="bg-[#1a1b26] border-2 border-slate-600 p-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-900/30 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 font-mono uppercase tracking-widest text-red-500 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">СМЕНА ОКОНЧЕНА</h2>
            
            <div className="w-full h-px bg-slate-700 my-4"></div>

            <p className="text-slate-400 mb-8 font-mono text-xs leading-relaxed uppercase">
              > Критическая ошибка оператора.<br/>> Энергия исчерпана.<br/>> Штрафные санкции применены.
            </p>
            
            <div className="bg-black border border-slate-700 p-4 w-full mb-8 relative">
              <div className="absolute top-0 left-2 -translate-y-1/2 bg-[#1a1b26] px-2 text-[10px] text-slate-500 uppercase">Итоговый счет</div>
              <div className="text-4xl font-mono text-emerald-400 font-bold text-center tracking-widest">{lastScore} ₽</div>
            </div>

            <button 
              onClick={exitGame}
              className="w-full py-4 bg-slate-700 text-white font-bold uppercase tracking-widest text-sm hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all"
            >
              В Главное Меню
            </button>
          </div>
        </div>
      )}
      
      {mode === GameMode.ENDING && (
        <div className="z-50 absolute inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 p-8">
            <div className="max-w-3xl text-center font-mono border-4 border-amber-600 p-2 shadow-[0_0_50px_rgba(217,119,6,0.2)] bg-slate-900">
                <div className="border-2 border-amber-600/50 p-10 bg-black relative overflow-hidden">
                    {/* Confetti / Stars */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    
                    <div className="text-amber-500 text-xs tracking-[0.5em] mb-8 uppercase animate-pulse">Карьера Завершена</div>
                    
                    <h1 className="text-4xl md:text-6xl text-white font-bold mb-8 leading-snug drop-shadow-[4px_4px_0_#b45309]">
                        МАСТЕР СКЛАДА
                    </h1>
                    
                    <div className="flex justify-center mb-8">
                       <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                          <Star className="text-black w-20 h-20" fill="currentColor"/>
                       </div>
                    </div>

                    <p className="text-slate-400 text-sm md:text-lg mb-12 font-bold leading-relaxed">
                        Ты прошел путь от стажера до легенды.<br/>
                        Твоя рохля стала продолжением твоих рук.<br/>
                        Теперь ты — Начальник Смены.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={exitGame} 
                            className="px-6 py-3 border-2 border-slate-700 text-slate-400 hover:text-white hover:border-white hover:bg-slate-800 transition-all uppercase tracking-widest text-xs font-bold"
                        >
                            Уйти на пенсию
                        </button>
                        <button 
                            onClick={startGame} 
                            className="px-6 py-3 bg-amber-600 text-white font-bold hover:bg-amber-500 border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest text-xs"
                        >
                            Новая игра (NG+)
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes slideLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default App;