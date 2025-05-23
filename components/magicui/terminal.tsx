"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps } from "motion/react";
import React, { forwardRef, useEffect, useRef, useState } from "react";

interface AnimatedSpanProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedSpan = ({
  children,
  delay = 0,
  className,
  ...props
}: AnimatedSpanProps) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: delay / 1000 }}
    className={cn("grid text-sm font-normal tracking-tight", className)}
    {...props}
  >
    {children}
  </motion.div>
);

interface TypingAnimationProps extends MotionProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
}

export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = "span",
  ...props
}: TypingAnimationProps) => {
  if (typeof children !== "string") {
    throw new Error("TypingAnimation: children must be a string. Received:");
  }

  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayedText, setDisplayedText] = useState<string>("");
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [children, duration, started]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn("text-sm font-normal tracking-tight", className)}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
};

interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  infinite?: boolean;
  infiniteDelay?: number;
}
export const Terminal = forwardRef<HTMLPreElement, TerminalProps>(
  (
    {
      children,
      className = "",
      infinite = false,
      infiniteDelay = 7500,
      ...props
    },
    _ref,
  ) => {
    const [key, setKey] = useState(0);

    useEffect(() => {
      if (!infinite) return;

      const interval = setInterval(() => {
        setKey((prevKey) => prevKey + 1);
      }, infiniteDelay);

      return () => clearInterval(interval);
    }, [infinite, infiniteDelay]);

    return (
      <div
        className={`z-0 h-full max-h-[400px] w-full rounded-xl border border-border bg-background sm:max-w-lg ${className}`}
        {...props}
      >
        <div className="flex flex-col gap-y-2 border-b border-border p-4">
          <div className="flex flex-row gap-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        </div>
        <pre className="p-4">
          <code key={key} className="grid gap-y-1">
            {children}
          </code>
        </pre>
      </div>
    );
  },
);

Terminal.displayName = "Terminal";
