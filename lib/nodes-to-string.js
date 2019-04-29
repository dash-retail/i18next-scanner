'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isJSXText = function isJSXText(node) {
    if (!node) {
        return false;
    }

    return node.type === 'JSXText';
};

var isNumericLiteral = function isNumericLiteral(node) {
    if (!node) {
        return false;
    }

    return node.type === 'Literal' && typeof node.value === 'number';
};

var isStringLiteral = function isStringLiteral(node) {
    if (!node) {
        return false;
    }

    return node.type === 'Literal' && typeof node.value === 'string';
};

var isObjectExpression = function isObjectExpression(node) {
    if (!node) {
        return false;
    }

    return node.type === 'ObjectExpression';
};

var nodesToString = function nodesToString(nodes) {
    var memo = '';
    var nodeIndex = 0;
    nodes.forEach(function (node, i) {
        if (isJSXText(node) || isStringLiteral(node)) {
            var value = node.value.replace(/^[\r\n]+\s*/g, '') // remove leading spaces containing a leading newline character
            .replace(/[\r\n]+\s*$/g, '') // remove trailing spaces containing a leading newline character
            .replace(/[\r\n]+\s*/g, ' '); // replace spaces containing a leading newline character with a single space character

            if (!value) {
                return;
            }
            memo += value;
        } else if (node.type === 'JSXExpressionContainer') {
            var _node$expression = node.expression,
                expression = _node$expression === undefined ? {} : _node$expression;


            if (isNumericLiteral(expression)) {
                // Numeric literal is ignored in react-i18next
                memo += '';
            }if (isStringLiteral(expression)) {
                memo += expression.value;
            } else if (isObjectExpression(expression) && (0, _get3.default)(expression, 'properties[0].type') === 'Property') {
                memo += '<' + nodeIndex + '>{{' + expression.properties[0].key.name + '}}</' + nodeIndex + '>';
            } else {
                console.error('Unsupported JSX expression. Only static values or {{interpolation}} blocks are supported. Got ' + expression.type + ':');
                console.error(node.expression);
            }
        } else if (node.children) {
            memo += '<' + nodeIndex + '>' + nodesToString(node.children) + '</' + nodeIndex + '>';
        }

        ++nodeIndex;
    });

    return memo;
};

exports.default = nodesToString;