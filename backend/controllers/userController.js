const User = require('../models/User');
const Artist = require('../models/Artist');
const mongoose = require('mongoose');
const connectDB = require('../utils/dbConnection');

/**
 * GET /api/users/me
 * Obtener información del usuario actual (incluye rol)
 */
const getCurrentUser = async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();
    
    const authData = req.auth || req.user;
    
    console.log('🔍 getCurrentUser - Auth data:', JSON.stringify(authData, null, 2));
    
    const auth0Id = authData.sub;
    
    // El email puede estar en diferentes lugares según la configuración de Auth0
    const email = authData.email 
      || authData['https://otp-records.com/email'] 
      || authData['http://otp-records.com/email'];
    
    const name = authData.name 
      || authData['https://otp-records.com/name']
      || authData.nickname 
      || email?.split('@')[0]; // Fallback: usar parte antes del @ del email

    console.log('📧 Extracted email:', email);
    console.log('👤 Extracted name:', name);

    if (!email) {
      return res.status(400).json({ 
        error: 'Email no encontrado en el token',
        debug: {
          availableKeys: Object.keys(authData)
        }
      });
    }

    // Extraer roles del token Auth0
    const tokenRoles = authData['https://otp-records.com/roles'] 
      || authData['http://otp-records.com/roles'] 
      || authData.roles 
      || [];
    const normalizedTokenRoles = Array.isArray(tokenRoles) 
      ? tokenRoles.map(r => r.toLowerCase()) 
      : [];

    // Determinar rol desde Auth0 token
    let tokenRole = 'user';
    if (normalizedTokenRoles.includes('admin')) tokenRole = 'admin';
    else if (normalizedTokenRoles.includes('staff')) tokenRole = 'staff';
    else if (normalizedTokenRoles.includes('artist')) tokenRole = 'artist';

    // Buscar o crear usuario en BD local
    let user = await User.findOne({ auth0Id });

    if (!user) {
      // Intentar split del nombre en firstName/lastName
      const fullName = name || email;
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      user = await User.create({
        auth0Id,
        email,
        name: fullName,
        firstName,
        lastName,
        role: tokenRole
      });
      console.log(`✅ Created new user: ${email} with role '${tokenRole}'`);
    } else {
      // Sincronizar rol desde Auth0 token
      user.role = tokenRole;
      user.lastLogin = new Date();
      await user.save();
    }

    // Populate linkedArtistId
    await user.populate('linkedArtistId', 'name img');

    res.json({
      id: user._id,
      auth0Id: user.auth0Id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      linkedArtistId: user.linkedArtistId,
      eventPermissions: user.eventPermissions,
      lastLogin: user.lastLogin
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

/**
 * GET /api/users
 * Listar todos los usuarios (solo admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ active: true })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

/**
 * PUT /api/users/:id/role
 * Cambiar el rol de un usuario (solo admin)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validar rol
    const validRoles = ['user', 'artist', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Rol inválido',
        validRoles 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log(`✅ Updated user ${user.email} role to: ${role}`);

    res.json({
      success: true,
      message: 'Rol actualizado correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

/**
 * PUT /api/users/:id/event-permissions
 * Asignar permisos de eventos específicos a un usuario staff (solo admin)
 */
const updateEventPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventIds } = req.body;

    if (!Array.isArray(eventIds)) {
      return res.status(400).json({ 
        error: 'eventIds debe ser un array' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { eventPermissions: eventIds },
      { new: true, runValidators: true }
    ).populate('eventPermissions', 'name date');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Permisos actualizados correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        eventPermissions: user.eventPermissions
      }
    });

  } catch (error) {
    console.error('Error updating event permissions:', error);
    res.status(500).json({ error: 'Error al actualizar permisos' });
  }
};

/**
 * PATCH /api/users/me
 * Actualizar perfil del usuario actual (firstName, lastName, linkedArtistId)
 */
const updateProfile = async (req, res) => {
  try {
    await connectDB();

    const authData = req.auth || req.user;
    const auth0Id = authData.sub;

    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { firstName, lastName, linkedArtistId } = req.body;

    // Actualizar nombre
    if (firstName !== undefined) {
      user.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      user.lastName = lastName.trim();
    }

    // Recalcular name como concatenación
    const parts = [user.firstName, user.lastName].filter(Boolean);
    if (parts.length > 0) {
      user.name = parts.join(' ');
    }

    // Manejar linkedArtistId (solo para roles artist o admin)
    if (linkedArtistId !== undefined) {
      const allowedRoles = ['artist', 'admin'];
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: 'Solo usuarios con rol artista o admin pueden vincular un artista' 
        });
      }

      if (linkedArtistId === null || linkedArtistId === '') {
        user.linkedArtistId = null;
      } else {
        // Validar que el ObjectId es válido
        if (!mongoose.Types.ObjectId.isValid(linkedArtistId)) {
          return res.status(400).json({ error: 'ID de artista inválido' });
        }
        // Validar que el artista existe
        const artist = await Artist.findById(linkedArtistId);
        if (!artist) {
          return res.status(400).json({ error: 'Artista no encontrado' });
        }
        user.linkedArtistId = linkedArtistId;
      }
    }

    await user.save();
    await user.populate('linkedArtistId', 'name img');

    res.json({
      id: user._id,
      auth0Id: user.auth0Id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      linkedArtistId: user.linkedArtistId,
      eventPermissions: user.eventPermissions,
      lastLogin: user.lastLogin
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

module.exports = {
  getCurrentUser,
  getAllUsers,
  updateUserRole,
  updateEventPermissions,
  updateProfile
};
