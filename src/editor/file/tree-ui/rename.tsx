import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "preact/hooks"
import { css } from "../../component/css"

export type RenameState = {
  path: string
  isNew: boolean
  name: string
} | null // Inline rename component

export const InlineRename = ({
  initialName,
  onSave,
  onCancel,
}: {
  initialName: string
  onSave: (newName: string) => void
  onCancel: () => void
}) => {
  const [name, setName] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input and select the name without extension
    if (inputRef.current) {
      inputRef.current.focus()

      // Select name without extension
      const dotIndex = initialName.lastIndexOf(".")
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex)
      } else {
        inputRef.current.select()
      }
    }
  }, [initialName])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSave(name)
    } else if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div class={renameContainerStyles}>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onInput={(e) => setName((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        onfocusout={() => onSave(name)}
        class={renameInputStyles}
      />
      <div class={renameActionsStyles}>
        <FontAwesomeIcon
          icon={faCheck}
          className={renameActionStyle}
          onClick={() => onSave(name)}
          title="Save"
          fixedWidth
        />
        <FontAwesomeIcon
          icon={faXmark}
          className={renameActionStyle}
          onClick={onCancel}
          title="Cancel"
          fixedWidth
        />
      </div>
    </div>
  )
}

export const renameContainerStyles = css`
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-left: 4px;
`

export const renameInputStyles = css`
  flex-grow: 1;
  background-color: #3c3c3c;
  color: #ddd;
  border: 1px solid #555;
  border-radius: 2px;
  padding: 2px 4px;
  font-size: 14px;
  outline: none;
`

export const renameActionsStyles = css`
  display: flex;
  margin-left: 4px;
`

export const renameActionStyle = css`
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    background-color: rgba(150, 150, 150, 0.3);
  }
`
