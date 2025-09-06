import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useToast } from "../components/Toast";
import {
  FormattedTextDisplay,
  NumericSliderAnswer,
  DiscreteSliderAnswer,
  ShapeAnswer,
  TrueFalseAnswer,
  SingleChoiceAnswer,
  MultiChoiceAnswer,
  RankingAnswer,
  MatchingPairsAnswer,
} from "../components/Quiz/QuizAnswer";
import {
  Eye,
  ChevronLeft,
  PlusCircle,
  Check,
  ExternalLink,
  ClipboardCopy,
  Share2,
  Edit,
  Target,
} from "lucide-react";
import ShapeCheckbox from "../components/Form/staticComponent/shapeCheckBox";
import MinimalCurvedLineComponent from "../components/Form/staticComponent/curvedLine";
import { getShuffledOrder } from "../components/Quiz/QuizUtils";


/* ------------------------------------------------------------------------
   Default sizes (copied from Quiz.js)
------------------------------------------------------------------------*/
const defaultSizes = {
  text: { width: 256, height: 64 },
  image_upload: { width: 160, height: 160 },
  line: { width: 800, height: 600 },
  multiple_choice_single: { width: 300, height: 150 },
  multiple_choice_multi: { width: 300, height: 150 },
  true_false: { width: 100, height: 50 },
  custom_component: { width: 384, height: 384 },
  short_text_answer: { width: 250, height: 50 },
  single_checkbox: { width: 100, height: 50 },
  toggle_button: { width: 100, height: 40 },
  numeric_slider: { width: 320, height: 160 },
  discrete_slider: { width: 300, height: 50 },
  ranking: { width: 300, height: 150 },
  matching_pairs: { width: 300, height: 200 },
  shape: { width: 100, height: 100 },
};

/* ------------------------------------------------------------------------
   getComponentStyle (copied from Quiz.js)
------------------------------------------------------------------------*/
const getComponentStyle = (comp, defWidth, defHeight, scale = 1) => {
  const width =
    comp.width !== undefined
      ? typeof comp.width === "number"
        ? comp.width * scale + "px"
        : comp.width
      : defWidth * scale + "px";
  const height =
    comp.height !== undefined
      ? typeof comp.height === "number"
        ? comp.height * scale + "px"
        : comp.height
      : defHeight * scale + "px";
  const left =
    comp.position && comp.position.left !== undefined
      ? typeof comp.position.left === "number"
        ? comp.position.left * scale + "px"
        : comp.position.left
      : "0px";
  const top =
    comp.position && comp.position.top !== undefined
      ? typeof comp.position.top === "number"
        ? comp.position.top * scale + "px"
        : comp.position.top
      : "0px";
  return {
    position: "absolute",
    left,
    top,
    width,
    height,
    display: "block",
    transition: "transform 0.3s ease-out",
    transformOrigin: "center center",
    pointerEvents: "none",
  };
};

