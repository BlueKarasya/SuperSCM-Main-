import type { ButtonHTMLAttributes, ReactNode } from 'react';

export default function Button({ variant = 'default', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary'; children: ReactNode }) {
  return <button {...props} className={`ui-button ui-button--${variant} ${props.className ?? ''}`}>{children}</button>;
}
