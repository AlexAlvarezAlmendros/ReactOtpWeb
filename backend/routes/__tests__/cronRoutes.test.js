jest.mock('../../services/cronService');
jest.mock('../../services/discographySyncService');
jest.mock('../../utils/dbConnection');

const express = require('express');
const request = require('supertest');
const { processScheduledNewsletters } = require('../../services/cronService');
const { syncAllDiscographies } = require('../../services/discographySyncService');
const connectDB = require('../../utils/dbConnection');
const cronRoutes = require('../cronRoutes');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/cron', cronRoutes);
  return app;
};

const AUTH = 'Bearer test_cron_secret';

describe('cronRoutes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CRON_SECRET = 'test_cron_secret';
    connectDB.mockResolvedValue({});
    processScheduledNewsletters.mockResolvedValue({ processed: 0 });
    syncAllDiscographies.mockResolvedValue({ artistsProcessed: 0, totals: {} });
    app = buildApp();
  });

  // Vercel Cron invoca los endpoints con GET: si solo aceptaran POST, el job
  // fallaría silenciosamente con un 404.
  describe.each([
    ['/api/cron/process-newsletters', () => processScheduledNewsletters],
    ['/api/cron/sync-discography', () => syncAllDiscographies]
  ])('%s', (path, getSpy) => {
    test('responde a GET, como lo dispara Vercel Cron', async () => {
      const res = await request(app).get(path).set('Authorization', AUTH);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(getSpy()).toHaveBeenCalled();
    });

    test('responde también a POST para lanzarlo a mano', async () => {
      const res = await request(app).post(path).set('Authorization', AUTH).send({});

      expect(res.status).toBe(200);
      expect(getSpy()).toHaveBeenCalled();
    });

    test('rechaza peticiones sin el secret', async () => {
      const res = await request(app).get(path);

      expect(res.status).toBe(401);
      expect(getSpy()).not.toHaveBeenCalled();
    });

    test('rechaza peticiones con un secret incorrecto', async () => {
      const res = await request(app).get(path).set('Authorization', 'Bearer wrong');

      expect(res.status).toBe(401);
      expect(getSpy()).not.toHaveBeenCalled();
    });

    test('devuelve 500 si CRON_SECRET no está configurado', async () => {
      delete process.env.CRON_SECRET;

      const res = await request(app).get(path).set('Authorization', AUTH);

      expect(res.status).toBe(500);
      expect(getSpy()).not.toHaveBeenCalled();
    });
  });

  test('sync-discography acepta parámetros por POST', async () => {
    await request(app)
      .post('/api/cron/sync-discography')
      .set('Authorization', AUTH)
      .send({ maxArtists: 5, timeBudgetMs: 3000, dryRun: true });

    expect(syncAllDiscographies).toHaveBeenCalledWith({
      maxArtists: 5,
      timeBudgetMs: 3000,
      dryRun: true
    });
  });

  test('sync-discography usa los valores por defecto en GET', async () => {
    await request(app).get('/api/cron/sync-discography').set('Authorization', AUTH);

    expect(syncAllDiscographies).toHaveBeenCalledWith({ dryRun: false });
  });

  test('propaga un 500 si el servicio falla', async () => {
    processScheduledNewsletters.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/cron/process-newsletters').set('Authorization', AUTH);

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ success: false, error: 'boom' });
  });
});
