function notFoundHandler(req, res) {
    res.status(404).json({
        status: 'error',
        message: 'Route tidak ditemukan',
        data: null
    });
}

function errorHandler(err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            status: 'error',
            message: 'Format JSON tidak valid',
            data: null
        });
    }

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        status: 'error',
        message: statusCode === 500 ? 'Terjadi kesalahan pada server' : err.message,
        data: null
    });
}

module.exports = { notFoundHandler, errorHandler };
