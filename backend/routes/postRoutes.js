const express = require('express');
const { getPosts, getPost, createPost, updatePost, deletePost } = require('../controllers/postController');
const { checkJwt, optionalJwt, requireStaffOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Públicas (con token opcional: el panel ve también los borradores).
router.get('/', optionalJwt, getPosts);
router.get('/:id', optionalJwt, getPost);

// Panel de gestión.
router.post('/', checkJwt, requireStaffOrAdmin, createPost);
router.patch('/:id', checkJwt, requireStaffOrAdmin, updatePost);
router.delete('/:id', checkJwt, requireStaffOrAdmin, deletePost);

module.exports = router;
