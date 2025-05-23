import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CountdownTimerProps {
  endTime?: Date;
  onComplete?: () => void;
  className?: string;
  isStartTime?: boolean;
  label?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  onComplete,
  className,
  isStartTime = false,
  label
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isUrgent, setIsUrgent] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // If no endTime is provided, don't start the timer
    if (!endTime) {
      return;
    }
    
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        // Timer completed
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) onComplete();
        return;
      }
      
      // Check if less than 5 minutes left (only for end times, not start times)
      if (!isStartTime) {
        setIsUrgent(difference < 300000);
      }
      
      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately and then set interval
    calculateTimeLeft();
    const timerId = setInterval(calculateTimeLeft, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(timerId);
  }, [endTime, onComplete, isStartTime]);

  const formatTime = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  const getTimeDisplay = () => {
    // If no endTime, show a placeholder
    if (!endTime) {
      return <span>غير محدد</span>;
    }
    
    return (
      <>
        <span className="ml-1">{timeLeft.days}</span>
        <span className="text-xs mx-1">يوم</span>
        <span>{formatTime(timeLeft.hours)}</span>:
        <span>{formatTime(timeLeft.minutes)}</span>:
        <span>{formatTime(timeLeft.seconds)}</span>
      </>
    );
  };

  // Only show urgent styling for end times, not start times
  const urgentClass = !isStartTime && isUrgent ? "text-red-500 animate-pulse font-bold" : "";
  const startTimeClass = isStartTime ? "text-yellow-500 font-medium" : "";
  const responsiveClass = isMobile ? "text-sm" : "";

  return (
    <div className={`flex items-center ${className} ${urgentClass} ${startTimeClass} ${responsiveClass}`}>
      <Clock className={`h-4 w-4 mr-1 ml-2 ${isUrgent && !isStartTime ? "text-red-500" : ""} ${isStartTime ? "text-yellow-500" : ""}`} />
      {label && <span className="ml-1">{label}</span>}
      <div className="font-mono tabular-nums">{getTimeDisplay()}</div>
    </div>
  );
};

export default CountdownTimer;
