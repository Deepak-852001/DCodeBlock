async function compileCode() {
    const language = document.getElementById('language').value;
    const difficulty = document.getElementById('difficulty').value;
    const code = document.getElementById('code').value;

    const response = await fetch('/compile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language, difficulty, code })
    });

    const result = await response.text();
    document.getElementById('output').innerText = result;
}
