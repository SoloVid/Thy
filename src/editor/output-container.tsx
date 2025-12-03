type Output = {
  readonly error: null | string
  readonly returnValue: unknown
  readonly printedLines: readonly string[]
}

type OutputContainerProps = {
  readonly output: Output | string | null
}

export default function OutputContainer({ output }: OutputContainerProps) {
  if (!output) {
    return (
      <div>
        <em>Code not run yet</em>
      </div>
    )
  }
  if (typeof output === "string") {
    return (
      <div>
        <em>Running...</em>
      </div>
    )
  }
  if (
    !output.error &&
    output.returnValue === undefined &&
    output.printedLines.length === 0
  ) {
    return (
      <div>
        <em>No output</em>
      </div>
    )
  }
  return (
    <div>
      {output.error !== null && (
        <div>
          <h3>Error</h3>
          <pre className="output">{output.error}</pre>
          <hr />
        </div>
      )}
      {output.returnValue !== undefined && (
        <div>
          <h3>Return Value</h3>
          <pre className="output">
            {JSON.stringify(output.returnValue, null, 2)}
          </pre>
          <hr />
        </div>
      )}
      {output.printedLines.length > 0 && (
        <div>
          <h3>Printed Lines</h3>
          <pre className="output">{output.printedLines.join("\n")}</pre>
          <hr />
        </div>
      )}
    </div>
  )
}
