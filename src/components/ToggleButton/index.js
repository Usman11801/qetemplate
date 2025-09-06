const ToggleButton = ({ isVisible = true, setIsVisible }) => {
  //   const [] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={toggleVisibility}
        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isVisible ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            isVisible ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">
        {isVisible ? "Hide" : "Show"}
      </span>
    </div>
  );
};

export default ToggleButton;
