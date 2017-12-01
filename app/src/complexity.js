

module.exports = function(babel) {
    const t = babel.types;

    return {
        visitor: {
            BinaryExpression(path) {
                console.log("Hi!!");
            },
            CallExpression(path) {
                console.log("HI!");
            }
        }
    }
};