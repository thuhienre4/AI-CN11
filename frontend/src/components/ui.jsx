import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
}

export const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', className, children, icon: Icon, ...props },
  ref,
) {
  return (
    <Component ref={ref} className={clsx('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)} {...props}>
      <span>{children}</span>{Icon && <Icon aria-hidden="true" />}
    </Component>
  )
})

export function Card({ as: Component = motion.section, className, interactive = false, children, ...props }) {
  return <Component className={clsx('ui-card', interactive && 'ui-card-interactive', className)} {...fadeUp} {...props}>{children}</Component>
}

export function Badge({ tone = 'blue', icon: Icon, children, className }) {
  return <span className={clsx('ui-badge', `ui-badge-${tone}`, className)}>{Icon && <Icon aria-hidden="true" />}{children}</span>
}

export function ProgressBar({ value = 0, label, showValue = false, tone = 'blue', className }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))
  return (
    <div className={clsx('ui-progress', className)}>
      {(label || showValue) && <div className="ui-progress-meta"><span>{label}</span>{showValue && <strong>{Math.round(safeValue)}%</strong>}</div>}
      <div className="ui-progress-track"><motion.span className={`ui-progress-${tone}`} initial={{ width: 0 }} animate={{ width: `${safeValue}%` }} transition={{ duration: .7, ease: 'easeOut' }} /></div>
    </div>
  )
}

export function StatCard({ label, value, detail, trend, trendDirection = 'up', icon: Icon, tone = 'blue', chart = [3, 5, 4, 7, 6, 9] }) {
  const TrendIcon = trendDirection === 'down' ? TrendingDown : TrendingUp
  return (
    <Card className="ui-stat-card" interactive>
      <div className={`ui-stat-icon ui-stat-icon-${tone}`}>{Icon && <Icon aria-hidden="true" />}</div>
      <div className="ui-stat-heading"><span>{label}</span>{trend && <em className={trendDirection === 'down' ? 'is-down' : ''}><TrendIcon />{trend}</em>}</div>
      <strong className="ui-stat-value">{value}</strong>
      <div className="ui-stat-footer"><small>{detail}</small><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points={chart.map((point, index) => `${(index / (chart.length - 1)) * 100},${30 - point * 2.5}`).join(' ')} /></svg></div>
    </Card>
  )
}

export function PageHeader({ eyebrow, title, description, action, children }) {
  return (
    <motion.header className="ui-page-header" {...fadeUp}>
      <div><span className="ui-page-eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action && <div className="ui-page-actions">{action}</div>}
      {children}
    </motion.header>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return <div className="ui-empty-state">{Icon && <span><Icon /></span>}<h3>{title}</h3><p>{description}</p>{action}</div>
}

export function Skeleton({ className }) { return <span className={clsx('ui-skeleton', className)} aria-hidden="true" /> }

export function IconLink({ children, label, className, ...props }) {
  return <a className={clsx('ui-icon-link', className)} aria-label={label} {...props}>{children}<ArrowUpRight aria-hidden="true" /></a>
}
