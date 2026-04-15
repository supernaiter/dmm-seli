import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

type SectionProps = {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}

export function Section({ eyebrow, title, description, children }: SectionProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      className="section-block"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="section-head">
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </motion.section>
  )
}
