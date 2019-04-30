const request = require('request-promise');
const db = require('../../lib/db');
const escape = require('sql-template-strings');
const { json } = require('micro');

module.exports = async (req, res) => {
  const { comment, id, token } = await json(req);
  const existing = await db.query(escape`
  SELECT * FROM guestbook WHERE id = ${id}
  `);
  if (!existing.length) {
    const { avatar_url, login, html_url } = await request({
      uri: 'https://api.github.com/user',
      headers: {
        Authorization: `bearer ${token}`,
        'User-Agent': 'Serverless Guestbook'
      },
      json: true
    });
    await db.query(escape`
    INSERT INTO
    guestbook (id, avatar, url, login, comment, updated)
    VALUES (${id}, ${avatar_url}, ${html_url}, ${login}, ${comment}, ${Date.now()})
  `);
  } else {
    const sign = await db.query(
      escape`UPDATE guestbook
       SET comment = ${comment}
       WHERE id = ${id}`
    );
    console.log('SIGN', sign);
  }
  res.end();
};
