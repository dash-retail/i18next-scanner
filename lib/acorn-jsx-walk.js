'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Originally from: https://github.com/sderosiaux/acorn-jsx-walk


var _acornWalk = require('acorn-walk');

//
// Extends acorn walk with JSX elements
//

// See: https://github.com/RReverser/acorn-jsx/issues/23#issuecomment-403753801
Object.assign(_acornWalk.base, {
    FieldDefinition: function FieldDefinition(node, state, callback) {
        if (node.value !== null) {
            callback(node.value, state);
        }
    },
    JSXAttribute: function JSXAttribute(node, state, callback) {
        if (node.value !== null) {
            callback(node.value, state);
        }
    },
    JSXElement: function JSXElement(node, state, callback) {
        node.openingElement.attributes.forEach(function (attribute) {
            callback(attribute, state);
        });
        node.children.forEach(function (node) {
            callback(node, state);
        });
    },
    JSXEmptyExpression: function JSXEmptyExpression(node, state, callback) {
        // Comments. Just ignore.
    },
    JSXExpressionContainer: function JSXExpressionContainer(node, state, callback) {
        callback(node.expression, state);
    },
    JSXFragment: function JSXFragment(node, state, callback) {
        node.children.forEach(function (node) {
            callback(node, state);
        });
    },
    JSXSpreadAttribute: function JSXSpreadAttribute(node, state, callback) {
        callback(node.argument, state);
    },
    JSXText: function JSXText() {}
});

exports.default = function (ast, options) {
    (0, _acornWalk.simple)(ast, _extends({}, options));
};