function cekApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            status: 'error',
            message: 'API key tidak valid',
            data: null
        });
    }

    next();
}

module.exports = cekApiKey;
