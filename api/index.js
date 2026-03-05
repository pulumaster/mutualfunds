const axios = require('axios');
const CryptoJS = require('crypto-js');

const decrypt = data => {
  const iv = CryptoJS.enc.Hex.parse(data.slice(0, 32));
  const encryptedData = data.slice(32, -32);
  const secret = CryptoJS.enc.Utf8.parse(data.slice(-32));
  const bytes = CryptoJS.AES.decrypt(encryptedData, secret, {
    iv,
    mode: CryptoJS.mode.CBC,
    format: CryptoJS.format.Hex,
  });
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const id = req.query.id || 'RD1548';

  try {
    const response = await axios.get(`https://api.bibit.id/products/${id}`, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Origin': 'https://bibit.id',
        'Referer': 'https://bibit.id/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const decrypted = decrypt(response.data.data);

    return res.json({
      name: decrypted.name,
      nav: decrypted.nav,
      nav_date: decrypted.nav_date,
      return_1y: decrypted.return_1y,
    });

  } catch (error) {
    const message = error.response ? JSON.stringify(error.response.data) : error.message;
    return res.status(500).json({ error: message });
  }
};
