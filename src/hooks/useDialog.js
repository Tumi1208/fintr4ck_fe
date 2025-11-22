import { useCallback, useState } from "react";

export function useDialog() {
  const [dialog, setDialog] = useState(null);

  const showDialog = useCallback((config) => {
    return new Promise((resolve) => {
      setDialog({
        title: "",
        message: "",
        confirmText: "OK",
        cancelText: null,
        tone: "neutral",
        ...config,
        resolve,
      });
    });
  }, []);

  const closeDialog = useCallback(() => setDialog(null), []);

  const handleConfirm = useCallback(() => {
    if (dialog?.resolve) dialog.resolve(true);
    setDialog(null);
  }, [dialog]);

  const handleCancel = useCallback(() => {
    if (dialog?.resolve) dialog.resolve(false);
    setDialog(null);
  }, [dialog]);

  return { dialog, showDialog, closeDialog, handleConfirm, handleCancel };
}
