import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './FileCard.css'

function FileCard ({ file, onDelete }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getFileIcon = () => {
    if (file.fileType === 'audio') {
      return 'file-audio'
    } else if (file.fileType === 'archive') {
      return 'file-archive'
    }
    return 'file'
  }

  const getFileTypeColor = () => {
    if (file.fileType === 'audio') {
      return '#ff003c'
    } else if (file.fileType === 'archive') {
      return '#f59e0b'
    }
    return '#999'
  }

  return (
    <div className="file-card">
      <div className="file-header">
        <div className="file-icon-container" style={{ backgroundColor: `${getFileTypeColor()}20` }}>
          <FontAwesomeIcon 
            icon={getFileIcon()} 
            className="file-icon"
            style={{ color: getFileTypeColor() }}
          />
        </div>
        <div className="file-actions">
          <a 
            href={file.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button view-button"
            title="Ver archivo"
          >
            <FontAwesomeIcon icon="external-link-alt" />
          </a>
          <a 
            href={file.secureUrl}
            download={file.originalName}
            className="action-button download-button"
            title="Descargar archivo"
          >
            <FontAwesomeIcon icon="download" />
          </a>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="action-button delete-button"
              title="Eliminar archivo"
            >
              <FontAwesomeIcon icon="trash" />
            </button>
          )}
        </div>
      </div>

      <div className="file-info">
        <h3 className="file-name">{file.originalName}</h3>
        
        {file.description && (
          <p className="file-description">{file.description}</p>
        )}

        <div className="file-metadata">
          <span className="file-type">
            <FontAwesomeIcon icon="tag" />
            {file.fileType === 'audio' ? 'Audio' : 'Archivo'}
          </span>
          <span className="file-size">
            <FontAwesomeIcon icon="hdd" />
            {formatFileSize(file.size)}
          </span>
          <span className="file-format">
            <FontAwesomeIcon icon="file-code" />
            {file.format?.toUpperCase()}
          </span>
        </div>

        {file.tags && file.tags.length > 0 && (
          <div className="file-tags">
            {file.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {file.tags.length > 3 && (
              <span className="tag tag-more">+{file.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="file-footer">
          <span className="file-date">
            <FontAwesomeIcon icon="calendar" />
            {formatDate(file.createdAt)}
          </span>
          <span className={`file-visibility ${file.isPublic ? 'public' : 'private'}`}>
            <FontAwesomeIcon icon={file.isPublic ? 'globe' : 'lock'} />
            {file.isPublic ? 'Público' : 'Privado'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FileCard
