import { useRef, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { EyeOffIcon } from "lucide-react";

const MINIMUM_FAST_SWIPE_DISTANCE = 72;
const FAST_SWIPE_VELOCITY = -800;
const MAXIMUM_HIDE_DISTANCE = 180;

type SwipeableAccountCardProps = {
  children: ReactNode;
  onHide: () => void;
};

export function SwipeableAccountCard({
  children,
  onHide,
}: SwipeableAccountCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);
  const x = useMotionValue(0);
  const actionBackgroundOpacity = useTransform(x, [-12, -3, 0], [1, 0, 0]);
  const actionOpacity = useTransform(x, [-96, -24, 0], [1, 0.4, 0]);
  const actionScale = useTransform(x, [-128, -40, 0], [1.08, 0.9, 0.8]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const cardWidth = cardRef.current?.offsetWidth ?? 320;
    const hideDistance = Math.min(cardWidth * 0.45, MAXIMUM_HIDE_DISTANCE);
    const swipeDistance = Math.max(0, -info.offset.x);
    const isFastSwipe =
      swipeDistance >= MINIMUM_FAST_SWIPE_DISTANCE &&
      info.velocity.x <= FAST_SWIPE_VELOCITY;

    requestAnimationFrame(() => {
      didDragRef.current = false;
    });

    if (swipeDistance >= hideDistance || isFastSwipe) {
      onHide();
      return;
    }

    animate(x, 0, { type: "spring", stiffness: 520, damping: 38 });
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      exit={{ x: "-110%", opacity: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 420, damping: 36 },
        x: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.16, ease: "easeOut" },
      }}
      className="relative overflow-hidden rounded-2xl bg-card"
    >
      <motion.div
        style={{ opacity: actionBackgroundOpacity }}
        className="pointer-events-none absolute inset-[6px] rounded-xl bg-blue-600 dark:bg-blue-700"
      />

      <motion.div
        style={{ opacity: actionOpacity, scale: actionScale }}
        className="pointer-events-none absolute inset-y-0 right-0 flex w-20 items-center justify-center text-white"
      >
        <EyeOffIcon className="size-6" />
      </motion.div>

      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -1000, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => {
          didDragRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        className="w-full touch-pan-y bg-card shadow-sm"
      >
        <div
          onClickCapture={(event) => {
            if (didDragRef.current) event.stopPropagation();
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
