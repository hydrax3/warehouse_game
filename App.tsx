
import React, { useState } from 'react';
import Game from './components/Game';
import { GameMode } from './types';
import { PackageOpen, Play, AlertTriangle, Truck, Container } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>(GameMode.MENU);
  const [lastScore, setLastScore] = useState(0);

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
    <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 overflow-hidden relative">
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,22,29,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%]"></div>
         <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black"></div>
      </div>

      {mode === GameMode.MENU && (
        <div className="z-10 w-full max-w-4xl flex gap-8 items-stretch animate-in fade-in zoom-in duration-500">
          
          {/* Main Card */}
          <div className="flex-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-10 rounded-sm shadow-2xl relative overflow-hidden group">
            {/* Decoration Line */}
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
            
            <div className="mb-12 relative">
              <div className="text-amber-500 font-bold tracking-[0.3em] text-xs mb-2 uppercase">Логистический Терминал №17</div>
              <h1 className="text-6xl font-black text-white font-mono leading-none tracking-tighter">
                СКЛАД <span className="text-slate-700">24/7</span>
              </h1>
              <p className="mt-4 text-slate-400 text-lg border-l-2 border-slate-700 pl-4">
                Симулятор оператора гидравлической тележки. 
                <br/>Приемка, размещение, отгрузка.
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full group/btn relative py-5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xl rounded-sm shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="relative flex items-center justify-center gap-3">
                 <Play fill="currentColor" size={24} /> НАЧАТЬ СМЕНУ
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
            </button>
            
            <div className="mt-8 flex justify-between text-xs text-slate-500 font-mono">
               <span>VER: 1.1.0-GOLD</span>
               <span>STATUS: ONLINE</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="w-80 flex flex-col gap-4">
             <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-6 rounded-sm flex-1">
                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Container size={16}/> Инструктаж
                </h3>
                <ul className="text-sm text-slate-300 space-y-4 font-mono">
                  <li className="flex gap-3">
                    <span className="text-slate-600">01</span>
                    <span>Разгружайте прибывающие фуры в зоне <b className="text-white">INBOUND</b>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-600">02</span>
                    <span>Размещайте паллеты на стеллажах (адресное хранение).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-slate-600">03</span>
                    <span>Собирайте заказы для <b className="text-white">OUTBOUND</b>.</span>
                  </li>
                </ul>
             </div>
             
             <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-6 rounded-sm">
                <div className="text-xs text-slate-500 uppercase mb-1">Рекорд смены</div>
                <div className="text-3xl font-mono text-white font-bold tracking-widest">0000 ₽</div>
             </div>
          </div>

        </div>
      )}

      {mode === GameMode.PLAYING && (
        <Game onGameOver={handleGameOver} onExit={exitGame} onWin={handleWin} />
      )}

      {mode === GameMode.GAME_OVER && (
        <div className="z-20 text-center p-12 bg-slate-900 border-2 border-red-600/50 rounded-sm shadow-[0_0_50px_rgba(220,38,38,0.2)] max-w-md animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-2 font-mono">СМЕНА ОКОНЧЕНА</h2>
          <p className="text-slate-400 mb-8 font-mono text-sm leading-relaxed">
            Вы упали без сил прямо посреди склада. <br/>Начальник смены выписал штраф.
          </p>
          
          <div className="bg-black/40 p-6 rounded mb-8 border border-slate-800">
            <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">Итоговый заработок</div>
            <div className="text-5xl font-mono text-emerald-400 font-bold">{lastScore} ₽</div>
          </div>

          <button 
            onClick={exitGame}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors uppercase tracking-widest text-sm"
          >
            В Главное Меню
          </button>
        </div>
      )}
      
      {mode === GameMode.ENDING && (
        <div className="z-50 absolute inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 p-8">
            <div className="max-w-2xl text-center font-mono">
                <div className="text-amber-500 text-sm tracking-[0.5em] mb-8 uppercase animate-pulse">Карьера Завершена</div>
                
                <h1 className="text-4xl md:text-6xl text-white font-bold mb-8 leading-snug">
                    Теперь ты стал начальником смены.
                </h1>
                
                <p className="text-slate-400 text-xl md:text-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 fill-mode-forwards opacity-0" style={{animationDelay: '1.5s'}}>
                    Но... счастлив ли ты?
                </p>

                <div className="flex gap-8 justify-center animate-in fade-in zoom-in duration-1000 delay-2000 opacity-0 fill-mode-forwards" style={{animationDelay: '3s'}}>
                    <button 
                        onClick={exitGame} 
                        className="px-8 py-4 border border-slate-700 text-slate-400 hover:text-white hover:border-white transition-all uppercase tracking-widest text-sm"
                    >
                        Уйти на пенсию
                    </button>
                    <button 
                        onClick={startGame} 
                        className="px-8 py-4 bg-white text-black font-bold hover:bg-slate-300 transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Начать смену заново
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
