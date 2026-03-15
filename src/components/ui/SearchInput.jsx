import { useEffect, useRef, useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

export default function SearchInput({ value = '', onChange, placeholder = 'Rechercher...' }) {
  const [internal, setInternal] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 300);
  };

  const handleClear = () => {
    setInternal('');
    clearTimeout(timerRef.current);
    onChange('');
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <HiOutlineMagnifyingGlass className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
      />
      {internal && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
          aria-label="Effacer"
        >
          <HiOutlineXMark className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
