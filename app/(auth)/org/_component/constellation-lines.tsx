"use client";

import { useEffect, useRef, useState } from "react";
import type { UserStar } from "@/app/(auth)/org/internal";
import type { JSX } from "react/jsx-runtime";

interface ConstellationLinesProps {
  stars: UserStar[];
}

export function ConstellationLines({ stars }: ConstellationLinesProps) {
  const [lines, setLines] = useState<JSX.Element[]>([]);
  const requestRef = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (stars.length === 0) return;

    // Group stars by planet
    const planetGroups: Record<string, UserStar[]> = {};
    stars.forEach((star) => {
      if (!star.planetId) return;
      if (!planetGroups[star.planetId]) {
        planetGroups[star.planetId] = [];
      }
      planetGroups[star.planetId].push(star);
    });

    const updateLines = () => {
      const newLines: JSX.Element[] = [];

      // Get the SVG's position for coordinate adjustment
      if (!svgRef.current) {
        requestRef.current = requestAnimationFrame(updateLines);
        return;
      }

      const svgRect = svgRef.current.getBoundingClientRect();

      // For each planet group, find the DOM elements of its stars
      Object.entries(planetGroups).forEach(
        ([planetId, planetStars], planetIndex) => {
          if (!planetId) return null;

          // Skip if there are less than 2 stars
          if (planetStars.length < 2) return;

          // Get star elements by their data-star-id attribute
          const starElements: Element[] = [];
          planetStars.forEach((star) => {
            const element = document.querySelector(
              `[data-star-id="${star.docId}"]`,
            );
            if (element) starElements.push(element);
          });

          // Skip if we couldn't find all star elements
          if (starElements.length < 2) return;

          // Connect stars in a circle
          for (let i = 0; i < starElements.length; i++) {
            const current = starElements[i];
            const next = starElements[(i + 1) % starElements.length];

            const currentRect = current.getBoundingClientRect();
            const nextRect = next.getBoundingClientRect();

            // Calculate center points relative to the SVG
            const x1 = currentRect.left + currentRect.width / 2 - svgRect.left;
            const y1 = currentRect.top + currentRect.height / 2 - svgRect.top;
            const x2 = nextRect.left + nextRect.width / 2 - svgRect.left;
            const y2 = nextRect.top + nextRect.height / 2 - svgRect.top;

            // Calculate distance
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only connect if they're not too far apart
            if (distance < 300) {
              newLines.push(
                <line
                  key={`line-${planetIndex}-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(180, 190, 255, 0.4)"
                  strokeWidth="0.3"
                  filter="url(#glow)"
                />,
              );
            }
          }

          // Add some extra connections for a richer network
          if (starElements.length > 3) {
            for (let i = 0; i < starElements.length; i++) {
              for (let j = i + 2; j < starElements.length; j++) {
                if (
                  j !== (i + 1) % starElements.length &&
                  Math.random() > 0.7
                ) {
                  const current = starElements[i];
                  const other = starElements[j];

                  const currentRect = current.getBoundingClientRect();
                  const otherRect = other.getBoundingClientRect();

                  // Calculate center points relative to the SVG
                  const x1 =
                    currentRect.left + currentRect.width / 2 - svgRect.left;
                  const y1 =
                    currentRect.top + currentRect.height / 2 - svgRect.top;
                  const x2 =
                    otherRect.left + otherRect.width / 2 - svgRect.left;
                  const y2 = otherRect.top + otherRect.height / 2 - svgRect.top;

                  // Calculate distance
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const distance = Math.sqrt(dx * dx + dy * dy);

                  // Only connect if they're not too far apart
                  if (distance < 200) {
                    newLines.push(
                      <line
                        key={`extra-line-${planetIndex}-${i}-${j}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(180, 190, 255, 0.06)"
                        strokeWidth="0.3"
                        filter="url(#glow)"
                      />,
                    );
                  }
                }
              }
            }
          }
        },
      );

      setLines(newLines);
      requestRef.current = requestAnimationFrame(updateLines);
    };

    // Start the animation loop
    requestRef.current = requestAnimationFrame(updateLines);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [stars]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {lines}
    </svg>
  );
}
