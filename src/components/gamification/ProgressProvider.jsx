import { createContext, useContext, useState, useEffect } from "react";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [currentStep, setCurrentStep] = useState("address");
  const [completedSteps, setCompletedSteps] = useState([]);

  const persistProgress = (step, completed) => {
    localStorage.setItem(
      "assessmentProgress",
      JSON.stringify({
        currentStep: step,
        completedSteps: completed,
      })
    );
  };

  const completeStep = (stepId) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) return prev;

      const updated = [...prev, stepId];
      persistProgress(currentStep, updated);
      return updated;
    });
  };

  const setStep = (stepId) => {
    setCurrentStep(stepId);
    persistProgress(stepId, completedSteps);
  };

  const resetProgress = () => {
    setCurrentStep("address");
    setCompletedSteps([]);
    localStorage.removeItem("assessmentProgress");
  };

  // Load progress from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("assessmentProgress");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setCurrentStep(parsed.currentStep || "address");
      setCompletedSteps(parsed.completedSteps || []);
    } catch (error) {
      console.error("Failed to load progress:", error);
      localStorage.removeItem("assessmentProgress");
    }
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        currentStep,
        completedSteps,
        completeStep,
        setStep,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
