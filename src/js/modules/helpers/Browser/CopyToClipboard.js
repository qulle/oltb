const copyToClipboard = async function(text = '') {
    return navigator.clipboard.writeText(text.trim())
        .then(() => {
            return true;
        })
        .catch(error => {
            console.error(`Error copying data ${[error]}`);
            return false;
        });
}

export { copyToClipboard };