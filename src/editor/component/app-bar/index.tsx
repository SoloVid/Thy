import { ComponentChildren } from "preact"
import { css, styled } from "../css.ts"

// Define styles (optional, or replace with your preferred method)
const appBarStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #6200ea;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const titleStyle = css`
  font-size: 1.25rem;
  font-weight: 500;
`

const actionsStyle = css`
  display: flex;
  gap: 0.5rem;
`

type Props = {
  title: string
  children: ComponentChildren
}

const Header = styled("header")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #157be0;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const Title = styled("div")`
  font-size: 1.25rem;
  font-weight: 500;
`

const Actions = styled("div")`
  display: flex;
  gap: 0.5rem;
`

export default function AppBar({ title, children }: Props) {
  return (
    <Header>
      <Title>{title}</Title>
      <Actions>{children}</Actions>
    </Header>
  )
}

// Usage example:
// import AppBar from './AppBar';
//
// const App = () => (
//   <div>
//     <AppBar title="My App">
//       <button>Action 1</button>
//       <button>Action 2</button>
//     </AppBar>
//     <main>
//       <p>Welcome to my app!</p>
//     </main>
//   </div>
// );
//
// export default App;
