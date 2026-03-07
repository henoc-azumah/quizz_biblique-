const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/david/Documents/quizz_biblique-/bible_lsg.json';
const content = fs.readFileSync(filePath, 'utf8');

// The content is not valid JSON, but it looks like a JS object literal.
// We can try to evaluate it as an expression.
// Wrapping in parens to make it an expression.
try {
    const data = eval('(' + content + ')');
    const fixedPath = 'c:/Users/david/Documents/quizz_biblique-/bible_lsg_fixed.json';
    fs.writeFileSync(fixedPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Successfully saved valid JSON to bible_lsg_fixed.json');

    // Also log book names for my reference
    const bookNames = [];
    data.Testaments.forEach(t => {
        t.Books.forEach(b => {
            bookNames.push(b.Text);
        });
    });
    console.log('Total Books:', bookNames.length);
    console.log('Book Names:', bookNames.join(', '));
} catch (e) {
    console.error('Error evaluating or saving:', e);
}
