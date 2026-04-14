const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// --- Simple token auth middleware ---
const requireAdmin = (req, res, next) => {
  const token = req.query.token || req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>Admin — Unauthorized</title>
        <style>
          body { background: #0d0e10; color: #fdfbfe; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .box { border: 1px solid #69daff33; padding: 40px; text-align: center; }
          h1 { color: #ff716c; font-size: 2rem; margin-bottom: 8px; }
          p { color: #ababad; margin-bottom: 24px; }
          input { background: #181a1c; border: 1px solid #47484a; color: #fff; padding: 10px 16px; border-radius: 4px; width: 280px; font-family: monospace; }
          button { background: linear-gradient(135deg, #69daff, #00cffc); color: #002a35; font-weight: bold; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; margin-left: 8px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>// ACCESS DENIED</h1>
          <p>Admin token required. Provide it as a URL query param: <code>?token=YOUR_TOKEN</code></p>
          <form method="GET" action="/admin">
            <input name="token" placeholder="Enter admin token..." type="password"/>
            <button type="submit">AUTHENTICATE</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }
  next();
};

// --- GET /admin — HTML Dashboard ---
router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    const token = req.query.token;

    const unread = messages.filter(m => !m.read).length;

    const rows = messages.map(m => `
      <tr class="${m.read ? 'read' : 'unread'}">
        <td><span class="badge ${m.read ? 'badge-read' : 'badge-new'}">${m.read ? 'READ' : 'NEW'}</span></td>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td><a href="mailto:${escapeHtml(m.email)}" style="color:#69daff">${escapeHtml(m.email)}</a></td>
        <td>${escapeHtml(m.company || '—')}</td>
        <td><span class="subject-tag">${escapeHtml(m.subject)}</span></td>
        <td class="msg-preview">${escapeHtml(m.message.slice(0, 80))}${m.message.length > 80 ? '…' : ''}</td>
        <td class="date">${new Date(m.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
        <td>
          ${!m.read ? `<a href="/admin/mark-read/${m._id}?token=${token}" class="btn-action btn-mark">✓ Mark Read</a>` : ''}
          <a href="/admin/delete/${m._id}?token=${token}" class="btn-action btn-delete" onclick="return confirm('Delete this message?')">✕ Delete</a>
        </td>
      </tr>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Admin Dashboard — Portfolio</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0d0e10; color: #fdfbfe; font-family: 'Inter', monospace; min-height: 100vh; }

          header {
            background: rgba(13,14,16,0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid #47484a22;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          header .brand { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; }
          header .sub { font-size: 0.7rem; color: #69daff; letter-spacing: 0.15em; text-transform: uppercase; }

          .stats { display: flex; gap: 24px; }
          .stat-card { background: #181a1c; border: 1px solid #47484a22; border-radius: 8px; padding: 12px 20px; text-align: center; }
          .stat-card .num { font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem; font-weight: 700; color: #69daff; }
          .stat-card .lbl { font-size: 0.65rem; color: #ababad; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px; }
          .stat-card.unread .num { color: #89a5ff; }

          main { padding: 40px; }
          h1 { font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }
          .subtitle { color: #ababad; font-size: 0.875rem; margin-bottom: 32px; }

          .table-wrap { overflow-x: auto; border: 1px solid #47484a22; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
          thead { background: #121316; }
          thead th { padding: 14px 16px; text-align: left; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: #757578; border-bottom: 1px solid #47484a22; }
          tbody tr { border-bottom: 1px solid #47484a15; transition: background 0.2s; }
          tbody tr:hover { background: #181a1c; }
          tbody tr.unread { background: #121f22; }
          tbody tr.unread:hover { background: #162530; }
          td { padding: 14px 16px; vertical-align: top; }
          .msg-preview { color: #ababad; max-width: 220px; }
          .date { color: #757578; font-size: 0.75rem; white-space: nowrap; }

          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
          .badge-new { background: #69daff22; color: #69daff; border: 1px solid #69daff44; }
          .badge-read { background: #47484a22; color: #757578; border: 1px solid #47484a; }
          .subject-tag { font-size: 0.7rem; color: #89a5ff; }

          .btn-action { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 0.65rem; font-weight: 600; text-decoration: none; cursor: pointer; margin-right: 6px; transition: all 0.2s; }
          .btn-mark { background: #69daff15; color: #69daff; border: 1px solid #69daff33; }
          .btn-mark:hover { background: #69daff33; }
          .btn-delete { background: #ff716c15; color: #ff716c; border: 1px solid #ff716c33; }
          .btn-delete:hover { background: #ff716c33; }

          .empty { text-align: center; padding: 80px 20px; color: #ababad; }
          .empty .icon { font-size: 3rem; margin-bottom: 16px; }
          .empty p { font-size: 0.875rem; }

          .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .btn-clear { background: #ff716c15; color: #ff716c; border: 1px solid #ff716c33; padding: 8px 16px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-decoration: none; transition: all 0.2s; font-family: monospace; }
          .btn-clear:hover { background: #ff716c33; }
        </style>
      </head>
      <body>
        <header>
          <div>
            <div class="brand">THE ENGINEERING EDITORIAL</div>
            <div class="sub">// Admin Dashboard</div>
          </div>
          <div class="stats">
            <div class="stat-card">
              <div class="num">${messages.length}</div>
              <div class="lbl">Total Messages</div>
            </div>
            <div class="stat-card unread">
              <div class="num">${unread}</div>
              <div class="lbl">Unread</div>
            </div>
          </div>
        </header>
        <main>
          <div class="actions-bar">
            <div>
              <h1>Inbox Transmissions</h1>
              <p class="subtitle">Contact form submissions — sorted by newest first</p>
            </div>
            ${messages.length > 0 ? `<a href="/admin/clear-all?token=${token}" class="btn-clear" onclick="return confirm('Delete ALL messages? This cannot be undone.')">✕ Clear All</a>` : ''}
          </div>

          ${messages.length === 0 ? `
            <div class="empty">
              <div class="icon">📭</div>
              <p>No messages received yet.<br/>The inbox is empty.</p>
            </div>
          ` : `
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Received</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `}
        </main>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('[Admin] Error fetching messages:', err);
    res.status(500).send('<h1>Server error</h1>');
  }
});

// --- GET /admin/mark-read/:id ---
router.get('/mark-read/:id', requireAdmin, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.redirect(`/admin?token=${req.query.token}`);
  } catch (err) {
    res.status(500).send('Error updating message');
  }
});

// --- GET /admin/delete/:id ---
router.get('/delete/:id', requireAdmin, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect(`/admin?token=${req.query.token}`);
  } catch (err) {
    res.status(500).send('Error deleting message');
  }
});

// --- GET /admin/clear-all ---
router.get('/clear-all', requireAdmin, async (req, res) => {
  try {
    await Message.deleteMany({});
    res.redirect(`/admin?token=${req.query.token}`);
  } catch (err) {
    res.status(500).send('Error clearing messages');
  }
});

// --- GET /api/admin/messages (JSON API) ---
router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = router;
