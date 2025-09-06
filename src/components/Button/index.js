
const Button = ({ title, icon, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center py-3 px-10 rounded-xl text-white text-lg font-bold transition-all ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-lg hover:shadow-xl"
      }`}
    >
      {title}
      {icon && !disabled && (
        <span className="absolute right-2 -mt-12 opacity-0 group-hover:opacity-100 group-hover:mt-0 transition-all duration-300">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
