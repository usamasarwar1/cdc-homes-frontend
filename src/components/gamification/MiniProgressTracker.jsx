import { Progress } from '../ui/Progress';
import { Star, CheckCircle } from 'lucide-react';



const STEP_ORDER = ['address', 'details', 'credentials', 'contact', 'scheduling', 'payment'];

export function MiniProgressTracker({ currentStep, completedSteps, className = '' }) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const completedCount = completedSteps.length;
  const totalSteps = STEP_ORDER.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  console.log("progressPercentage", progressPercentage);
  console.log("totalSteps", totalSteps);
  console.log("currentIndex", currentIndex);
  console.log("completedCount" , completedCount);
  
  
  
  const earnedPoints = completedCount * 15;
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-gray-900">{earnedPoints}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Step {currentIndex + 1} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      {progressPercentage === 100 && (
        <div className="mt-2 text-center">
          <span className="text-xs text-green-600 font-medium">🎉 Assessment Complete!</span>
        </div>
      )}
    </div>
  );
}