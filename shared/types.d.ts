declare module '@radix-ui/react-dialog' {
  import * as React from 'react'

  interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
    modal?: boolean
    children?: React.ReactNode
  }

  interface DialogTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
    asChild?: boolean
  }

  interface DialogContentProps extends React.ComponentPropsWithoutRef<'div'> {
    onPointerDownOutside?: (event: Event) => void
    onEscapeKeyDown?: (event: KeyboardEvent) => void
    onInteractOutside?: (event: Event) => void
    forceMount?: boolean
    asChild?: boolean
  }

  interface DialogOverlayProps extends React.ComponentPropsWithoutRef<'div'> {
    forceMount?: boolean
    asChild?: boolean
  }

  interface DialogTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
    asChild?: boolean
  }

  interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<'p'> {
    asChild?: boolean
  }

  interface DialogCloseProps extends React.ComponentPropsWithoutRef<'button'> {
    asChild?: boolean
  }

  export const Root: React.ForwardRefExoticComponent<DialogProps & React.RefAttributes<HTMLDivElement>>
  export const Trigger: React.ForwardRefExoticComponent<DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>
  export const Portal: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>>
  export const Overlay: React.ForwardRefExoticComponent<DialogOverlayProps & React.RefAttributes<HTMLDivElement>>
  export const Content: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>
  export const Title: React.ForwardRefExoticComponent<DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>
  export const Description: React.ForwardRefExoticComponent<DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>>
  export const Close: React.ForwardRefExoticComponent<DialogCloseProps & React.RefAttributes<HTMLButtonElement>>
} 