import { ComponentChildren, createContext } from "preact"
import { useCallback, useContext, useState } from "preact/hooks"
import { catchReject } from "utils/promise-helper"
import { stringifyError } from "utils/stringify-error"

type AlertType = "error" | "info" | "success" | "warning"

interface Toast {
  id: number
  message: string
  type: AlertType
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void
  showToast: (message: string, type?: AlertType) => void
  catch: (
    promiseOrFunc: PromiseLike<unknown> | (() => PromiseLike<unknown>),
    messagePrefix?: string,
    alertOrToast?: "alert" | "toast",
  ) => void
  confirm: (message: string) => Promise<boolean>
  prompt: (message: string, defaultValue?: string) => Promise<string | null>
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  showToast: () => {},
  catch: () => {},
  confirm: () => Promise.resolve(false),
  prompt: () => Promise.resolve(null),
})

export function useAlerts(): AlertContextType {
  return useContext(AlertContext)
}

interface AlertProviderProps {
  children: ComponentChildren
}

const maybeConsole = (message: string, type: AlertType = "error") => {
  if (type === "error") {
    console.error(message)
  }
  if (type === "warning") {
    console.warn(message)
  }
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<{
    message: string
    type: AlertType
  } | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string
    resolve: (value: boolean) => void
  } | null>(null)
  const [promptDialog, setPromptDialog] = useState<{
    message: string
    defaultValue: string
    resolve: (value: string | null) => void
  } | null>(null)

  const [nextId, setNextId] = useState(1)

  const showAlert = useCallback(
    (message: string, type: AlertType = "error") => {
      maybeConsole(message, type)
      setAlert({ message, type })
    },
    [],
  )

  const showToast = useCallback(
    (message: string, type: AlertType = "info") => {
      maybeConsole(message, type)
      const id = nextId
      setNextId(id + 1)

      const toast: Toast = { id, message, type }
      setToasts((prev) => [...prev, toast])

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    [nextId],
  )

  const catchPromiseError = useCallback(
    (
      promiseOrFunc: PromiseLike<unknown> | (() => PromiseLike<unknown>),
      messagePrefix: string = "Error",
      alertOrToast: "alert" | "toast" = "alert",
    ) => {
      catchReject(promiseOrFunc, (e) => {
        const message = `${messagePrefix}: ${stringifyError(e)}`
        if (alertOrToast === "alert") {
          showAlert(message, "error")
        } else {
          showToast(message, "error")
        }
      })
    },
    [showAlert, showToast],
  )

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({ message, resolve })
    })
  }, [])

  const prompt = useCallback(
    (message: string, defaultValue: string = ""): Promise<string | null> => {
      return new Promise((resolve) => {
        setPromptDialog({ message, defaultValue, resolve })
      })
    },
    [],
  )

  const handleCloseAlert = useCallback(() => {
    setAlert(null)
  }, [])

  const handleConfirm = useCallback(
    (value: boolean) => {
      if (confirmDialog) {
        confirmDialog.resolve(value)
        setConfirmDialog(null)
      }
    },
    [confirmDialog],
  )

  const handlePromptSubmit = useCallback(
    (value: string | null) => {
      if (promptDialog) {
        promptDialog.resolve(value)
        setPromptDialog(null)
      }
    },
    [promptDialog],
  )

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const alertValue = {
    showAlert,
    showToast,
    catch: catchPromiseError,
    confirm,
    prompt,
  }

  return (
    <AlertContext.Provider value={alertValue}>
      {children}

      {/* Alert Dialog */}
      {alert && (
        <div className="alert-overlay" onClick={handleCloseAlert}>
          <div className={`alert-dialog alert-${alert.type}`}>
            <div className="alert-content">
              <p>{alert.message}</p>
              <button onClick={handleCloseAlert}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="alert-overlay" onClick={() => handleConfirm(false)}>
          <div className="alert-dialog">
            <div className="alert-content">
              <p>{confirmDialog.message}</p>
              <div className="alert-actions">
                <button onClick={() => handleConfirm(true)}>Yes</button>
                <button onClick={() => handleConfirm(false)}>No</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Dialog */}
      {promptDialog && (
        <div className="alert-overlay">
          <div className="alert-dialog">
            <div className="alert-content">
              <p>{promptDialog.message}</p>
              <input
                type="text"
                defaultValue={promptDialog.defaultValue}
                id="prompt-input"
                autoFocus
              />
              <div className="alert-actions">
                <button
                  onClick={() => {
                    const input = document.getElementById(
                      "prompt-input",
                    ) as HTMLInputElement
                    handlePromptSubmit(input.value)
                  }}
                >
                  OK
                </button>
                <button onClick={() => handlePromptSubmit(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <span>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </AlertContext.Provider>
  )
}
