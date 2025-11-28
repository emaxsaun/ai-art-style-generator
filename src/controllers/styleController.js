const {
    styles
} = require('../services/styleService');

function getStyles(req, res) {
    const stylesWithPrompts = styles.map(name => ({
        name,
        prompt: `A portrait image in the style of ${name}`
    }));
    res.json(stylesWithPrompts);
}

module.exports = {
    getStyles
};