import { useState, useEffect } from 'react';

const Particles = ({ isDarkMode }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.2
    });

    // Create initial particles
    const initialParticles = Array.from({ length: 50 }, createParticle);
    setParticles(initialParticles);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + particle.speedX + window.innerWidth) % window.innerWidth,
          y: (particle.y + particle.speedY + window.innerHeight) % window.innerHeight
        }))
      );
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute rounded-full transition-colors duration-700 ${
            isDarkMode ? 'bg-orange-500' : 'bg-blue-400'
          }`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `translate(-50%, -50%)`,
          }}
        />
      ))}
    </div>
  );
};

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [lastButtonWasOperator, setLastButtonWasOperator] = useState(false);
  const [expression, setExpression] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [calculatorSize, setCalculatorSize] = useState('normal');

  // Size configurations
  const sizeConfig = {
    compact: {
      container: 'max-w-[280px]',
      display: 'h-24',
      displayText: 'text-4xl',
      expressionText: 'text-lg',
      button: 'h-12 text-xl',
      buttonGrid: 'gap-1.5 p-1.5',
      icons: 'h-4 w-4'
    },
    normal: {
      container: 'max-w-[320px]',
      display: 'h-32',
      displayText: 'text-5xl',
      expressionText: 'text-xl',
      button: 'h-16 text-2xl',
      buttonGrid: 'gap-2 p-2',
      icons: 'h-5 w-5'
    },
    large: {
      container: 'max-w-[380px]',
      display: 'h-40',
      displayText: 'text-6xl',
      expressionText: 'text-2xl',
      button: 'h-20 text-3xl',
      buttonGrid: 'gap-3 p-3',
      icons: 'h-6 w-6',
      // boxShadow: '20px 24px 16px pink, 20px 20px 15px blue, 20px 25px 35px red'
    }
  };

  const nextSize = {
    compact: 'normal',
    normal: 'large',
    large: 'compact'
  };

  const sizeNames = {
    compact: 'Compact',
    normal: 'Normal',
    large: 'Large'
  };

  const formatNumber = (number) => {
    const stringNum = number.toString();
    if (stringNum === 'Error') return stringNum;
    
    const [intPart, decPart] = stringNum.split('.');
    const formattedInt = parseInt(intPart).toLocaleString('en-US');
    
    if (decPart !== undefined) {
      return `${formattedInt}.${decPart}`;
    }
    return formattedInt;
  };

  const calculate = (a, b, op) => {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    
    switch (op) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '×':
        return num1 * num2;
      case '÷':
        return num2 !== 0 ? num1 / num2 : 'Error';
      default:
        return b;
    }
  };

  const handleNumberInput = (number) => {
    setLastButtonWasOperator(false);
    
    if (displayValue === 'Error') {
      setDisplayValue(number.toString());
      setExpression('');
      return;
    }

    if (waitingForSecondOperand) {
      setDisplayValue(number.toString());
      setWaitingForSecondOperand(false);
    } else {
      // Prevent multiple leading zeros
      if (displayValue === '0' && number === 0) return;
      
      // Replace leading zero unless it's a decimal
      if (displayValue === '0' && number !== '.') {
        setDisplayValue(number.toString());
      } else {
        // Prevent multiple decimal points
        if (number === '.' && displayValue.includes('.')) return;
        
        setDisplayValue(displayValue + number.toString());
      }
    }
  };

  const handleOperator = (nextOperator) => {
    // Handle special operators
    if (nextOperator === '±') {
      const newValue = String(-parseFloat(displayValue));
      setDisplayValue(newValue);
      if (waitingForSecondOperand) {
        setExpression(expression.slice(0, -displayValue.length) + newValue);
      }
      return;
    }
    
    if (nextOperator === '%') {
      const newValue = String(parseFloat(displayValue) / 100);
      setDisplayValue(newValue);
      if (waitingForSecondOperand) {
        setExpression(expression.slice(0, -displayValue.length) + newValue);
      }
      return;
    }

    const inputValue = displayValue;

    if (lastButtonWasOperator) {
      setOperator(nextOperator);
      setExpression(expression.slice(0, -1) + nextOperator);
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
      setExpression(formatNumber(inputValue) + ' ' + nextOperator);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplayValue(String(result));
      setFirstOperand(String(result));
      setExpression(formatNumber(result) + ' ' + nextOperator);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    setLastButtonWasOperator(true);
  };

  const handleEqual = () => {
    if (!operator || firstOperand === null || waitingForSecondOperand) return;

    const result = calculate(firstOperand, displayValue, operator);
    const fullExpression = `${formatNumber(firstOperand)} ${operator} ${formatNumber(displayValue)} =`;
    setExpression(fullExpression);
    setDisplayValue(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(true);
    setLastButtonWasOperator(false);
  };

  const clearDisplay = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setLastButtonWasOperator(false);
    setExpression('');
  };

  const handleDelete = () => {
    if (displayValue === 'Error' || displayValue === '0' || waitingForSecondOperand) {
      return;
    }
    
    const newValue = displayValue.slice(0, -1);
    setDisplayValue(newValue === '' ? '0' : newValue);
  };

  const handleKeyboardInput = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleNumberInput(e.key);
    } else if (e.key === '.') {
      handleNumberInput('.');
    } else if (e.key === '+' || e.key === '-') {
      handleOperator(e.key);
    } else if (e.key === '*') {
      handleOperator('×');
    } else if (e.key === '/') {
      handleOperator('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
      handleEqual();
    } else if (e.key === 'Escape') {
      clearDisplay();
    } else if (e.key === '%') {
      handleOperator('%');
    } else if (e.key === 'Backspace') {
      handleDelete();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardInput);
    return () => {
      window.removeEventListener('keydown', handleKeyboardInput);
    };
  }, [displayValue, firstOperand, operator, waitingForSecondOperand]);

  const getTooltip = (value, type) => {
    switch (value) {
      case 'AC':
        return 'Clear all (Esc)';
      case 'DEL':
        return 'Delete last digit (Backspace)';
      case '%':
        return 'Convert to percentage';
      case '÷':
        return 'Divide (/)';
      case '×':
        return 'Multiply (*)';
      case '-':
        return 'Subtract (-)';
      case '+':
        return 'Add (+)';
      case '=':
        return 'Calculate result (Enter)';
      case '.':
        return 'Decimal point';
      default:
        return type === 'number' ? `Number ${value}` : value;
    }
  };

  const ThemeToggle = () => (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`
        absolute
        top-2
        right-2
        p-1.5
        rounded-full
        transition-all
        duration-300
        ${isDarkMode 
          ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
          : 'bg-blue-100 text-orange-500 hover:bg-blue-200'
        }
      `}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M12 3v2m0 14v2M3 12h2m14 0h2m-3.636-7.364l-1.414 1.414m-9.9 9.9l-1.414 1.414m11.314-1.414l1.414 1.414m-9.9-9.9l-1.414-1.414" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 109 9c0-.46-.022-.92-.07-1.37A5.84 5.84 0 0112 3z" />
        </svg>
      )}
    </button>
  );

  const SizeToggle = () => (
    <button
      onClick={() => setCalculatorSize(nextSize[calculatorSize])}
      className={`
        absolute
        top-2
        left-2
        p-1.5
        rounded-full
        transition-all
        duration-300
        ${isDarkMode 
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }
      `}
      title={`Switch to ${sizeNames[nextSize[calculatorSize]]} size`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className={sizeConfig[calculatorSize].icons} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-8-8h16" />
      </svg>
    </button>
  );

  const CalculatorButton = ({ value, type = 'number', className = '' }) => (
    <button
      onClick={() => {
        if (type === 'number') handleNumberInput(value);
        else if (type === 'operator') handleOperator(value);
        else if (type === 'equal') handleEqual();
        else if (type === 'clear') clearDisplay();
        else if (type === 'function') handleOperator(value);
      }}
      title={getTooltip(value, type)}
      className={`
        group
        relative
        rounded-full
        font-light
        flex
        items-center
        justify-center
        transition-all
        duration-300
        active:scale-95
        ${sizeConfig[calculatorSize].button}
        ${type === 'operator' 
          ? isDarkMode
            ? 'bg-[#FF9F0A] hover:bg-[#FFB94A] text-white shadow-[0_0_10px_rgba(255,159,10,0.3)]'
            : 'bg-orange-500 hover:bg-orange-400 text-white'
          : type === 'number' 
          ? isDarkMode
            ? 'bg-[#333333] hover:bg-[#737373] text-white shadow-[0_0_10px_rgba(255,159,10,0.1)]'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          : type === 'function'
          ? isDarkMode
            ? 'bg-[#A5A5A5] hover:bg-[#D4D4D2] text-black shadow-[0_0_10px_rgba(255,159,10,0.15)]'
            : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
          : isDarkMode
            ? 'bg-[#FF9F0A] hover:bg-[#FFB94A] text-white shadow-[0_0_10px_rgba(255,159,10,0.3)]'
            : 'bg-orange-500 hover:bg-orange-400 text-white'
        }
        ${className}
      `}
      aria-label={`${value} ${type}`}
    >
      {value}
      <span
        className={`
          absolute 
          pointer-events-none 
          opacity-0 
          group-hover:opacity-100 
          px-4 
          py-2 
          text-sm 
          font-medium 
          transition-all 
          duration-200 
          ease-in-out 
          whitespace-nowrap 
          z-50 
          bottom-full 
          left-1/2 
          -translate-x-1/2 
          -translate-y-2 
          mb-2
          ${isDarkMode 
            ? 'text-white bg-[#1A1F2C] border border-neutral-800/10' 
            : 'text-gray-900 bg-white border border-gray-200/80'
          }
          backdrop-blur-sm 
          rounded-lg 
          shadow-lg
        `}
      >
        {getTooltip(value, type)}
        <span
          className={`
            absolute 
            w-2 
            h-2 
            transform 
            rotate-45 
            bottom-[-4px] 
            left-1/2 
            -translate-x-1/2
            ${isDarkMode ? 'bg-[#1A1F2C]' : 'bg-white'}
          `}
        />
      </span>
    </button>
  );

  const DeleteButton = () => (
    <button
      onClick={handleDelete}
      title={getTooltip('DEL')}
      className={`
        group
        relative
        rounded-full
        text-xl
        font-light
        flex
        items-center
        justify-center
        transition-all
        duration-300
        active:scale-95
        ${sizeConfig[calculatorSize].button}
        ${isDarkMode
          ? 'bg-[#A5A5A5] hover:bg-[#D4D4D2] text-black shadow-[0_0_10px_rgba(255,159,10,0.15)]'
          : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
        }
      `}
      aria-label="Delete last digit"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l-7-7 7-7m8 7H5" />
      </svg>
      <span
        className={`
          absolute 
          pointer-events-none 
          opacity-0 
          group-hover:opacity-100 
          px-4 
          py-2 
          text-sm 
          font-medium 
          transition-all 
          duration-200 
          ease-in-out 
          whitespace-nowrap 
          z-50 
          bottom-full 
          left-1/2 
          -translate-x-1/2 
          -translate-y-2 
          mb-2
          ${isDarkMode 
            ? 'text-white bg-[#1A1F2C] border border-neutral-800/10' 
            : 'text-gray-900 bg-white border border-gray-200/80'
          }
          backdrop-blur-sm 
          rounded-lg 
          shadow-lg
        `}
      >
        {getTooltip('DEL')}
        <span
          className={`
            absolute 
            w-2 
            h-2 
            transform 
            rotate-45 
            bottom-[-4px] 
            left-1/2 
            -translate-x-1/2
            ${isDarkMode ? 'bg-[#1A1F2C]' : 'bg-white'}
          `}
        />
      </span>
    </button>
  );

  const displayValueFormatted = formatNumber(displayValue);

  return (
    <div className={`min-h-screen flex items-center justify-center p-2 transition-colors duration-300 ${
      isDarkMode ? 'bg-black' : 'bg-gray-100'
    }`}>
      <Particles isDarkMode={isDarkMode} />
      <div className={`relative w-full ${sizeConfig[calculatorSize].container} ${
        isDarkMode ? 'bg-black/80' : 'bg-white/80'
      } rounded-3xl shadow-2xl p-3 backdrop-blur-lg ${
        isDarkMode ? 'shadow-[0_0_30px_rgba(255,159,10,0.15)]' : ''
      }`}>
        <ThemeToggle />
        <SizeToggle />
        
        {/* Display */}
        <div className={`${sizeConfig[calculatorSize].display} flex flex-col justify-end px-4 pb-2 space-y-1 ${
          isDarkMode ? 'shadow-[inset_0_-10px_20px_-20px_rgba(255,159,10,0.2)]' : ''
        }`}>
          <div 
            className={`${sizeConfig[calculatorSize].expressionText} font-light tracking-tight truncate text-right min-h-[1.75rem] transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            role="textbox"
            aria-label="Expression Display"
          >
            {expression}
          </div>
          <div 
            className={`${sizeConfig[calculatorSize].displayText} font-light tracking-tight truncate text-right transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            role="textbox"
            aria-label="Calculator Display"
            title="Calculator Display"
          >
            {displayValueFormatted}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className={`grid grid-cols-4 ${sizeConfig[calculatorSize].buttonGrid}`}>
          <CalculatorButton value="AC" type="clear" className={sizeConfig[calculatorSize].button} />
          <DeleteButton />
          <CalculatorButton value="%" type="function" className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value="÷" type="operator" className={sizeConfig[calculatorSize].button} />
          
          <CalculatorButton value={7} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value={8} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value={9} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value="×" type="operator" className={sizeConfig[calculatorSize].button} />
          
          <CalculatorButton value={4} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value={5} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value={6} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value="-" type="operator" className={sizeConfig[calculatorSize].button} />
          
          <CalculatorButton value={1} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value={2} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value={3} className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value="+" type="operator" className={sizeConfig[calculatorSize].button} />
          
          <CalculatorButton value={0} className={`col-span-2 !justify-start pl-7 ${sizeConfig[calculatorSize].button}`} />
          <CalculatorButton value="." className={sizeConfig[calculatorSize].button} />
          <CalculatorButton value="=" type="equal" className={sizeConfig[calculatorSize].button} />
        </div>
      </div>
    </div>
  );
};

export default Calculator; 