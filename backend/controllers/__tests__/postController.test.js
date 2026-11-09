jest.mock('../../utils/dbConnection', () => jest.fn().mockResolvedValue());

const Post = require('../../models/Post');
const { getPost, getPosts } = require('../postController');

function mockRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
}

/** Query encadenable de Mongoose falsa. */
function query(result) {
    const q = { select: () => q, sort: () => q, skip: () => q, limit: () => q, then: (ok, ko) => Promise.resolve(result).then(ok, ko) };
    return q;
}

describe('revista', () => {
    test('un borrador no se ve sin sesión', async () => {
        Post.findOne = jest.fn(() => query({ status: 'draft', title: 'x' }));
        const res = mockRes();
        await getPost({ params: { id: 'mi-borrador' } }, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('un publicado se ve por slug', async () => {
        Post.findOne = jest.fn(() => query({ status: 'published', title: 'Cómo enviar una maqueta' }));
        const res = mockRes();
        await getPost({ params: { id: 'como-enviar-una-maqueta' } }, res);
        expect(Post.findOne).toHaveBeenCalledWith({ slug: 'como-enviar-una-maqueta' });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }));
    });

    test('el listado público solo pide publicados, aunque se pida status=all', async () => {
        Post.find = jest.fn(() => query([]));
        Post.countDocuments = jest.fn().mockResolvedValue(0);
        await getPosts({ query: { status: 'all' } }, mockRes());
        expect(Post.find).toHaveBeenCalledWith({ status: 'published' });
    });

    test('publicar fija publishedAt', () => {
        const post = new Post({ title: 't', content: '<p>x</p>', author: { name: 'A' }, userId: 'u', status: 'published' });
        // validate es async por el plugin de slug; el hook de publishedAt va primero.
        return post.validate().catch(() => {}).then(() => expect(post.publishedAt).toBeInstanceOf(Date));
    });
});
