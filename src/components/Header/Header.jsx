import './Header.css'

function Header ({ title, children }) {
  return (
    <header className="header">
      <h1 className="title">{title}</h1>
      {children}
    </header>
  )
}

export default Header
