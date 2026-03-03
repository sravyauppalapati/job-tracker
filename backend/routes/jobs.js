const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/jobs - Get all jobs for current user
router.get('/', async (req, res) => {
  const { status, priority, search } = req.query;

  let query = 'SELECT * FROM jobs WHERE user_id = ?';
  const params = [req.user.id];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }

  if (search) {
    query += ' AND (company LIKE ? OR position LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY updated_at DESC';

  try {
    const [jobs] = await db.query(query, params);
    res.json(jobs);
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ message: 'Server error fetching jobs.' });
  }
});

// GET /api/jobs/stats - Get statistics for dashboard
router.get('/stats', async (req, res) => {
  try {
    const [statusCounts] = await db.query(
      `SELECT status, COUNT(*) as count FROM jobs WHERE user_id = ? GROUP BY status`,
      [req.user.id]
    );

    const [total] = await db.query(
      'SELECT COUNT(*) as total FROM jobs WHERE user_id = ?',
      [req.user.id]
    );

    // Jobs applied per month (last 6 months)
    const [monthly] = await db.query(
      `SELECT DATE_FORMAT(applied_date, '%Y-%m') as month, COUNT(*) as count
       FROM jobs WHERE user_id = ? AND applied_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`,
      [req.user.id]
    );

    // Upcoming interviews
    const [upcoming] = await db.query(
      `SELECT id, company, position, interview_date FROM jobs
       WHERE user_id = ? AND status = 'interview' AND interview_date > NOW()
       ORDER BY interview_date ASC LIMIT 5`,
      [req.user.id]
    );

    res.json({
      total: total[0].total,
      byStatus: statusCounts,
      monthly,
      upcomingInterviews: upcoming
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const [jobs] = await db.query(
      'SELECT * FROM jobs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (jobs.length === 0) return res.status(404).json({ message: 'Job not found.' });

    // Fetch notes too
    const [notes] = await db.query(
      'SELECT * FROM notes WHERE job_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({ ...jobs[0], notes });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/jobs - Create new job
router.post('/', async (req, res) => {
  const {
    company, position, location, job_url,
    salary_range, status, applied_date, interview_date, priority
  } = req.body;

  if (!company || !position || !applied_date) {
    return res.status(400).json({ message: 'Company, position, and applied date are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO jobs (user_id, company, position, location, job_url, salary_range, status, applied_date, interview_date, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, company, position, location || null,
        job_url || null, salary_range || null,
        status || 'applied', applied_date,
        interview_date || null, priority || 'medium'
      ]
    );

    const [newJob] = await db.query('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
    res.status(201).json(newJob[0]);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: 'Server error creating job.' });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req, res) => {
  const {
    company, position, location, job_url,
    salary_range, status, applied_date, interview_date, priority
  } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT id FROM jobs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) return res.status(404).json({ message: 'Job not found.' });

    await db.query(
      `UPDATE jobs SET company=?, position=?, location=?, job_url=?, salary_range=?,
       status=?, applied_date=?, interview_date=?, priority=? WHERE id = ? AND user_id = ?`,
      [
        company, position, location || null, job_url || null,
        salary_range || null, status, applied_date,
        interview_date || null, priority, req.params.id, req.user.id
      ]
    );

    const [updated] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ message: 'Server error updating job.' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM jobs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Job not found.' });

    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting job.' });
  }
});

// ──────────────────────────────────────────────
// NOTES routes (Unique Feature #3)
// ──────────────────────────────────────────────

// GET /api/jobs/:id/notes
router.get('/:id/notes', async (req, res) => {
  try {
    const [notes] = await db.query(
      'SELECT * FROM notes WHERE job_id = ? AND user_id = ? ORDER BY created_at DESC',
      [req.params.id, req.user.id]
    );
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/jobs/:id/notes
router.post('/:id/notes', async (req, res) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ message: 'Note content is required.' });

  try {
    const [result] = await db.query(
      'INSERT INTO notes (job_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );

    const [note] = await db.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    res.status(201).json(note[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error adding note.' });
  }
});

// DELETE /api/jobs/:id/notes/:noteId
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [req.params.noteId, req.user.id]
    );
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
