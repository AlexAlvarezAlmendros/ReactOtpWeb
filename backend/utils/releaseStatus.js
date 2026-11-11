/**
 * Estados de un release y modos de sincronización de un artista.
 *
 * - published: se ve en la web. Es el valor por defecto, y los releases
 *   anteriores a este campo no lo tienen: por eso las consultas públicas
 *   excluyen los estados ocultos en vez de pedir `published`.
 * - draft: lo ha importado el cron de Spotify de un artista en modo
 *   «revisión». No se ve en la web hasta que alguien lo acepte en el panel.
 * - rejected: un borrador denegado. Se guarda (no se borra) para que el cron
 *   no vuelva a importarlo: el índice único de spotifyAlbumId lo impide.
 */
const RELEASE_STATUSES = ['published', 'draft', 'rejected'];
const HIDDEN_RELEASE_STATUSES = ['draft', 'rejected'];

/** Filtro de Mongo para lo que se puede mostrar en la web. */
const publicReleaseFilter = () => ({ status: { $nin: HIDDEN_RELEASE_STATUSES } });

const isReleaseHidden = (release) => HIDDEN_RELEASE_STATUSES.includes(release?.status);

/**
 * Modos de sincronización de un artista, a partir de dos booleanos de la ficha
 * (`spotifySyncEnabled` ya existía; `spotifyAutoPublish` es nuevo y vale false
 * por defecto, así que todos los artistas empiezan en revisión):
 * - auto: los lanzamientos nuevos se publican solos.
 * - review: entran como borradores.
 * - off: el cron no sincroniza al artista.
 */
const SYNC_MODES = ['auto', 'review', 'off'];

const syncModeOf = (artist) => {
    if (artist?.spotifySyncEnabled === false) return 'off';
    return artist?.spotifyAutoPublish === true ? 'auto' : 'review';
};

const syncModeToFields = (mode) => ({
    spotifySyncEnabled: mode !== 'off',
    spotifyAutoPublish: mode === 'auto'
});

module.exports = {
    RELEASE_STATUSES,
    HIDDEN_RELEASE_STATUSES,
    publicReleaseFilter,
    isReleaseHidden,
    SYNC_MODES,
    syncModeOf,
    syncModeToFields
};
