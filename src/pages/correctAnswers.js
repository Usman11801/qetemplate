import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaticQuestionPreview from "../components/Results/staticDefaultAnwsers";
import useResultsData from "../hooks/useResultsData";
import { ChevronLeft, House } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import StaticQuestionViewer from "../components/Results/StaticQuestionViewer";
import QuestionNavigation from "../components/Quiz/QuestionNavigation";
import Button from "../components/Button";
// Add responsive styles
const responsiveStyles = `
  /* Base dashboard styles */
  .dashboard-container {
    min-height: 100vh;
    background-color: #f9fafb;
    padding: 1rem;
  }

  @media (min-width: 640px) {
    .dashboard-container {
      padding: 1.5rem;
    }
  }
  
  @media (min-width: 768px) {
    .dashboard-container {
      padding: 2rem;
    }
  }
  
  /* Header responsiveness */
  .dashboard-header {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 639px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .dashboard-header button {
      width: 100%;
      justify-content: center;
    }
  }
  
  /* Metrics grid responsiveness */
  .metrics-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    margin-bottom: 1.5rem;
  }
  
  @media (min-width: 640px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
  }
  
  @media (min-width: 1024px) {
    .metrics-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
  }
  
  /* Chart container responsiveness */
  .chart-container {
    height: 250px;
  }
  
  @media (min-width: 768px) {
    .chart-container {
      height: 300px;
    }
  }
  
  /* Question navigation responsiveness */
  .question-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
 
  @media (max-width: 639px) {
    .question-title {
      font-size: 0.875rem;
    }
  }
  
  /* Component grid responsiveness */
  .component-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 640px) {
    .component-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .component-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (min-width: 1280px) {
    .component-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  /* Question stats responsiveness */
  .question-stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  @media (min-width: 640px) {
    .question-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
  }
`;

// Responsive styles component
const ResponsiveStyles = () => <style>{responsiveStyles}</style>;
const CorrectAnswers = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [respondentData, setRespondentData] = useState(null);

  const { questions, responses } = useResultsData(sessionId.split("-").at(0));

  const sortedQuestions = useMemo(() => {
    if (!questions) return [];
    return [...questions].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [questions]);
  const currentResponse = useMemo(() => {
    if (!responses) return null;
    const response = responses.find(
      (r) => r.respondentId === respondentData?.id
    );
    if (!response) return null;
    return response;
  }, [responses, respondentData?.id]);

  useEffect(() => {
    const handleGetResponseId = async () => {
      const respondentId = sessionStorage.getItem(`respondentId_${sessionId}`);
      const respondentSnap = await getDoc(doc(db, "respondents", respondentId));
      if (respondentSnap.exists()) {
        setRespondentData({ id: respondentId, ...respondentSnap.data() });
      } else {
        throw new Error("Respondent not found");
      }
    };
    handleGetResponseId();
  }, [sessionId]);

  const isQuestionContainInCorrect = useMemo(
    () =>
      Object.values(
        currentResponse?.componentStatus?.[activeQuestionIndex + 1] || {}
      )?.some((val) => val === "incorrect"),
    [activeQuestionIndex, currentResponse?.componentStatus]
  );
  console.log(isQuestionContainInCorrect, "sortedQuestions");
  return (
    <div className="dashboard-container">
      <ResponsiveStyles />
      <div className="h-16 md:h-20 lg:h-[120px] w-full  flex flex-col items-center justify-center rounded-2xl bg-indigo-500 mb-8 sticky top-6 md:top-8 z-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
          Results
        </h1>
      </div>
      <div className="space-y-7 w-full max-w-[992px] mx-auto">
        <div
          className={`${
            isQuestionContainInCorrect ? "bg-red-200/80" : "bg-green-200/80"
          } rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden `}
        >
          <div className="question-navigation bg-indigo-100 px-7 py-5">
            <h3 className="text-xl font-bold">
              Question {activeQuestionIndex + 1}
            </h3>
            <div className="inline-flex items-center gap-2 text-indigo-700 bg-white px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-sm border border-indigo-200">
              <span className="font-medium text-sm sm:text-base">
                Question {activeQuestionIndex + 1}
              </span>
              <span className="text-xs bg-indigo-100 px-1 py-0.5 sm:px-2 sm:py-0.5 rounded-full">
                {sortedQuestions?.[activeQuestionIndex]?.points} pts
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-y-3 p-4 md:py-6 md:px-7">
            <div className="w-full bg-white px-4 py-5 rounded-2xl">
              <h1 className="text-xl font-semibold text-blue-500 mb-10">
                Correct Answers
              </h1>
              <StaticQuestionPreview
                question={sortedQuestions[activeQuestionIndex]}
              />
            </div>
            <div
              className={`w-full max-w-[90%] sm:max-w-[80%] mx-auto bg-[#FBFAFA] px-4 py-5 rounded-2xl bg-[#FBFAFA]`}
            >
              <h1 className="text-xl font-semibold text-blue-500 mb-10">
                User Answers
              </h1>

              <StaticQuestionViewer
                question={sortedQuestions[activeQuestionIndex]}
                response={currentResponse}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <House size={22} />
            <span>Go to Home</span>
          </button>
          <div className="flex items-center gap-2">
            {questions.map((data, index) => {
              return (
                <button
                  key={index}
                  onClick={() => setActiveQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index === activeQuestionIndex
                      ? "ring-2 ring-offset-2 ring-indigo-500 bg-indigo-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectAnswers;
