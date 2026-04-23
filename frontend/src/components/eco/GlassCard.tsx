import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type Props = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  hover?: boolean;
};

export const GlassCard = forwardRef<HTMLDivElement, Props>(
  ({ className, children, hover = true, ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        whileHover={hover ? { y: -2 } : undefined}
        className={cn(
          "glass glossy rounded-3xl p-6 hover-lift",
          "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-30px_rgba(0,0,0,0.6)]",
          className,
        )}
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";