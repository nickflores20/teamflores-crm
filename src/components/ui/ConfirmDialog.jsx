import Modal from './Modal.jsx'
import Button from './Button.jsx'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="px-6 py-5 flex flex-col gap-5">
        {message && <p className="text-sand/70 text-sm leading-relaxed">{message}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="md" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
