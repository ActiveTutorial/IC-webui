
function transformJson(parsedJson) {
    // Initial structure
    let transformed = { meta: {}, recipes: {} };
    // Rename keys and move meta data
    for (const key in parsedJson) {
        if (key === "items") {
            transformed["elements"] = parsedJson[key];
        } else if (key === "instances") {
            transformed["instances"] = parsedJson[key];
        } else {
            transformed.meta[key] = parsedJson[key];
        }
    }
    // Restructure recipes
    transformed.elements.forEach(element => {
        if (element.from?.every(i => i !== null)) {
            const first = transformed.elements[element.from[0]];
            const second = transformed.elements[element.from[1]];
            if (first || second) {
                transformed.recipes[element.text] = [
                    {
                        text: first.text,
                        emoji: first.emoji
                    },
                    {
                        text: second.text,
                        emoji: second.emoji
                    }
                ];
            }
        }
        delete element.from;
        delete element.id;
    });

    // Reorder object to have "elements" be before "recipes"
    transformed = {
        meta: transformed.meta,
        elements: transformed.elements,
        recipes: transformed.recipes,
        instances: transformed.instances
    };
    return transformed;
}

function decompressData(compressedData) {
    try {
        const decompressedData = pako.inflate(compressedData, { to: 'string' });
        return JSON.parse(decompressedData);
    } catch (error) {
        throw new Error('Error decompressing data: ' + error.message);
    }
}

function processFile() {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        alert('Please select a file');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const compressedData = new Uint8Array(event.target.result);
            const parsedJson = decompressData(compressedData);
            const transformedJson = transformJson(parsedJson);
            const prettyJson = JSON.stringify(transformedJson, null, 4);
            document.getElementById('output').textContent = prettyJson;
            
            const blob = new Blob([prettyJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = url;
            downloadLink.style.display = 'block';
            downloadLink.textContent = 'Download Save File';
        } catch (error) {
            alert(error.message);
            throw error;
        }
    };
    reader.readAsArrayBuffer(fileInput);
}
