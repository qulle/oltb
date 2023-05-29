const randomNumber = function(min = 1, max = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export { randomNumber };