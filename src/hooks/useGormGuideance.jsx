import { useState, useEffect, useCallback } from 'react';
// Removed toast import - using visual highlighting only


export function useFormGuidance({ sections, inactivityTimeout = 3000 }) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [activeSection, setActiveSection] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [currentHint, setCurrentHint] = useState('');

  const resetActivityTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowGuidance(false);
    document.querySelectorAll('.guidance-highlight').forEach(el => {
      el.classList.remove('guidance-highlight');
    });
  }, []);

  const getNextIncompleteSection = useCallback(() => {
    return sections.find(section => section.isRequired && !section.isComplete);
  }, [sections]);

  const highlightElement = useCallback((element) => {
    document.querySelectorAll('.guidance-highlight').forEach(el => {
      el.classList.remove('guidance-highlight');
    });

    element.classList.add('guidance-highlight');
    
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });

    setTimeout(() => {
      element.classList.remove('guidance-highlight');
    }, 10000);
  }, []);

  const showNextSectionGuidance = useCallback(() => {
    const nextSection = getNextIncompleteSection();
    
    if (!nextSection) return;

    setCurrentHint(nextSection.hint);
    setActiveSection(nextSection.id);
    setShowGuidance(true);

    if (nextSection.element) {
      highlightElement(nextSection.element);
    } else {
      const element = document.querySelector(`[data-section="${nextSection.id}"]`) ||
                    document.querySelector(`#${nextSection.id}`) ||
                    document.querySelector(`[data-testid*="${nextSection.id}"]`);
      
      if (element) {
        highlightElement(element);
      }
    }

  }, [getNextIncompleteSection, highlightElement]);

  useEffect(() => {
    const handleActivity = () => resetActivityTimer();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetActivityTimer]);

  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity >= inactivityTimeout && !showGuidance) {
        const nextSection = getNextIncompleteSection();
        if (nextSection) {
          showNextSectionGuidance();
        }
      }
    }, 1000);

    return () => clearInterval(checkInactivity);
  }, [lastActivity, inactivityTimeout, showGuidance, getNextIncompleteSection, showNextSectionGuidance]);

  return {
    activeSection,
    showGuidance,
    currentHint,
    resetActivityTimer,
    setActiveSection,
    dismissGuidance: () => setShowGuidance(false),
  };
}