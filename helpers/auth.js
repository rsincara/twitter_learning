const isValidPassword = (reqPassword, dbPassword) => {
    return reqPassword === dbPassword;
}

module.exports = {
    isValidPassword,
}