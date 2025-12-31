// app/admin/manage-products/DeleteConfirmModal.tsx
import styles from "./manageProducts.module.css";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  productName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Delete Product?</h3>
        <p>
          Are you sure you want to delete <strong>{productName}</strong>? This action cannot be undone.
        </p>
        <div className={styles.modalActions} style={{ marginTop: "1.5rem" }}>
          <button className={styles.closeBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}