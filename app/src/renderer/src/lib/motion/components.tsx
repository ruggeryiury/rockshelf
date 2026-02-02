import { motion, AnimatePresence, HTMLMotionProps } from 'motion/react'

export function AnimatedDiv({ condition, children, ...props }: HTMLMotionProps<'div'> & React.PropsWithChildren & { condition: boolean }) {
  return <AnimatePresence>{condition && <motion.div {...props}>{children}</motion.div>}</AnimatePresence>
}

export function AnimatedSection({ condition, children, ...props }: HTMLMotionProps<'section'> & React.PropsWithChildren & { condition: boolean }) {
  return <AnimatePresence>{condition && <motion.section {...props}>{children}</motion.section>}</AnimatePresence>
}

export function AnimatedButton({ condition, children, ...props }: HTMLMotionProps<'button'> & React.PropsWithChildren & { condition: boolean }) {
  return <AnimatePresence>{condition && <motion.button {...props}>{children}</motion.button>}</AnimatePresence>
}

export function AnimatedP({ condition, children, ...props }: HTMLMotionProps<'p'> & React.PropsWithChildren & { condition: boolean }) {
  return <AnimatePresence>{condition && <motion.p {...props}>{children}</motion.p>}</AnimatePresence>
}
