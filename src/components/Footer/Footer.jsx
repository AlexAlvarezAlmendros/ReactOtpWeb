import './Footer.css'

function Footer () {
  const year = new Date().getFullYear()
  return (
    <footer className='footer'>
      <p>&copy; {year} Mi Empresa</p>
    </footer>
  )
}

export default Footer
