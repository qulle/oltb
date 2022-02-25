const randomNumber = function() {
    return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
}

export { randomNumber };