/* ------------------------------------------------------------------------
   ResizableComponent (copied from Quiz.js, no background set, made static)
------------------------------------------------------------------------*/
const ResizableComponent = ({
  comp,
  defaultWidth,
  defaultHeight,
  children,
  extraStyle = {},
  scale = 1,
}) => {
  return (
    <div
      style={{
        ...getComponentStyle(comp, defaultWidth, defaultHeight, scale),
        ...extraStyle,
      }}
    >
      <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------
   QuizLineComponent (copied from Quiz.js, already static)
------------------------------------------------------------------------*/
function QuizLineComponent({
  x1,
  y1,
  x2,
  y2,
  canvasWidth = 800,
  canvasHeight = 650,
  scale = 1,
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "0px",
        top: "0px",
        width: canvasWidth * scale + "px",
        height: canvasHeight * scale + "px",
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ pointerEvents: "none", background: "transparent" }}
      >
        <line
          x1={x1 * scale}
          y1={y1 * scale}
          x2={x2 * scale}
          y2={y2 * scale}
          stroke="#000"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------------
   StaticRankingComponent (adapted from Quiz.js RankingComponent, made static)
------------------------------------------------------------------------*/
function StaticRankingComponent({ comp, scale = 1 }) {
  const baseHeight = 200;
  const baseFontSize = 14;
  const compHeight = comp.height || baseHeight;
  const computedFontSize =
    Math.min(
      Math.max(baseFontSize * (1 + (compHeight / baseHeight - 1) / 3), 12),
      24
    ) * scale;
  const dynamicPadding = compHeight * 0.05 * scale;

  return (
    <ResizableComponent
      comp={comp}
      defaultWidth={defaultSizes.ranking.width}
      defaultHeight={defaultSizes.ranking.height}
      scale={scale}
    >
      <div
        className="flex flex-col h-full rounded-lg"
        style={{ padding: dynamicPadding }}
      >
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col h-full space-y-2">
            {comp.items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-1 items-center gap-3 p-3 text-left rounded-lg border border-gray-200 bg-white"
                style={{ fontSize: computedFontSize }}
              >
                <span className="w-6 font-medium text-gray-400">
                  {idx + 1}.
                </span>
                <span className="flex-1">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ResizableComponent>
  );
}

/* ------------------------------------------------------------------------
   StaticMatchingPairsComponent (new static version)
------------------------------------------------------------------------*/
function StaticMatchingPairsComponent({ comp, scale = 1 }) {
  const compWidth = (comp.width || defaultSizes.matching_pairs.width) * scale;
  const compHeight =
    (comp.height || defaultSizes.matching_pairs.height) * scale;
  const buttonHeight =
    comp.pairs.length > 0 ? `${90 / comp.pairs.length}%` : "auto";

  return (
    <ResizableComponent
      key={comp.id}
      comp={comp}
      defaultWidth={defaultSizes.matching_pairs.width}
      defaultHeight={defaultSizes.matching_pairs.height}
      scale={scale}
    >
      <div className="flex flex-col h-full w-full">
        <div className="flex justify-between flex-1">
          <div className="w-5/12 flex flex-col justify-between py-4">
            {comp.pairs.map((pair, index) => (
              <div
                key={`left-${index}`}
                className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 bg-white"
                style={{ height: buttonHeight }}
              >
                <span>{pair.left}</span>
              </div>
            ))}
          </div>
          <div className="w-5/12 flex flex-col justify-between py-4">
            {comp.pairs.map((pair, index) => (
              <div
                key={`right-${index}`}
                className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 bg-white"
                style={{ height: buttonHeight }}
              >
                <span>{pair.right}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ResizableComponent>
  );
}

const QuizOverview = () => {

  const { formId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();


  const [formData, setFormData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFormsCount, setUserFormsCount] = useState(0);
  const [canvasScale, setCanvasScale] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [isOwnForm, setIsOwnForm] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setWindowWidth(newWidth);
      setWindowHeight(newHeight);

      let scaleFactor = 1;
      if (newWidth < 640) {
        scaleFactor = Math.min(newWidth / 800, 0.75);
      } else if (newWidth < 1024) {
        scaleFactor = Math.min(newWidth / 800, 0.85);
      } else {
        scaleFactor = Math.min(newWidth / 800, 1);
      }
      scaleFactor = Math.max(scaleFactor, 0.45);
      setCanvasScale(scaleFactor);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true);

        const formDocRef = doc(db, "forms", formId);
        const formSnap = await getDoc(formDocRef);
        if (!formSnap.exists()) throw new Error("Form not found");

        const formDataWithId = { id: formId, ...formSnap.data() };
        setFormData(formDataWithId);

        if (
          auth.currentUser &&
          formDataWithId.userId === auth.currentUser.uid
        ) {
          setIsOwnForm(true);
        }

        const questionsCollRef = collection(formDocRef, "questions");
        const questionsSnap = await getDocs(questionsCollRef);
        const loadedQuestions = questionsSnap.docs
          .map((docSnap) => ({
            id: parseInt(docSnap.id, 10),
            ...docSnap.data(),
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setQuestions(loadedQuestions);

        if (auth.currentUser) {
          const formsRef = collection(db, "forms");
          const q = query(
            formsRef,
            where("userId", "==", auth.currentUser.uid)
          );
          const userFormsSnap = await getDocs(q);
          setUserFormsCount(userFormsSnap.size);
        }
      } catch (error) {
        console.error("Error loading quiz overview:", error);
        addToast("Failed to load quiz overview", "error");
      } finally {
        setLoading(false);
      }
    };
    loadQuizData();
  }, [formId, addToast]);

  const handleAddToMyForms = async (e) => {
    e.preventDefault(); // Prevent any default behavior
    if (!auth.currentUser) {
      navigate("/login", { replace: true });
      addToast("Please sign in to add this quiz", "error");
      return;
    }

    if (userFormsCount >= 3) {
      addToast("Maximum of 3 forms reached!", "warning");
      return;
    }

    const userId = auth.currentUser.uid;
    const newFormId = Date.now().toString();

    try {
      const newFormData = { ...formData, userId, createdAt: new Date() };
      delete newFormData.id;

      await setDoc(doc(db, "forms", newFormId), newFormData);

      for (const question of questions) {
        await setDoc(
          doc(db, "forms", newFormId, "questions", question.id.toString()),
          { ...question }
        );
      }

      addToast("Quiz added to your forms successfully", "success");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error adding quiz to forms:", error);
      addToast("Failed to add quiz to your forms", "error");
    }
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    const link = window.location.href;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        addToast("Link copied to clipboard", "success");
        setShareMenuOpen(false);
      })
      .catch(() => {
        addToast("Failed to copy link", "error");
      });
  };

  const handleNavigateBack = (e) => {
    e.preventDefault();
    navigate("/", { replace: true });
  };

  const handleEditForm = (e) => {
    e.preventDefault();
    navigate(`/forms/${formId}`, { replace: true });
  };
  const getDefaultAnswer = (comp) => {
    switch (comp.type) {
      case "multiple_choice_single":
        return comp.correctIndex ?? 0;
      case "multiple_choice_multi":
        return comp.correctAnswers ?? [];
      case "true_false":
        return comp.value ?? false;
      case "toggle_button":
        return comp.toggled ?? 0;
      case "single_checkbox":
        return comp.correctValue ?? 0;
      case "numeric_slider":
        return comp.currentValue ?? 0;
      case "discrete_slider":
        return comp.selectedIndex;
      case "ranking":
        return comp.items?.map((_, i) => i) || [];
      case "matching_pairs": {
        const leftItems = [...new Set(comp.pairs.map((pair) => pair.left))];
        const rightItems = [...new Set(comp.pairs.map((pair) => pair.right))];

        return comp.pairs.map((pair) => ({
          left: leftItems.indexOf(pair.left),
          right: rightItems.indexOf(pair.right),
        }));
      }
      case "short_text_answer":
        console.log(comp, "short_text_answer");
        return comp.correctAnswer || "";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-600">
          Loading quiz...
        </p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz not found
          </h2>
          <p className="text-gray-600 mb-6">
            The quiz you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleNavigateBack}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50 md:static md:mb-4 md:mt-6 md:ml-6">
        <button
          onClick={handleNavigateBack}
          className="flex items-center gap-1 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 md:px-4 md:py-2"
        >
          <ChevronLeft className="h-5 w-5 text-blue-600" />
          <span className="hidden md:inline text-blue-600 font-medium">
            Back to Forms
          </span>
        </button>
      </div>

      {/* Share Menu */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShareMenuOpen(!shareMenuOpen)}
            className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all duration-300"
          >
            <Share2 className="h-6 w-6" />
          </button>
          {shareMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 w-48 animate-fadeIn">
              <div className="text-sm font-medium text-gray-500 mb-2 pb-2 border-b">
                Share this form
              </div>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm text-left transition-colors"
              >
                <ClipboardCopy className="h-4 w-4" />
                <span>Copy link</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `mailto:?subject=${encodeURIComponent(
                      `Check out this form: ${formData.formTitle || "Untitled Form"
                      }`
                    )}&body=${encodeURIComponent(
                      `Take a look at this form: ${window.location.href}`
                    )}`
                  );
                  setShareMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm text-left transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Email</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex justify-center">
        <div className="w-[800px]">
          {/* HEADER */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sm:mb-8">
            {formData.formImage && (
              <div className="w-full sm:h-48 md:h-64 lg:h-80 overflow-hidden relative">
                <img
                  src={formData.formImage}
                  alt="Form header"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-sm">
                    {formData.formTitle || "Untitled Form"}
                  </h1>
                  {formData.formDescription && (
                    <p className="text-white/90 text-sm sm:text-base lg:text-lg max-w-3xl drop-shadow-sm">
                      {formData.formDescription}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="p-4 sm:p-6">
              {!formData.formImage && (
                <div className="mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {formData.formTitle || "Untitled Form"}
                  </h1>
                  {formData.formDescription && (
                    <p className="text-gray-600 text-sm sm:text-base max-w-3xl">
                      {formData.formDescription}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>Preview Mode</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {questions.length} Question
                    {questions.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {!isOwnForm && (
                  <button
                    onClick={handleAddToMyForms}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add to My Forms</span>
                  </button>
                )}
                {isOwnForm && (
                  <button
                    onClick={handleEditForm}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Form</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="space-y-6 sm:space-y-8">
            {questions.map((question, idx) => (
              <div
                key={question.id}
                className="relative bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full mb-2">
                        Question {idx + 1}
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {question.title || `Question ${idx + 1}`}
                      </h2>
                    </div>
                    <div className="text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {question.points} pts • {question.maxAttempts} attempts
                    </div>
                  </div>
                </div>
                <div
                  className="relative overflow-hidden bg-gray-50"
                  style={{
                    height: `${600 * canvasScale}px`,
                    backgroundColor: question.backgroundColor || "#ffffff",
                  }}
                >
                  <div className="absolute inset-0">
                    {question.components?.map((comp) => {
                        const answer = getDefaultAnswer(comp);
                      // TEXT
                      if (comp.type === "text") {
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.text.width}
                            defaultHeight={defaultSizes.text.height}
                          // scale={canvasScale}
                          >
                            <div
                              className="w-full h-full  p-1 rounded-lg shadow-lg border-2 border-[#ccc] bg-white"
                              style={{
                                fontFamily:
                                  comp.text?.format?.font || "Inter, sans-serif",

                              }}
                            >
                              <FormattedTextDisplay text={comp.text} compValues={comp} />
                            </div>
                          </ResizableComponent>
                        );
                      }

                      // IMAGE UPLOAD
                      if (comp.type === "image_upload") {
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.image_upload.width}
                            defaultHeight={defaultSizes.image_upload.height}
                            extraStyle={{
                              overflow: "hidden",
                              borderRadius: "8px",
                            }}
                            scale={canvasScale}
                          >
                            {comp.image ? (
                              <img
                                src={comp.image}
                                alt="Question"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 rounded">
                                No Image
                              </div>
                            )}
                          </ResizableComponent>
                        );
                      }

                      // LINE
                      if (comp.type === "line") {
                        return (
                          <MinimalCurvedLineComponent key={comp.id} {...comp} />
                        );
                      }

                      // MULTIPLE CHOICE SINGLE
                      if (comp.type === "multiple_choice_single") {
                        console.log(comp, "multipleChoiceComeInLineOverView");
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={
                              defaultSizes.multiple_choice_single.width
                            }
                            defaultHeight={
                              defaultSizes.multiple_choice_single.height
                            }
                            scale={canvasScale}
                            extraStyle={{ height: comp.height - 52 + (comp.optionBorderWidth * 2) }}
                          >
                            {/* <div className="flex flex-col h-full">
                              <div className="flex-1 overflow-auto">
                                <div className="flex flex-col h-full space-y-2">
                                  {comp.options.map((option, idx) => (
                                    <div
                                      key={idx}
                                      className="flex flex-1 items-center gap-3 p-3 text-left rounded-lg border border-gray-200 bg-white"
                                      style={{
                                        fontSize:
                                          Math.min(
                                            Math.max(
                                              14 *
                                              (1 +
                                                ((comp.height || 200) / 200 -
                                                  1) /
                                                3),
                                              12
                                            ),
                                            24
                                          ) * canvasScale,
                                      }}
                                    >
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div> */}


                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col"
                              style={{ backgroundColor: comp.backgroundColor || "#ffffff", borderColor: comp.optionBorderColor || "#e5e7eb", borderWidth: comp.optionBorderWidth || 1, }}

                            >
                              {/* <div className="p-3 border-b border-gray-100 bg-gray-50">
                                                    <span className="text-xs font-medium text-gray-500">
                                                      Select one option
                                                    </span>
                                                  </div> */}
                              <div className="flex-1 overflow-auto p-2">
                                <SingleChoiceAnswer
                                  // value={comp.correctAnswer}
                                  // onChange={(newVal) =>
                                  //   updateAnswer(question.id, comp.id, newVal)
                                  // }
                                   value={answer}
                                  compValues={comp}
                                  options={comp.options || []}
                                />
                              </div>
                            </div>
                          </ResizableComponent>
                        );
                      }

                      // MULTIPLE CHOICE MULTI
                      if (comp.type === "multiple_choice_multi") {
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={
                              defaultSizes.multiple_choice_multi.width
                            }
                            defaultHeight={
                              defaultSizes.multiple_choice_multi.height
                            }
                            scale={canvasScale}
                            extraStyle={{ height: comp.height - 52 + (comp.optionBorderWidth * 2) }}
                          >
                            {/* <div className="flex flex-col h-full">
                              <div className="flex-1 overflow-auto">
                                <div className="flex flex-col h-full space-y-2">
                                  {comp.options.map((option, idx) => (
                                    <div
                                      key={idx}
                                      className="flex flex-1 items-center gap-3 p-3 text-left rounded-lg border border-gray-200 bg-white"
                                      style={{
                                        fontSize:
                                          Math.min(
                                            Math.max(
                                              14 *
                                              (1 +
                                                ((comp.height || 200) / 200 -
                                                  1) /
                                                3),
                                              12
                                            ),
                                            24
                                          ) * canvasScale,
                                      }}
                                    >
                                      <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div> */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col"
                              style={{ backgroundColor: comp.backgroundColor || "#ffffff", borderColor: comp.optionBorderColor || "#e5e7eb", borderWidth: comp.optionBorderWidth || 1, }}>
                              {/* <div className="p-3 border-b border-gray-100 bg-gray-50">
                                                    <span className="text-xs font-medium text-gray-500">
                                                      Select multiple options
                                                    </span>
                                                  </div> */}
                              <div className="flex-1 overflow-auto p-2">
                                <MultiChoiceAnswer
                                  // value={val}
                                  // onChange={(newVal) =>
                                  //   updateAnswer(question.id, comp.id, newVal)
                                  // }
                                     value={answer}
                                  compValues={comp}
                                  options={comp.options || []}
                                />
                              </div>
                            </div>
                          </ResizableComponent>
                        );
                      }

                      // TRUE/FALSE
                      if (comp.type === "true_false") {
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={comp.width}
                            defaultHeight={comp.height}
                          >
                            <div
                              className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-sm p-2"
                              style={{ minWidth: comp.width, minHeight: comp.height, borderRadius: comp.borderRadius || "0.5rem", borderColor: comp.borderColor || "#e5e7eb", backgroundColor: comp.backgroundColor || "#f9fafb" }}
                            >
                              <TrueFalseAnswer
                                value={false}
                                compValues={comp}
                                isDisabled={true}
                              />
                            </div>
                          </ResizableComponent>
                        );
                      }

                      // SHORT TEXT
                      // if (comp.type === "short_text_answer") {
                      //   console.log(comp, "shortTextComeInLineOverView");
                      //   return (
                      //     <ResizableComponent
                      //       key={comp.id}
                      //       comp={comp}
                      //       defaultWidth={comp.width}
                      //       defaultHeight={
                      //         comp.height
                      //       }
                      //       scale={canvasScale}
                      //     >
                      //       <div className="bg-white rounded-md border border-gray-200 p-2">
                      //         <label className="block text-xs font-medium text-gray-700 mb-1">
                      //           Short Text Answer:
                      //         </label>
                      //         <input
                      //           type="text"
                      //           value={comp.correctAnswer}
                      //           placeholder="Type your answer..."
                      //           disabled
                      //           className=" p-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"

                      //           style={{
                      //             fontSize: `${comp.fontSize}px`,
                      //             width: `${comp.width}px`,
                      //             height: `${comp.height}px`,
                      //             boxSizing: "border-box",
                      //             lineHeight: "1.2",
                      //             outline: "none",
                      //             overflow: "hidden",
                      //             whiteSpace: "pre-wrap",
                      //             wordBreak: "break-word",
                      //           }}
                      //         />
                      //       </div>
                      //     </ResizableComponent>
                      //   );
                      // }
                      if (comp.type === "short_text_answer") {
                        const textDecoration = [
                          comp?.fontStyles.underline ? "underline" : "",
                          comp?.fontStyles.lineThrough ? "line-through" : "",
                        ]
                        console.log(comp, "shortTextComeInLineOverView");
                        const val = comp?.correctAnswer || "";
                        const count = val.length;
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={comp.width}
                            defaultHeight={comp.height}
                            scale={canvasScale}
                          >
                            {/* outer box: width/height from comp, plus your styling */}
                            <div
                              className="bg-white rounded-md border border-gray-200 relative"
                              style={{
                                width: `${comp.width}px`,
                                height: `${comp.height}px`,
                                padding: "5px",             // match your p-2
                                boxSizing: "border-box",
                                overflow: "hidden",
                                border: "2px solid #ccc"
                              }}
                            >

                              {/* <label
                                className="block text-xs font-medium text-gray-700 mb-1"
                              >
                                Short Text Answer:
                              </label> */}

                              {/* use a readonly textarea for proper wrapping & height control */}
                              <textarea
                                readOnly
                                value={comp.correctAnswer}
                                className="w-full h-full resize-none border-none bg-gray-100 text-gray-700 cursor-not-allowed"
                                maxLength={200}
                                placeholder="Type your answer..."
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  boxSizing: "border-box",
                                  fontSize: `${!val ? 14 : comp.fontSize}px`,
                                  lineHeight: comp.lineSpacing || 1.5,
                                  letterSpacing: comp.letterSpacing || 0,
                                  fontFamily: comp.fontFamily || "Inter, sans-serif",
                                  textAlign: comp.textAlign || "left",
                                  fontStyle: comp.fontStyles.italic ? "italic" : "normal",
                                  fontWeight: comp.fontStyles.bold ? "bold" : "normal",
                                  color: comp.fontColor || "#374151",
                                  outline: "none",
                                  overflow: "auto",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  backgroundColor: "#f9fafb",
                                  borderRadius: "0.5rem",
                                  padding: 3,
                                  textDecoration: textDecoration.join(" "),
                                }}
                              />
                              {/* character counter */}
                              <div
                                className="absolute bottom-1 right-4  text-xs text-gray-500 pointer-events-none select-none"
                                style={{ fontSize: 10 }}
                              >
                                {count}/200
                              </div>
                            </div>
                          </ResizableComponent>
                        );
                      }


                      // SINGLE CHECKBOX
                      if (comp.type === "single_checkbox") {
                        console.log(comp, "checkComeInLineOverView");

                        //               const userVal = answers[question.id]?.[comp.id];
                        // const checked = userVal === undefined ? false : userVal;
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.single_checkbox.width}
                            defaultHeight={defaultSizes.single_checkbox.height}
                            scale={canvasScale}
                          >
                            <ShapeCheckbox
                              id={comp.id}
                              checked={comp?.correctValue}
                              width={comp.width}
                              height={comp.height}
                              borderColor={comp.borderColor}
                              borderRadius={comp.borderRadius}
                              backgroundColor={comp.backgroundColor}
                              shapeType={comp.shapeType}
                              shapeTypeColor={comp.shapeTypeColor}
                            />
                            {/* <div className="flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center bg-white cursor-not-allowed">
                                <div className="w-3 h-3 bg-transparent"></div>
                              </div>
                            </div> */}
                          </ResizableComponent>
                        );
                      }

                      // TOGGLE BUTTON
                      if (comp.type === "toggle_button") {
                        const userVal = comp?.toggled;
                        const toggled = userVal === undefined ? false : userVal;
                        const opacity = comp.opacity ?? 1;
                        console.log("toggle button", comp,)

                        // Helper function to build Bézier path from saved shape data
                        const buildBezierPath = (anchors, handles) => {
                          const N = anchors?.length || 0;
                          if (N === 0 || handles?.length !== N) return "";
                          let d = `M ${anchors[0].x},${anchors[0].y} `;
                          for (let i = 0; i < N; i++) {
                            const curr = anchors[i];
                            const next = anchors[(i + 1) % N];
                            const currentHandle = handles[i];
                            const nextHandle = handles[(i + 1) % N];

                            if (!currentHandle || !nextHandle) continue;

                            const { right: rOff } = currentHandle;
                            const { left: lOff } = nextHandle;
                            d += `C ${curr.x + rOff.x},${curr.y + rOff.y} ` +
                              `${next.x + lOff.x},${next.y + lOff.y} ` +
                              `${next.x},${next.y} `;
                          }
                          return d + "Z";
                        };
                        // Calculate text center based on anchor positions
                        const calculateTextCenter = (anchors, width, height) => {
                          if (!anchors || anchors.length === 0) {
                            return { x: width / 2, y: height / 2 };
                          }

                          const sumX = anchors.reduce((sum, anchor) => sum + anchor.x, 0);
                          const sumY = anchors.reduce((sum, anchor) => sum + anchor.y, 0);

                          return {
                            x: sumX / anchors.length,
                            y: sumY / anchors.length
                          };
                        };

                        // Calculate bounds of anchors and handles for proper viewBox
                        const calculateContentBounds = (anchors, handles) => {
                          if (!anchors || anchors.length === 0) return null;

                          let minX = anchors[0].x;
                          let minY = anchors[0].y;
                          let maxX = anchors[0].x;
                          let maxY = anchors[0].y;

                          // Include handle positions in bounds calculation
                          anchors.forEach((anchor, i) => {
                            const handle = handles[i];
                            if (handle) {
                              // Check anchor position
                              minX = Math.min(minX, anchor.x);
                              minY = Math.min(minY, anchor.y);
                              maxX = Math.max(maxX, anchor.x);
                              maxY = Math.max(maxY, anchor.y);

                              // Check handle positions
                              if (handle.left) {
                                minX = Math.min(minX, anchor.x + handle.left.x);
                                minY = Math.min(minY, anchor.y + handle.left.y);
                                maxX = Math.max(maxX, anchor.x + handle.left.x);
                                maxY = Math.max(maxY, anchor.y + handle.left.y);
                              }
                              if (handle.right) {
                                minX = Math.min(minX, anchor.x + handle.right.x);
                                minY = Math.min(minY, anchor.y + handle.right.y);
                                maxX = Math.max(maxX, anchor.x + handle.right.x);
                                maxY = Math.max(maxY, anchor.y + handle.right.y);
                              }
                            }
                          });

                          return { minX, minY, maxX, maxY };
                        };
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.toggle_button.width}
                            defaultHeight={defaultSizes.toggle_button.height}
                            scale={canvasScale}
                          >
                            {/* <div className="bg-white border-2 border-gray-300 rounded flex items-center justify-center h-full w-full cursor-not-allowed">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-300" />
                                <span className="text-gray-600 text-xs">
                                  Click to Toggle
                                </span>
                              </div>
                            </div> */}

                            {/* // Render custom SVG shape */}
                            <div
                              className="w-full h-full relative cursor-pointer"
                            // onClick={() => updateAnswer(question.id, comp.id, !toggled)}
                            // style={{ opacity }}
                            >
                              {(() => {
                                // Calculate proper viewBox dimensions based on content
                                const bounds = calculateContentBounds(comp.anchors, comp.handles);
                                const padding = 15;

                                let viewBoxWidth, viewBoxHeight, viewBoxX = 0, viewBoxY = 0;

                                if (bounds) {
                                  // Use actual content bounds with padding
                                  viewBoxWidth = Math.max(bounds.maxX - bounds.minX + padding * 2, 50);
                                  viewBoxHeight = Math.max(bounds.maxY - bounds.minY + padding * 2, 30);
                                  viewBoxX = bounds.minX - padding;
                                  viewBoxY = bounds.minY - padding;
                                } else {
                                  // Fallback to component dimensions
                                  viewBoxWidth = comp.width || 100;
                                  viewBoxHeight = comp.height || 40;
                                }

                                const textCenter = calculateTextCenter(
                                  comp.anchors,
                                  viewBoxWidth,
                                  viewBoxHeight
                                );

                                return (
                                  <svg
                                    width="100%"
                                    height="100%"
                                    viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                                    preserveAspectRatio="none"
                                  >
                                    <path
                                      d={buildBezierPath(comp.anchors, comp.handles)}
                                      fill={toggled ? comp.backgroundColor || "#ffffff" : "transparent"}
                                      stroke={comp.borderColor || "#000000"}
                                      strokeWidth={comp.borderWidth || 2}
                                      fillOpacity={opacity}
                                    // strokeOpacity={opacity}
                                    />
                                    <text
                                      x={textCenter.x}
                                      y={textCenter.y}
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      fill={toggled ? "#2563eb" : "#6b7280"}
                                      fontSize="14"
                                      fontFamily="Arial, sans-serif"
                                      fontWeight="bold"
                                      style={{ pointerEvents: "none", userSelect: "none" }}
                                    >
                                      {toggled ? "ON" : "OFF"}
                                    </text>
                                  </svg>
                                );
                              })()}
                            </div>
                          </ResizableComponent>
                        );
                      }

                      // NUMERIC SLIDER
                      if (comp.type === "numeric_slider") {

                        const boxHeight = comp.height
                        console.log("numeric slider comp", comp);
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.numeric_slider.width}
                            defaultHeight={defaultSizes.numeric_slider.height}
                            scale={canvasScale}
                            extraStyle={{ height: boxHeight }}
                          >
                            <NumericSliderAnswer
                              value={comp.currentValue ?? comp.minValue}
                              minValue={comp.minValue}
                              maxValue={comp.maxValue}
                              targetValue={comp.targetValue}
                              mode={"target"}
                              className="w-full cursor-not-allowed"
                              style={{ width: "100%", height: boxHeight, backgroundColor: comp.optionBackgroundColor || "#f9fafb", borderRadius: comp.optionBorderRadius }}
                              compValues={comp}
                            />
                          </ResizableComponent>
                        );
                      }

                      // DISCRETE SLIDER
                      if (comp.type === "discrete_slider") {
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.discrete_slider.width}
                            defaultHeight={defaultSizes.discrete_slider.height}
                            scale={canvasScale}
                          >
                            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4" style={{ backgroundColor: comp.optionBackgroundColor || "#f9fafb", borderRadius: comp.optionBorderRadius }}>

                              <DiscreteSliderAnswer
                                value={comp.selectedIndex ?? 0}
                                options={comp.options}
                                className="cursor-not-allowed"
                                style={{ pointerEvents: "none" }}
                                 compValues={comp}
                              />
                            </div>
                          </ResizableComponent>
                        );
                      }

                      // RANKING
                      if (comp.type === "ranking") {
                        console.log("ranking comp", comp);
                        const currentOrder =
                          comp?.correctOrder 
                          // || getShuffledOrder(comp.items.length);
                        return (
                          // <StaticRankingComponent
                          //   key={comp.id}
                          //   comp={comp}
                          //   scale={canvasScale}
                          // />


                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.ranking.width}
                            defaultHeight={defaultSizes.ranking.height}
                            extraStyle={{ height: comp.height - 52 + (comp.optionBorderWidth * 2) }}
                          >
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col"
                              style={{ backgroundColor: comp.backgroundColor || "#ffffff", borderColor: comp.optionBorderColor || "#e5e7eb", borderWidth: comp.optionBorderWidth || 1, }}>
                              <div className="flex-1 overflow-auto p-2">

                                <RankingAnswer
                                  items={comp.items || []}
                                  currentOrder={currentOrder}
                                  componentValue={comp}
                                // onChange={(newOrder) =>
                                //   updateAnswer(question.id, comp.id, newOrder)
                                // }
                                />
                              </div>

                            </div>
                          </ResizableComponent>


                        );
                      }

                      // MATCHING PAIRS
                      if (comp.type === "matching_pairs") {
                        const currentMatches = comp.pairs ? comp.pairs.map((pair, index) => ({
                          left: index,
                          right: index
                        })) : [];
                        console.log("matching pairs comp", currentMatches);
                        const compWidth =
                          comp.width || defaultSizes.matching_pairs.width;
                        const compHeight =
                          comp.height || defaultSizes.matching_pairs.height;
                        return (
                          // <StaticMatchingPairsComponent
                          //   key={comp.id}
                          //   comp={comp}
                          //   scale={canvasScale}
                          // />


                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={compWidth}
                            defaultHeight={compHeight}

                          >

                            <MatchingPairsAnswer
                              pairs={comp.pairs}
                              value={currentMatches}
                              previewMode={true}
                              containerWidth={compWidth}
                              containerHeight={compHeight}
                              fontSizeValue
                              optionClassName="bg-white  hover:bg-indigo-50 border-2 hover:border-indigo-300 transition-colors "
                              compValues={comp}
                            />

                          </ResizableComponent>


                        );
                      }

                      // SHAPE
                      if (comp.type === "shape") {
                        return (
                          <ResizableComponent
                            key={comp.id}
                            comp={comp}
                            defaultWidth={defaultSizes.shape.width}
                            defaultHeight={defaultSizes.shape.height}
                            scale={canvasScale}
                          >
                            <ShapeAnswer
                              shapeType={comp.shapeType}
                              backgroundColor={comp.backgroundColor}
                              borderRadius={comp.borderRadius}
                              opacity={comp.opacity}
                              rotation={comp.rotation}
                              borderWidth={comp.borderWidth}
                              borderColor={comp.borderColor}
                              borderStyle={comp.borderStyle}
                              className="w-full h-full"
                            />
                          </ResizableComponent>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Button */}
          {!isOwnForm && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
              <button
                onClick={handleAddToMyForms}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add to My Forms</span>
                <Check className="h-5 w-5 ml-1" />
              </button>
            </div>
          )}

          {/* Responsive Indicator */}
          {false && (
            <div className="fixed bottom-4 left-4 bg-black text-white text-xs px-2 py-1 rounded">
              <div className="block sm:hidden">XS: {windowWidth}px</div>
              <div className="hidden sm:block md:hidden">
                SM: {windowWidth}px
              </div>
              <div className="hidden md:block lg:hidden">
                MD: {windowWidth}px
              </div>
              <div className="hidden lg:block xl:hidden">
                LG: {windowWidth}px
              </div>
              <div className="hidden xl:block">XL: {windowWidth}px</div>
              <div>Scale: {canvasScale.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .question-component input,
          .question-component button,
          .question-component select {
            font-size: 16px !important;
          }
          .question-component label,
          .question-component span {
            font-size: 14px !important;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default QuizOverview;
