const copyToClipboard = function(str) {
    const textBox = document.createElement('textarea');
    textBox.value = str;
    textBox.setAttribute('readonly', '');
    textBox.style.position = 'absolute';
    textBox.style.left = '-9999px';

    document.body.appendChild(textBox);

    textBox.select();

    const didCopy = document.execCommand('copy');

    document.body.removeChild(textBox);

    return didCopy;
}

export { copyToClipboard };