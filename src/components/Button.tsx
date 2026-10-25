import type { ComponentProps } from 'react'
import { buttonClass, type ButtonVariant } from './button-styles'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
}

/** M3 common button. Always renders a real <button> with an explicit type. */
export function Button({ variant = 'filled', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />
}
