import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Delete, 
  X, 
  Minus, 
  Plus, 
  Equal, 
  Divide, 
  RotateCcw,
  Trash2,
  ChevronRight
} from 'lucide-react';

type HistoryItem = {
  expression: string;
  result: string;
  timestamp: number;
};

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isResult, setIsResult] = useState(false);

  // Handle number input
  const handleNumber = (num: string) => {
    if (isResult) {
      setDisplay(num);
      setIsResult(false);
    } else {
      setDisplay(prev => (prev === '0' ? num : prev + num));
    }
  };

  // Handle operators
  const handleOperator = (op: string) => {
    setIsResult(false);
    setEquation(prev => {
      // If last char is operator, replace it
      if (/[+\-*/]$/.test(prev) && display === '0') {
        return prev.slice(0, -1) + op;
      }
      return prev + display + op;
    });
    setDisplay('0');
  };

  // Handle calculation
  const calculate = useCallback(() => {
    try {
      const fullEquation = equation + display;
      // Using Function constructor as a safer alternative to eval for basic math
      // In a production app, a proper math parser library would be better
      const result = new Function(`return ${fullEquation.replace(/×/g, '*').replace(/÷/g, '/')}`)();
      const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '');
      
      const newHistoryItem: HistoryItem = {
        expression: fullEquation,
        result: resultStr,
        timestamp: Date.now()
      };

      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      setDisplay(resultStr);
      setEquation('');
      setIsResult(true);
    } catch (error) {
      setDisplay('Error');
      setEquation('');
      setIsResult(true);
    }
  }, [equation, display]);

  // Handle clear
  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsResult(false);
  };

  // Handle backspace
  const backspace = () => {
    if (isResult) {
      clear();
    } else {
      setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }
  };

  // Handle keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (['+', '-', '*', '/'].includes(e.key)) handleOperator(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Backspace') backspace();
      if (e.key === 'Escape') clear();
      if (e.key === '.') handleNumber('.');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculate]);

  const Button = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "default" 
  }: { 
    children: React.ReactNode, 
    onClick: () => void, 
    className?: string,
    variant?: 'default' | 'operator' | 'action' | 'equal'
  }) => {
    const variants = {
      default: "bg-white hover:bg-zinc-100 text-zinc-800 shadow-sm",
      operator: "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold",
      action: "bg-zinc-50 hover:bg-zinc-100 text-zinc-500",
      equal: "bg-zinc-900 hover:bg-zinc-800 text-white shadow-md"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`h-16 rounded-2xl flex items-center justify-center text-xl transition-colors ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 flex flex-col h-[700px]"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <h1 className="text-zinc-400 font-medium text-sm tracking-widest uppercase">Precision</h1>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
          >
            <History size={20} />
          </button>
        </div>

        {/* Display Area */}
        <div className="px-8 flex-1 flex flex-col justify-end items-end overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={equation}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-zinc-400 text-lg font-mono mb-2 h-8 overflow-hidden text-right w-full"
            >
              {equation}
            </motion.div>
          </AnimatePresence>
          <motion.div 
            key={display}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-light text-zinc-900 tracking-tighter mb-8 break-all text-right w-full"
          >
            {display}
          </motion.div>
        </div>

        {/* Keypad */}
        <div className="p-6 grid grid-cols-4 gap-3 bg-zinc-50/50">
          <Button onClick={clear} variant="action"><RotateCcw size={20} /></Button>
          <Button onClick={backspace} variant="action"><Delete size={20} /></Button>
          <Button onClick={() => handleOperator('%')} variant="action">%</Button>
          <Button onClick={() => handleOperator('/')} variant="operator"><Divide size={20} /></Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button onClick={() => handleOperator('*')} variant="operator"><X size={20} /></Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button onClick={() => handleOperator('-')} variant="operator"><Minus size={20} /></Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button onClick={() => handleOperator('+')} variant="operator"><Plus size={20} /></Button>

          <Button onClick={() => handleNumber('0')} className="col-span-1">0</Button>
          <Button onClick={() => handleNumber('.')}>.</Button>
          <Button onClick={calculate} variant="equal" className="col-span-2"><Equal size={24} /></Button>
        </div>

        {/* History Sidebar/Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-white z-10 flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-bottom border-zinc-100">
                <h2 className="text-xl font-semibold text-zinc-900">History</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setHistory([])}
                    className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                    <History size={48} strokeWidth={1} />
                    <p>No calculations yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={item.timestamp}
                      className="group cursor-pointer"
                      onClick={() => {
                        setDisplay(item.result);
                        setShowHistory(false);
                      }}
                    >
                      <div className="text-zinc-400 text-sm font-mono mb-1 group-hover:text-zinc-600 transition-colors">
                        {item.expression} =
                      </div>
                      <div className="text-2xl font-medium text-zinc-900">
                        {item.result}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
