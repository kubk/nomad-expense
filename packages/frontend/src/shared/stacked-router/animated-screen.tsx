import React from "react";
import { motion, type Transition } from "framer-motion";
import type { Route } from "./routes";

export type AnimationType = "horizontal-slide" | "stacked-slide" | "scale";

const getAnimationProps = (
  animationType: AnimationType,
  isBackground: boolean,
  level: number,
  topScreenAnimationType: AnimationType,
) => {
  const getScaleVariant = () => {
    // Top screen entering/exiting
    return {
      animate: { scale: 1, opacity: 1 },
      initial: level > 0 ? { scale: 0.95, opacity: 0 } : false,
      exit: { scale: 0.95, opacity: 0 },
    };
  };

  const getHorizontalSlideVariant = () => {
    // Top screen entering/exiting
    return {
      animate: { x: 0, scale: 1 },
      initial: level > 0 ? { x: "100%" } : false,
      exit: { x: "100%", scale: 1 },
    };
  };

  const getStackedSlideVariant = () => {
    // Background screens - when a scale screen is on top, underlying screens stay completely static
    if (isBackground && topScreenAnimationType === "scale") {
      return {
        animate: { x: 0, scale: 1 },
        initial: level > 0 ? { x: "100%" } : false,
        exit: { x: "100%", scale: 1 }, // Background screens on exit
      };
    }

    // Background screens - default slide with stacking transforms
    if (isBackground) {
      const offset = level === 0 ? -40 : level === 1 ? -25 : -10;
      const scaleValue = level === 0 ? 0.8 : level === 1 ? 0.9 : 0.95;
      return {
        animate: { x: `${offset}%`, scale: scaleValue },
        initial: level > 0 ? { x: "100%" } : false,
        exit: { x: "100%", scale: 1 }, // Background screens on exit
      };
    }

    // Top screen entering/exiting
    return {
      animate: { x: 0, scale: 1 },
      initial: level > 0 ? { x: "100%" } : false, // Top screen entering
      exit: { x: "100%", scale: 1 }, // Top screen exiting
    };
  };

  switch (animationType) {
    case "scale":
      return getScaleVariant();
    case "horizontal-slide":
      return getHorizontalSlideVariant();
    case "stacked-slide":
      return getStackedSlideVariant();
    default:
      return animationType satisfies never;
  }
};

export const AnimatedScreen = ({
  children,
  route,
  index,
  stack,
  getAnimationConfig,
  transition,
}: {
  children: React.ReactNode;
  index: number;
  stack: Route[];
  route: Route;
  getAnimationConfig: (routeType: Route["type"]) => AnimationType;
  transition: Transition;
}) => {
  const isTopScreen = index === stack.length - 1;
  const isBackground = !isTopScreen;
  const level = index;
  const topScreenType = stack[stack.length - 1]?.type;

  const animationType = getAnimationConfig(route.type);
  const topScreenAnimationType = getAnimationConfig(topScreenType);

  const animationProps = getAnimationProps(
    animationType,
    isBackground,
    level,
    topScreenAnimationType,
  );

  return (
    <motion.div
      className="absolute inset-0"
      animate={animationProps.animate}
      initial={animationProps.initial}
      exit={animationProps.exit}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};
