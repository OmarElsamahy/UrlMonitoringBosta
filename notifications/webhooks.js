const axios = require('axios');

const webHook = async (urlWebHook, data) => {
    const url = data.website;
    const urlStatus = data.statusMessage;
    const statusCode = data.statusCode;
    await axios.post(urlWebHook, {
        url,
        urlStatus,
        statusCode,
    });
};

module.exports = webHook;