import { User } from "next-auth";
import type React from "react";

export interface StarryOrganizationProps {
  users: User[];
}

// 배경 별 타입 정의
export interface BackgroundStar {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
}

// 행성 타입 정의
export interface RenderedPlanet {
  id: string;
  name: string;
  category: string;
  size: number;
  color: string;
  x: number;
  y: number;
  ringColor: string;
  hasRings: boolean;
  rotationSpeed: number;
}

export interface UserStar extends User {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  orbitSpeed?: number;
  orbitRadius?: number;
  orbitOffset?: number;
  orbitEccentricity?: number;
  orbitAngle?: number;
  centerX?: number;
  centerY?: number;
  planetId?: string; // 공전 중심 행성 ID
}

// 별자리 연결선 타입 정의
export type ConstellationLine = React.ReactElement<
  React.SVGProps<SVGLineElement>
>;
