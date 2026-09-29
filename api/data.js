// /api/data — same content as data.json, but read from Notion at request time.
// The CDN caches it for 60s (then serves stale while refreshing), so publishing/unpublishing
// in Notion shows up on the live site within about a minute — no redeploy needed.
const { buildData } = require('../build-data');

module.exports = async (req, res) => {
  try {
    const data = await buildData();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (err) {
    console.error('api/data failed:', err.message);
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'Content temporarily unavailable' });
  }
};
