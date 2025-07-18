import { usePermissions } from '../../hooks/usePermissions'

export default function PermissionsDebug () {
  const { permissions, roles, canCreate, canEdit, canDelete, isAdmin } = usePermissions()

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,100,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Permissions Debug</h4>
      <div><strong>Permissions:</strong> [{permissions.join(', ')}]</div>
      <div><strong>Roles:</strong> [{roles.join(', ')}]</div>
      <div><strong>canCreate:</strong> {canCreate ? 'true' : 'false'}</div>
      <div><strong>canEdit:</strong> {canEdit ? 'true' : 'false'}</div>
      <div><strong>canDelete:</strong> {canDelete ? 'true' : 'false'}</div>
      <div><strong>isAdmin:</strong> {isAdmin ? 'true' : 'false'}</div>
    </div>
  )
}
