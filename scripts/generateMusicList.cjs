
const fs = require('fs');
const path = require('path');

const musicDir = path.join(__dirname, '../public/Music');
const outputFile = path.join(__dirname, '../src/assets/musicList.json');

// Supported audio extensions
const extensions = ['.mp3', '.flac', '.wav', '.m4a', '.ogg'];

function parseFile(filename) {
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    let name = basename;
    let artist = 'Unknown';

    if (basename.includes(' - ')) {
        const parts = basename.split(' - ');
        if (parts.length >= 2) {
            // Assume the last part is the artist if " - " is used
            // e.g. "Song Name - Artist"
            artist = parts[parts.length - 1];
            name = parts.slice(0, parts.length - 1).join(' - ');
        }
    } else if (basename.includes('-')) {
        // Assume the first part is the artist if "-" is used (without spaces)
        // e.g. "Artist-Song Name"
        const parts = basename.split('-');
        if (parts.length >= 2) {
            artist = parts[0];
            name = parts.slice(1).join('-');
        }
    }

    return {
        name: name.trim(),
        artist: artist.trim(),
        url: `/Music/${filename}`
    };
}

try {
    const files = fs.readdirSync(musicDir);
    const musicList = files
        .filter(file => extensions.includes(path.extname(file).toLowerCase()))
        .map(parseFile);

    fs.writeFileSync(outputFile, JSON.stringify(musicList, null, 2));
    console.log(`Generated music list with ${musicList.length} songs.`);
} catch (e) {
    console.error('Error generating music list:', e);
}
