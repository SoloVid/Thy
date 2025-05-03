import { ComponentChildren, createContext } from "preact"
import { useCallback, useContext, useState } from "preact/hooks"

type AlertType = "error" | "info" | "success" | "warning"

interface Toast {
  id: number
  message: string
  type: AlertType
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void
  showToast: (message: string, type?: AlertType) => void
  confirm: (message: string) => Promise<boolean>
  prompt: (message: string, defaultValue?: string) => Promise<string | null>
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  showToast: () => {},
  confirm: () => Promise.resolve(false),
  prompt: () => Promise.resolve(null),
})

export function useAlerts(): AlertContextType {
  return useContext(AlertContext)
}

interface AlertProviderProps {
  children: ComponentChildren
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null)
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

  const showAlert = useCallback((message: string, type: AlertType = "error") => {
    setAlert({ message, type })
  }, [])

  const showToast = useCallback((message: string, type: AlertType = "info") => {
    const id = nextId
    setNextId(id + 1)
    
    const toast: Toast = { id, message, type }
    setToasts(prev => [...prev, toast])
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [nextId])

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmDialog({ message, resolve })
    })
  }, [])

  const prompt = useCallback((message: string, defaultValue: string = ""): Promise<string | null> => {
    return new Promise(resolve => {
      setPromptDialog({ message, defaultValue, resolve })
    })
  }, [])

  const handleCloseAlert = useCallback(() => {
    setAlert(null)
  }, [])

  const handleConfirm = useCallback((value: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(value)
      setConfirmDialog(null)
    }
  }, [confirmDialog])

  const handlePromptSubmit = useCallback((value: string | null) => {
    if (promptDialog) {
      promptDialog.resolve(value)
      setPromptDialog(null)
    }
  }, [promptDialog])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const alertValue = {
    showAlert,
    showToast,
    confirm,
    prompt,
  }

  return (
    <AlertContext.Provider value={alertValue}>
      {children}
      
      {/* Alert Dialog */}
      {alert && (
        <div className="alert-overlay">
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
        <div className="alert-overlay">
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
                <button onClick={() => {
                  const input = document.getElementById('prompt-input') as HTMLInputElement
                  handlePromptSubmit(input.value)
                }}>OK</button>
                <button onClick={() => handlePromptSubmit(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(toast => (
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
