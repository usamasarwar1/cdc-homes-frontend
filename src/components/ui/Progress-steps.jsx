import { Check, Circle, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/Cn';



export function ProgressSteps({ steps, className }) {
  return (
    <nav aria-label="Progress" className={cn("mb-4 md:mb-8", className)}>
      <ol className="flex items-start justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn(
            "relative flex-1",
            stepIdx !== steps.length - 1 && "pr-1 sm:pr-4 lg:pr-8 xl:pr-12"
          )}>
            {stepIdx !== steps.length - 1 && (
              <div className="absolute top-4 left-1/2 right-0 h-0.5 bg-gray-200 z-0 transform translate-x-4">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    step.completed ? "bg-green-500" : "bg-gray-200"
                  )} 
                />
              </div>
            )}
            
            <div className="group relative flex flex-col items-center">
              <div className="flex items-center justify-center">
                <span className={cn(
                  "flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full border-2 text-xs md:text-sm font-medium transition-all duration-200 relative z-10",
                  step.completed 
                    ? "bg-green-500 border-green-500 text-white" 
                    : step.current
                    ? "bg-blue-500 border-blue-500 text-white animate-pulse"
                    : "bg-white border-gray-300 text-gray-500"
                )}>
                  {step.completed ? (
                    <Check className="h-3 w-3 md:h-4 md:w-4" />
                  ) : (
                    <Circle className={cn(
                      "h-2 w-2 md:h-3 md:w-3",
                      step.current && "fill-current"
                    )} />
                  )}
                </span>
              </div>
              
              <div className="mt-1 md:mt-2 text-center w-full flex flex-col items-center">
                <p className={cn(
                  "text-xs md:text-sm font-medium transition-colors leading-tight text-center px-1",
                  step.completed 
                    ? "text-green-600" 
                    : step.current
                    ? "text-blue-600"
                    : "text-gray-500"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 md:mt-1 leading-tight text-center max-w-16 md:max-w-24 px-1">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}




export function GuidanceCard({ 
  title, 
  description, 
  nextAction, 
  children, 
  variant = 'default' 
}) {
  const variants = {
    default: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
    info: "border-indigo-200 bg-indigo-50 text-indigo-800"
  };

  return (
    <div className={cn("p-3 md:p-4 rounded-lg border-l-4 mb-4 md:mb-6", variants[variant])}>
      <div className="flex items-start">
        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 mt-0.5 mr-2 md:mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-xs md:text-sm mb-1">{title}</h3>
          <p className="text-xs md:text-sm mb-2 opacity-90">{description}</p>
          <p className="text-xs md:text-sm font-medium flex items-center gap-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/50 text-xs">
              Next: {nextAction}
            </span>
          </p>
          {children && <div className="mt-2 md:mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}