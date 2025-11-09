import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import './AdminUsers.css';

const API_URL = import.meta.env.VITE_API_URL

function AdminUsers () {
  const { getToken } = useAuth()
  const { isAdmin, loading: userLoading } = useUser()
  const navigate = useNavigate()
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      navigate('/') // Redirige si no es admin
    }
  }, [isAdmin, userLoading, navigate])

  const fetchUsers = useCallback(async () => {
    if (!isAdmin || userLoading) return

    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Error al cargar usuarios')
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAdmin, userLoading, getToken])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`¿Cambiar rol de usuario a "${newRole}"?`)) return

    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar rol')
      }

      // Actualizar lista local
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))

      alert('✅ Rol actualizado correctamente')
    } catch (err) {
      console.error('Error:', err)
      alert(`❌ Error: ${err.message}`)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (userLoading || loading) return <LoadingSpinner />

  if (!isAdmin) {
    return (
      <div className='access-denied'>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    )
  }

  if (error) {
    return (
      <div className='admin-error'>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    )
  }

  return (
    <div className='admin-users'>
      <div className='admin-container'>
        <header className='admin-header'>
          <h1>👥 Gestión de Usuarios</h1>
          <button onClick={() => navigate('/')} className='btn-back-admin'>
            Volver
          </button>
        </header>

        <div className='search-bar'>
          <input
            type='text'
            placeholder='Buscar por nombre o email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='search-input'
          />
        </div>

        <div className='users-stats'>
          <div className='stat-card'>
            <span className='stat-number'>{users.length}</span>
            <span className='stat-label'>Total Usuarios</span>
          </div>
          <div className='stat-card'>
            <span className='stat-number'>{users.filter(u => u.role === 'admin').length}</span>
            <span className='stat-label'>Admins</span>
          </div>
          <div className='stat-card'>
            <span className='stat-number'>{users.filter(u => u.role === 'staff').length}</span>
            <span className='stat-label'>Staff</span>
          </div>
          <div className='stat-card'>
            <span className='stat-number'>{users.filter(u => u.role === 'user').length}</span>
            <span className='stat-label'>Usuarios</span>
          </div>
        </div>

        <div className='table-container'>
          <table className='users-table'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan='4' className='no-results'>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name || 'Sin nombre'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role === 'admin' && '👑'}
                        {user.role === 'staff' && '🎫'}
                        {user.role === 'user' && '👤'}
                        {' '}
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className='role-select'
                      >
                        <option value='user'>Usuario</option>
                        <option value='staff'>Staff</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
