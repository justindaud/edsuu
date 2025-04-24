import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
  title?: string
}

export default function Modal({ children, onClose, title }: ModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
} 