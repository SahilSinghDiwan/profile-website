import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, prefersReducedMotion } from "../lib/motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
}

export function AnimatedSection({ children, delay = 0, ...rest }: AnimatedSectionProps) {
  const reduce = prefersReducedMotion();

  if (reduce) {
    return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
