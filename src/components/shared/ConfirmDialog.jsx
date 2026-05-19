import { Modal } from './Modal';

/**
 * Generic confirm dialog. Renders a Modal with a prompt and Yes/No buttons.
 * Caller owns open state.
 *
 * @param {boolean} open
 * @param {string} title
 * @param {React.ReactNode} children - body content
 * @param {string} [confirmLabel='Confirm']
 * @param {string} [cancelLabel='Cancel']
 * @param {() => void} onConfirm
 * @param {() => void} onCancel
 * @param {'normal'|'destructive'} [tone='normal']
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  // eslint-disable-next-line no-unused-vars
  tone = 'normal',
}) {
  return (
    <Modal
      open={open}
      title={title}
      actions={[
        { label: cancelLabel, onClick: onCancel, variant: 'secondary' },
        { label: confirmLabel, onClick: onConfirm, variant: 'primary' },
      ]}
      onClose={onCancel}
    >
      {children}
    </Modal>
  );
}
