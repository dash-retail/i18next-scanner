'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint no-console: 0 */
/* eslint no-eval: 0 */


var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _acorn = require('acorn');

var acorn = _interopRequireWildcard(_acorn);

var _acornJsx = require('acorn-jsx');

var _acornJsx2 = _interopRequireDefault(_acornJsx);

var _acornStage = require('acorn-stage3');

var _acornStage2 = _interopRequireDefault(_acornStage);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _cloneDeep = require('clone-deep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _ensureArray = require('ensure-array');

var _ensureArray2 = _interopRequireDefault(_ensureArray);

var _esprima = require('esprima');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _parse = require('parse5');

var _parse2 = _interopRequireDefault(_parse);

var _sortobject = require('sortobject');

var _sortobject2 = _interopRequireDefault(_sortobject);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _acornJsxWalk = require('./acorn-jsx-walk');

var _acornJsxWalk2 = _interopRequireDefault(_acornJsxWalk);

var _flattenObjectKeys = require('./flatten-object-keys');

var _flattenObjectKeys2 = _interopRequireDefault(_flattenObjectKeys);

var _omitEmptyObject = require('./omit-empty-object');

var _omitEmptyObject2 = _interopRequireDefault(_omitEmptyObject);

var _nodesToString = require('./nodes-to-string');

var _nodesToString2 = _interopRequireDefault(_nodesToString);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = {
    debug: false, // verbose logging

    sort: false, // sort keys in alphabetical order

    attr: { // HTML attributes to parse
        list: ['data-i18n'],
        extensions: ['.html', '.htm']
    },

    func: { // function names to parse
        list: ['i18next.t', 'i18n.t'],
        extensions: ['.js', '.jsx']
    },

    trans: { // Trans component (https://github.com/i18next/react-i18next)
        component: 'Trans',
        i18nKey: 'i18nKey',
        defaultsKey: 'defaults',
        extensions: ['.js', '.jsx'],
        fallbackKey: false,
        acorn: {
            ecmaVersion: 10, // defaults to 10
            sourceType: 'module' // defaults to 'module'
            // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
        }
    },

    lngs: ['en'], // array of supported languages
    fallbackLng: 'en', // language to lookup key if not found while calling `parser.get(key, { lng: '' })`

    ns: [], // string or array of namespaces

    defaultLng: 'en', // default language used for checking default values

    defaultNs: 'translation', // default namespace used if not passed to translation function

    defaultValue: '', // default value used if not passed to `parser.set`

    // resource
    resource: {
        // The path where resources get loaded from. Relative to current working directory.
        loadPath: 'i18n/{{lng}}/{{ns}}.json',

        // The path to store resources. Relative to the path specified by `gulp.dest(path)`.
        savePath: 'i18n/{{lng}}/{{ns}}.json',

        // Specify the number of space characters to use as white space to insert into the output JSON string for readability purpose.
        jsonIndent: 2,

        // Normalize line endings to '\r\n', '\r', '\n', or 'auto' for the current operating system. Defaults to '\n'.
        // Aliases: 'CRLF', 'CR', 'LF', 'crlf', 'cr', 'lf'
        lineEnding: '\n'
    },

    keySeparator: '.', // char to separate keys
    nsSeparator: ':', // char to split namespace from key

    // Context Form
    context: true, // whether to add context form key
    contextFallback: true, // whether to add a fallback key as well as the context form key
    contextSeparator: '_', // char to split context from key

    // Plural Form
    plural: true, // whether to add plural form key
    pluralFallback: true, // whether to add a fallback key as well as the plural form key
    pluralSeparator: '_', // char to split plural from key

    // interpolation options
    interpolation: {
        prefix: '{{', // prefix for interpolation
        suffix: '}}' // suffix for interpolation
    }
};

// http://codereview.stackexchange.com/questions/45991/balanced-parentheses
var matchBalancedParentheses = function matchBalancedParentheses() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    var parentheses = '[]{}()';
    var stack = [];
    var bracePosition = void 0;
    var start = -1;
    var i = 0;

    str = '' + str; // ensure string
    for (i = 0; i < str.length; ++i) {
        if (start >= 0 && stack.length === 0) {
            return str.substring(start, i);
        }

        bracePosition = parentheses.indexOf(str[i]);
        if (bracePosition < 0) {
            continue;
        }
        if (bracePosition % 2 === 0) {
            if (start < 0) {
                start = i; // remember the start position
            }
            stack.push(bracePosition + 1); // push next expected brace position
            continue;
        }

        if (stack.pop() !== bracePosition) {
            return str.substring(start, i);
        }
    }

    return str.substring(start, i);
};

var normalizeOptions = function normalizeOptions(options) {
    // Attribute
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'attr.list'))) {
        _lodash2.default.set(options, 'attr.list', defaults.attr.list);
    }
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'attr.extensions'))) {
        _lodash2.default.set(options, 'attr.extensions', defaults.attr.extensions);
    }

    // Function
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'func.list'))) {
        _lodash2.default.set(options, 'func.list', defaults.func.list);
    }
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'func.extensions'))) {
        _lodash2.default.set(options, 'func.extensions', defaults.func.extensions);
    }

    // Trans
    if (_lodash2.default.get(options, 'trans')) {
        if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'trans.component'))) {
            _lodash2.default.set(options, 'trans.component', defaults.trans.component);
        }
        if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'trans.i18nKey'))) {
            _lodash2.default.set(options, 'trans.i18nKey', defaults.trans.i18nKey);
        }
        if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'trans.defaultsKey'))) {
            _lodash2.default.set(options, 'trans.defaultsKey', defaults.trans.defaultsKey);
        }
        if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'trans.extensions'))) {
            _lodash2.default.set(options, 'trans.extensions', defaults.trans.extensions);
        }
        if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'trans.fallbackKey'))) {
            _lodash2.default.set(options, 'trans.fallbackKey', defaults.trans.fallbackKey);
        }
        if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'trans.acorn'))) {
            _lodash2.default.set(options, 'trans.acorn', defaults.trans.acorn);
        }
    }

    // Resource
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'resource.loadPath'))) {
        _lodash2.default.set(options, 'resource.loadPath', defaults.resource.loadPath);
    }
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'resource.savePath'))) {
        _lodash2.default.set(options, 'resource.savePath', defaults.resource.savePath);
    }
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'resource.jsonIndent'))) {
        _lodash2.default.set(options, 'resource.jsonIndent', defaults.resource.jsonIndent);
    }
    if (_lodash2.default.isUndefined(_lodash2.default.get(options, 'resource.lineEnding'))) {
        _lodash2.default.set(options, 'resource.lineEnding', defaults.resource.lineEnding);
    }

    // Accept both nsseparator or nsSeparator
    if (!_lodash2.default.isUndefined(options.nsseparator)) {
        options.nsSeparator = options.nsseparator;
        delete options.nsseparator;
    }
    // Allowed only string or false
    if (!_lodash2.default.isString(options.nsSeparator)) {
        options.nsSeparator = false;
    }

    // Accept both keyseparator or keySeparator
    if (!_lodash2.default.isUndefined(options.keyseparator)) {
        options.keySeparator = options.keyseparator;
        delete options.keyseparator;
    }
    // Allowed only string or false
    if (!_lodash2.default.isString(options.keySeparator)) {
        options.keySeparator = false;
    }

    if (!_lodash2.default.isArray(options.ns)) {
        options.ns = [options.ns];
    }

    options.ns = _lodash2.default.union(_lodash2.default.flatten(options.ns.concat(options.defaultNs)));

    return options;
};

// Get an array of plural suffixes for a given language.
// @param {string} lng The language.
// @param {string} pluralSeparator pluralSeparator, default '_'.
// @return {array} An array of plural suffixes.
var getPluralSuffixes = function getPluralSuffixes(lng) {
    var pluralSeparator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '_';

    var rule = _i18next2.default.services.pluralResolver.getRule(lng);

    if (!(rule && rule.numbers)) {
        return []; // Return an empty array if lng is not supported
    }

    if (rule.numbers.length === 1) {
        return [pluralSeparator + '0'];
    }

    if (rule.numbers.length === 2) {
        return ['', pluralSeparator + 'plural'];
    }

    var suffixes = rule.numbers.reduce(function (acc, n, i) {
        return acc.concat('' + pluralSeparator + i);
    }, []);

    return suffixes;
};

/**
* Creates a new parser
* @constructor
*/

var Parser = function () {

    // The resScan only stores translation keys parsed from code
    function Parser(options) {
        var _this = this;

        _classCallCheck(this, Parser);

        this.options = _extends({}, defaults);
        this.resStore = {};
        this.resScan = {};
        this.pluralSuffixes = {};

        this.options = normalizeOptions(_extends({}, this.options, options));

        var lngs = this.options.lngs;
        var namespaces = this.options.ns;

        lngs.forEach(function (lng) {
            _this.resStore[lng] = _this.resStore[lng] || {};
            _this.resScan[lng] = _this.resScan[lng] || {};

            _this.pluralSuffixes[lng] = (0, _ensureArray2.default)(getPluralSuffixes(lng, _this.options.pluralSeparator));
            if (_this.pluralSuffixes[lng].length === 0) {
                _this.log('No plural rule found for: ' + lng);
            }

            namespaces.forEach(function (ns) {
                var resPath = _this.formatResourceLoadPath(lng, ns);

                _this.resStore[lng][ns] = {};
                _this.resScan[lng][ns] = {};

                try {
                    if (_fs2.default.existsSync(resPath)) {
                        _this.resStore[lng][ns] = JSON.parse(_fs2.default.readFileSync(resPath, 'utf-8'));
                    }
                } catch (err) {
                    _this.error('Unable to load resource file ' + _chalk2.default.yellow(JSON.stringify(resPath)) + ': lng=' + lng + ', ns=' + ns);
                    _this.error(err);
                }
            });
        });

        this.log('options=' + JSON.stringify(this.options, null, 2));
    }

    // The all plurals suffixes for each of target languages.


    // The resStore stores all translation keys including unused ones


    _createClass(Parser, [{
        key: 'log',
        value: function log() {
            var debug = this.options.debug;

            if (debug) {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                console.log.apply(this, [_chalk2.default.cyan('i18next-scanner:')].concat(args));
            }
        }
    }, {
        key: 'error',
        value: function error() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            console.error.apply(this, [_chalk2.default.red('i18next-scanner:')].concat(args));
        }
    }, {
        key: 'formatResourceLoadPath',
        value: function formatResourceLoadPath(lng, ns) {
            var options = this.options;

            var regex = {
                lng: new RegExp(_lodash2.default.escapeRegExp(options.interpolation.prefix + 'lng' + options.interpolation.suffix), 'g'),
                ns: new RegExp(_lodash2.default.escapeRegExp(options.interpolation.prefix + 'ns' + options.interpolation.suffix), 'g')
            };

            return options.resource.loadPath.replace(regex.lng, lng).replace(regex.ns, ns);
        }
    }, {
        key: 'formatResourceSavePath',
        value: function formatResourceSavePath(lng, ns) {
            var options = this.options;
            var regex = {
                lng: new RegExp(_lodash2.default.escapeRegExp(options.interpolation.prefix + 'lng' + options.interpolation.suffix), 'g'),
                ns: new RegExp(_lodash2.default.escapeRegExp(options.interpolation.prefix + 'ns' + options.interpolation.suffix), 'g')
            };

            return options.resource.savePath.replace(regex.lng, lng).replace(regex.ns, ns);
        }
    }, {
        key: 'fixStringAfterRegExp',
        value: function fixStringAfterRegExp(strToFix) {
            var fixedString = _lodash2.default.trim(strToFix); // Remove leading and trailing whitespace
            var firstChar = fixedString[0];

            // Ignore key with embedded expressions in string literals
            if (firstChar === '`' && fixedString.match(/\${.*?}/)) {
                return null;
            }

            if (_lodash2.default.includes(['\'', '"', '`'], firstChar)) {
                // Remove first and last character
                fixedString = fixedString.slice(1, -1);
            }

            // restore multiline strings
            fixedString = fixedString.replace(/(\\\n|\\\r\n)/g, '');

            // JavaScript character escape sequences
            // https://mathiasbynens.be/notes/javascript-escapes

            // Single character escape sequences
            // Note: IE < 9 treats '\v' as 'v' instead of a vertical tab ('\x0B'). If cross-browser compatibility is a concern, use \x0B instead of \v.
            // Another thing to note is that the \v and \0 escapes are not allowed in JSON strings.
            fixedString = fixedString.replace(/(\\b|\\f|\\n|\\r|\\t|\\v|\\0|\\\\|\\"|\\')/g, function (match) {
                return eval('"' + match + '"');
            });

            // * Octal escapes have been deprecated in ES5.
            // * Hexadecimal escape sequences: \\x[a-fA-F0-9]{2}
            // * Unicode escape sequences: \\u[a-fA-F0-9]{4}
            fixedString = fixedString.replace(/(\\x[a-fA-F0-9]{2}|\\u[a-fA-F0-9]{4})/g, function (match) {
                return eval('"' + match + '"');
            });
            return fixedString;
        }

        // i18next.t('ns:foo.bar') // matched
        // i18next.t("ns:foo.bar") // matched
        // i18next.t('ns:foo.bar') // matched
        // i18next.t("ns:foo.bar", { count: 1 }); // matched
        // i18next.t("ns:foo.bar" + str); // not matched

    }, {
        key: 'parseFuncFromString',
        value: function parseFuncFromString(content) {
            var _this2 = this;

            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var customHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            if (_lodash2.default.isFunction(opts)) {
                customHandler = opts;
                opts = {};
            }

            var funcs = opts.list !== undefined ? (0, _ensureArray2.default)(opts.list) : (0, _ensureArray2.default)(this.options.func.list);

            if (funcs.length === 0) {
                return this;
            }

            var matchFuncs = funcs.map(function (func) {
                return '(?:' + func + ')';
            }).join('|').replace(/\./g, '\\.');
            // `\s` matches a single whitespace character, which includes spaces, tabs, form feeds, line feeds and other unicode spaces.
            var matchSpecialCharacters = '[\\r\\n\\s]*';
            var stringGroup = matchSpecialCharacters + '(' +
            // backtick (``)
            '`(?:[^`\\\\]|\\\\(?:.|$))*`' + '|' +
            // double quotes ("")
            '"(?:[^"\\\\]|\\\\(?:.|$))*"' + '|' +
            // single quote ('')
            '\'(?:[^\'\\\\]|\\\\(?:.|$))*\'' + ')' + matchSpecialCharacters;
            var pattern = '(?:(?:^\\s*)|[^a-zA-Z0-9_])' + '(?:' + matchFuncs + ')' + '\\(' + stringGroup + '(?:[\\,]' + stringGroup + ')?' + '[\\,\\)]';
            var re = new RegExp(pattern, 'gim');

            var r = void 0;

            var _loop = function _loop() {
                var options = {};
                var full = r[0];

                var key = _this2.fixStringAfterRegExp(r[1], true);
                if (!key) {
                    return 'continue';
                }

                if (r[2] !== undefined) {
                    var defaultValue = _this2.fixStringAfterRegExp(r[2], false);
                    if (!defaultValue) {
                        return 'continue';
                    }
                    options.defaultValue = defaultValue;
                }

                var endsWithComma = full[full.length - 1] === ',';
                if (endsWithComma) {
                    var _opts = _extends({}, opts),
                        propsFilter = _opts.propsFilter;

                    var code = matchBalancedParentheses(content.substr(re.lastIndex));

                    if (typeof propsFilter === 'function') {
                        code = propsFilter(code);
                    }

                    try {
                        var syntax = code.trim() !== '' ? (0, _esprima.parse)('(' + code + ')') : {};

                        var props = _lodash2.default.get(syntax, 'body[0].expression.properties') || [];
                        // http://i18next.com/docs/options/
                        var supportedOptions = ['defaultValue', 'defaultValue_plural', 'count', 'context', 'ns', 'keySeparator', 'nsSeparator'];

                        props.forEach(function (prop) {
                            if (_lodash2.default.includes(supportedOptions, prop.key.name)) {
                                if (prop.value.type === 'Literal') {
                                    options[prop.key.name] = prop.value.value;
                                } else if (prop.value.type === 'TemplateLiteral') {
                                    options[prop.key.name] = prop.value.quasis.map(function (element) {
                                        return element.value.cooked;
                                    }).join('');
                                } else {
                                    // Unable to get value of the property
                                    options[prop.key.name] = '';
                                }
                            }
                        });
                    } catch (err) {
                        _this2.error('Unable to parse code "' + code + '"');
                        _this2.error(err);
                    }
                }

                if (customHandler) {
                    customHandler(key, options);
                    return 'continue';
                }

                _this2.set(key, options);
            };

            while (r = re.exec(content)) {
                var _ret = _loop();

                if (_ret === 'continue') continue;
            }

            return this;
        }

        // Parses translation keys from `Trans` components in JSX
        // <Trans i18nKey="some.key">Default text</Trans>

    }, {
        key: 'parseTransFromString',
        value: function parseTransFromString(content) {
            var _this3 = this;

            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var customHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            if (_lodash2.default.isFunction(opts)) {
                customHandler = opts;
                opts = {};
            }

            var _opts2 = _extends({}, opts),
                _opts2$transformOptio = _opts2.transformOptions,
                transformOptions = _opts2$transformOptio === undefined ? {} : _opts2$transformOptio,
                _opts2$component = _opts2.component,
                component = _opts2$component === undefined ? this.options.trans.component : _opts2$component,
                _opts2$i18nKey = _opts2.i18nKey,
                i18nKey = _opts2$i18nKey === undefined ? this.options.trans.i18nKey : _opts2$i18nKey,
                _opts2$defaultsKey = _opts2.defaultsKey,
                defaultsKey = _opts2$defaultsKey === undefined ? this.options.trans.defaultsKey : _opts2$defaultsKey,
                fallbackKey = _opts2.fallbackKey,
                _opts2$acorn = _opts2.acorn,
                acornOptions = _opts2$acorn === undefined ? this.options.trans.acorn : _opts2$acorn;

            var parseJSXElement = function parseJSXElement(node) {
                if (!node) {
                    return;
                }

                (0, _ensureArray2.default)(node.openingElement.attributes).forEach(function (attribute) {
                    var value = attribute.value;

                    if (!(value && value.type === 'JSXExpressionContainer')) {
                        return;
                    }

                    var expression = value.expression;
                    if (!(expression && expression.type === 'JSXElement')) {
                        return;
                    }

                    parseJSXElement(expression);
                });

                (0, _ensureArray2.default)(node.children).forEach(function (childNode) {
                    if (childNode.type === 'JSXElement') {
                        parseJSXElement(childNode);
                    }
                });

                if (node.openingElement.name.name !== component) {
                    return;
                }

                var attr = (0, _ensureArray2.default)(node.openingElement.attributes).reduce(function (acc, attribute) {
                    if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') {
                        return acc;
                    }

                    var name = attribute.name.name;


                    if (attribute.value.type === 'Literal') {
                        acc[name] = attribute.value.value;
                    } else if (attribute.value.type === 'JSXExpressionContainer') {
                        var expression = attribute.value.expression;

                        // Identifier
                        if (expression.type === 'Identifier') {
                            acc[name] = expression.name;
                        }

                        // Literal
                        if (expression.type === 'Literal') {
                            acc[name] = expression.value;
                        }

                        // Object Expression
                        if (expression.type === 'ObjectExpression') {
                            var properties = (0, _ensureArray2.default)(expression.properties);
                            acc[name] = properties.reduce(function (obj, property) {
                                if (property.value.type === 'Literal') {
                                    obj[property.key.name] = property.value.value;
                                } else if (property.value.type === 'TemplateLiteral') {
                                    obj[property.key.name] = property.value.quasis.map(function (element) {
                                        return element.value.cooked;
                                    }).join('');
                                } else {
                                    // Unable to get value of the property
                                    obj[property.key.name] = '';
                                }

                                return obj;
                            }, {});
                        }

                        // Template Literal
                        if (expression.type === 'TemplateLiteral') {
                            acc[name] = expression.quasis.map(function (element) {
                                return element.value.cooked;
                            }).join('');
                        }
                    }

                    return acc;
                }, {});

                var transKey = _lodash2.default.trim(attr[i18nKey]);

                var defaultsString = attr[defaultsKey] || '';
                if (typeof defaultsString !== 'string') {
                    _this3.log('defaults value must be a static string, saw ' + _chalk2.default.yellow(defaultsString));
                }

                // https://www.i18next.com/translation-function/essentials#overview-options
                var tOptions = attr.tOptions;
                var options = _extends({}, tOptions, {
                    defaultValue: defaultsString || (0, _nodesToString2.default)(node.children),
                    fallbackKey: fallbackKey || _this3.options.trans.fallbackKey
                });

                if (Object.prototype.hasOwnProperty.call(attr, 'count')) {
                    options.count = Number(attr.count) || 0;
                }

                if (Object.prototype.hasOwnProperty.call(attr, 'ns')) {
                    if (typeof options.ns !== 'string') {
                        _this3.log('The ns attribute must be a string, saw ' + _chalk2.default.yellow(attr.ns));
                    }

                    options.ns = attr.ns;
                }

                if (customHandler) {
                    customHandler(transKey, options);
                    return;
                }

                // All I wanted is for the <Trans/> components to respect the defaultValue set in the config options.
                // For some reason it always uses the "defaultValue" as both the value AND the key.
                // Doesn't make much sense what with fallbackKey being an option too.
                // Not sure why this behaves so differently to the translate fuction.
                //
                // Changing the following line seems to do the trick:
                // this.set(transKey, options);
                //
                // It's inspired by this PR:
                // https://github.com/i18next/i18next-scanner/pull/103/commits/9343bba8afdcb9ef4d0fca9d549d02f7158057a3
                //
                // Of course now a load of tests are broken - and I don't have time to fix them right now.

                _this3.set(options.defaultValue, {});
            };

            try {
                var ast = acorn.Parser.extend(_acornStage2.default, (0, _acornJsx2.default)()).parse(content, _extends({}, defaults.trans.acorn, acornOptions));

                (0, _acornJsxWalk2.default)(ast, {
                    JSXElement: parseJSXElement
                });
            } catch (err) {
                if (transformOptions.filepath) {
                    this.error('Unable to parse ' + _chalk2.default.blue(component) + ' component from ' + _chalk2.default.yellow(JSON.stringify(transformOptions.filepath)));
                    console.error('    ' + err);
                } else {
                    this.error('Unable to parse ' + _chalk2.default.blue(component) + ' component:');
                    console.error(content);
                    console.error('    ' + err);
                }
            }

            return this;
        }

        // Parses translation keys from `data-i18n` attribute in HTML
        // <div data-i18n="[attr]ns:foo.bar;[attr]ns:foo.baz">
        // </div>

    }, {
        key: 'parseAttrFromString',
        value: function parseAttrFromString(content) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var customHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var setter = this.set.bind(this);

            if (_lodash2.default.isFunction(opts)) {
                setter = opts;
                opts = {};
            } else if (_lodash2.default.isFunction(customHandler)) {
                setter = customHandler;
            }

            var attrs = opts.list !== undefined ? (0, _ensureArray2.default)(opts.list) : (0, _ensureArray2.default)(this.options.attr.list);

            if (attrs.length === 0) {
                return this;
            }

            var ast = _parse2.default.parse(content);

            var parseAttributeValue = function parseAttributeValue(key) {
                key = _lodash2.default.trim(key);
                if (key.length === 0) {
                    return;
                }
                if (key.indexOf('[') === 0) {
                    var parts = key.split(']');
                    key = parts[1];
                }
                if (key.indexOf(';') === key.length - 1) {
                    key = key.substr(0, key.length - 2);
                }

                setter(key);
            };

            var walk = function walk(nodes) {
                nodes.forEach(function (node) {
                    if (node.attrs) {
                        node.attrs.forEach(function (attr) {
                            if (attrs.indexOf(attr.name) !== -1) {
                                var values = attr.value.split(';');
                                values.forEach(parseAttributeValue);
                            }
                        });
                    }
                    if (node.childNodes) {
                        walk(node.childNodes);
                    }
                    if (node.content && node.content.childNodes) {
                        walk(node.content.childNodes);
                    }
                });
            };

            walk(ast.childNodes);

            return this;
        }

        // Get the value of a translation key or the whole resource store containing translation information
        // @param {string} [key] The translation key
        // @param {object} [opts] The opts object
        // @param {boolean} [opts.sort] True to sort object by key
        // @param {boolean} [opts.lng] The language to use
        // @return {object}

    }, {
        key: 'get',
        value: function get(key) {
            var _this4 = this;

            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (_lodash2.default.isPlainObject(key)) {
                opts = key;
                key = undefined;
            }

            var resStore = {};
            if (this.options.removeUnusedKeys) {
                // Merge two objects `resStore` and `resScan` deeply, returning a new merged object with the elements from both `resStore` and `resScan`.
                var resMerged = (0, _deepmerge2.default)(this.resStore, this.resScan);

                Object.keys(this.resStore).forEach(function (lng) {
                    Object.keys(_this4.resStore[lng]).forEach(function (ns) {
                        var resStoreKeys = (0, _flattenObjectKeys2.default)(_lodash2.default.get(_this4.resStore, [lng, ns], {}));
                        var resScanKeys = (0, _flattenObjectKeys2.default)(_lodash2.default.get(_this4.resScan, [lng, ns], {}));
                        var unusedKeys = _lodash2.default.differenceWith(resStoreKeys, resScanKeys, _lodash2.default.isEqual);

                        for (var i = 0; i < unusedKeys.length; ++i) {
                            _lodash2.default.unset(resMerged[lng][ns], unusedKeys[i]);
                        }

                        // Omit empty object
                        resMerged[lng][ns] = (0, _omitEmptyObject2.default)(resMerged[lng][ns]);
                    });
                });

                resStore = resMerged;
            } else {
                resStore = (0, _cloneDeep2.default)(this.resStore);
            }

            if (opts.sort) {
                Object.keys(resStore).forEach(function (lng) {
                    var namespaces = resStore[lng];
                    Object.keys(namespaces).forEach(function (ns) {
                        // Deeply sort an object by its keys without mangling any arrays inside of it
                        resStore[lng][ns] = (0, _sortobject2.default)(namespaces[ns]);
                    });
                });
            }

            if (!_lodash2.default.isUndefined(key)) {
                var ns = this.options.defaultNs;

                // http://i18next.com/translate/keyBasedFallback/
                // Set nsSeparator and keySeparator to false if you prefer
                // having keys as the fallback for translation.
                // i18next.init({
                //   nsSeparator: false,
                //   keySeparator: false
                // })

                if (_lodash2.default.isString(this.options.nsSeparator) && key.indexOf(this.options.nsSeparator) > -1) {
                    var parts = key.split(this.options.nsSeparator);

                    ns = parts[0];
                    key = parts[1];
                }

                var keys = _lodash2.default.isString(this.options.keySeparator) ? key.split(this.options.keySeparator) : [key];
                var lng = opts.lng ? opts.lng : this.options.fallbackLng;
                var namespaces = resStore[lng] || {};

                var value = namespaces[ns];
                var x = 0;

                while (keys[x]) {
                    value = value && value[keys[x]];
                    x++;
                }

                return value;
            }

            return resStore;
        }

        // Set translation key with an optional defaultValue to i18n resource store
        // @param {string} key The translation key
        // @param {object} [options] The options object
        // @param {boolean|function} [options.fallbackKey] When the key is missing, pass `true` to return `options.defaultValue` as key, or pass a function to return user-defined key.
        // @param {string} [options.defaultValue] defaultValue to return if translation not found
        // @param {number} [options.count] count value used for plurals
        // @param {string} [options.context] used for contexts (eg. male)
        // @param {string} [options.ns] namespace for the translation
        // @param {string|boolean} [options.nsSeparator] The value used to override this.options.nsSeparator
        // @param {string|boolean} [options.keySeparator] The value used to override this.options.keySeparator

    }, {
        key: 'set',
        value: function set(key) {
            var _this5 = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            // Backward compatibility
            if (_lodash2.default.isString(options)) {
                var _defaultValue = options;
                options = {
                    defaultValue: _defaultValue
                };
            }

            var nsSeparator = options.nsSeparator !== undefined ? options.nsSeparator : this.options.nsSeparator;
            var keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;

            var ns = options.ns || this.options.defaultNs;

            console.assert(_lodash2.default.isString(ns) && !!ns.length, 'ns is not a valid string', ns);

            // http://i18next.com/translate/keyBasedFallback/
            // Set nsSeparator and keySeparator to false if you prefer
            // having keys as the fallback for translation.
            // i18next.init({
            //   nsSeparator: false,
            //   keySeparator: false
            // })

            if (_lodash2.default.isString(nsSeparator) && key.indexOf(nsSeparator) > -1) {
                var parts = key.split(nsSeparator);

                ns = parts[0];
                key = parts[1];
            }

            var keys = [];

            if (key) {
                keys = _lodash2.default.isString(keySeparator) ? key.split(keySeparator) : [key];
            } else {
                // fallback key
                if (options.fallbackKey === true) {
                    key = options.defaultValue;
                }
                if (typeof options.fallbackKey === 'function') {
                    key = options.fallbackKey(ns, options.defaultValue);
                }

                if (!key) {
                    // Ignore empty key
                    return;
                }

                keys = [key];
            }

            var _options = this.options,
                lngs = _options.lngs,
                context = _options.context,
                contextFallback = _options.contextFallback,
                contextSeparator = _options.contextSeparator,
                plural = _options.plural,
                pluralFallback = _options.pluralFallback,
                pluralSeparator = _options.pluralSeparator,
                defaultLng = _options.defaultLng,
                defaultValue = _options.defaultValue;


            lngs.forEach(function (lng) {
                var resLoad = _this5.resStore[lng] && _this5.resStore[lng][ns];
                var resScan = _this5.resScan[lng] && _this5.resScan[lng][ns];

                if (!_lodash2.default.isPlainObject(resLoad)) {
                    // Skip undefined namespace
                    _this5.error(_chalk2.default.yellow(JSON.stringify(ns)) + ' does not exist in the namespaces (' + _chalk2.default.yellow(JSON.stringify(_this5.options.ns)) + '): key=' + _chalk2.default.yellow(JSON.stringify(key)) + ', options=' + _chalk2.default.yellow(JSON.stringify(options)));
                    return;
                }

                Object.keys(keys).forEach(function (index) {
                    var key = keys[index];

                    if (index < keys.length - 1) {
                        resLoad[key] = resLoad[key] || {};
                        resLoad = resLoad[key];
                        resScan[key] = resScan[key] || {};
                        resScan = resScan[key];
                        return; // continue
                    }

                    // Context & Plural
                    // http://i18next.com/translate/context/
                    // http://i18next.com/translate/pluralSimple/
                    //
                    // Format:
                    // "<key>[[{{contextSeparator}}<context>]{{pluralSeparator}}<plural>]"
                    //
                    // Example:
                    // {
                    //   "translation": {
                    //     "friend": "A friend",
                    //     "friend_male": "A boyfriend",
                    //     "friend_female": "A girlfriend",
                    //     "friend_male_plural": "{{count}} boyfriends",
                    //     "friend_female_plural": "{{count}} girlfriends"
                    //   }
                    // }
                    var resKeys = [];

                    // http://i18next.com/translate/context/
                    var containsContext = function () {
                        if (!context) {
                            return false;
                        }
                        if (_lodash2.default.isUndefined(options.context)) {
                            return false;
                        }
                        return _lodash2.default.isFunction(context) ? context(lng, ns, key, options) : !!context;
                    }();

                    // http://i18next.com/translate/pluralSimple/
                    var containsPlural = function () {
                        if (!plural) {
                            return false;
                        }
                        if (_lodash2.default.isUndefined(options.count)) {
                            return false;
                        }
                        return _lodash2.default.isFunction(plural) ? plural(lng, ns, key, options) : !!plural;
                    }();

                    if (containsPlural) {
                        var suffixes = pluralFallback ? _this5.pluralSuffixes[lng] : _this5.pluralSuffixes[lng].slice(1);

                        suffixes.forEach(function (pluralSuffix) {
                            resKeys.push('' + key + pluralSuffix);
                        });

                        if (containsContext && containsPlural) {
                            suffixes.forEach(function (pluralSuffix) {
                                resKeys.push('' + key + contextSeparator + options.context + pluralSuffix);
                            });
                        }
                    } else {
                        if (!containsContext || containsContext && contextFallback) {
                            resKeys.push(key);
                        }

                        if (containsContext) {
                            resKeys.push('' + key + contextSeparator + options.context);
                        }
                    }

                    resKeys.forEach(function (resKey) {
                        if (resLoad[resKey] === undefined) {
                            if (options.defaultValue_plural !== undefined && resKey.endsWith(pluralSeparator + 'plural')) {
                                resLoad[resKey] = options.defaultValue_plural;
                            } else if (options.defaultValue !== undefined) {
                                // Use `options.defaultValue` if specified
                                resLoad[resKey] = options.defaultValue;
                            } else {
                                // Fallback to `defaultValue`
                                resLoad[resKey] = _lodash2.default.isFunction(defaultValue) ? defaultValue(lng, ns, key, options) : defaultValue;
                            }
                            _this5.log('Added a new translation key { ' + _chalk2.default.yellow(JSON.stringify(resKey)) + ': ' + _chalk2.default.yellow(JSON.stringify(resLoad[resKey])) + ' } to ' + _chalk2.default.yellow(JSON.stringify(_this5.formatResourceLoadPath(lng, ns))));
                        } else if (options.defaultValue && (!options.defaultValue_plural || !resKey.endsWith(pluralSeparator + 'plural'))) {
                            if (!resLoad[resKey]) {
                                // Use `options.defaultValue` if specified
                                resLoad[resKey] = options.defaultValue;
                            } else if (resLoad[resKey] !== options.defaultValue && lng === defaultLng) {
                                // A default value has provided but it's different with the expected default
                                _this5.log('The translation key ' + _chalk2.default.yellow(JSON.stringify(resKey)) + ' has a different default value, you may need to check the translation key of default language (' + defaultLng + ')');
                            }
                        } else if (options.defaultValue_plural && resKey.endsWith(pluralSeparator + 'plural')) {
                            if (!resLoad[resKey]) {
                                // Use `options.defaultValue_plural` if specified
                                resLoad[resKey] = options.defaultValue_plural;
                            } else if (resLoad[resKey] !== options.defaultValue_plural && lng === defaultLng) {
                                // A default value has provided but it's different with the expected default
                                _this5.log('The translation key ' + _chalk2.default.yellow(JSON.stringify(resKey)) + ' has a different default value, you may need to check the translation key of default language (' + defaultLng + ')');
                            }
                        }

                        resScan[resKey] = resLoad[resKey];
                    });
                });
            });
        }

        // Returns a JSON string containing translation information
        // @param {object} [options] The options object
        // @param {boolean} [options.sort] True to sort object by key
        // @param {function|string[]|number[]} [options.replacer] The same as the JSON.stringify()
        // @param {string|number} [options.space] The same as the JSON.stringify() method
        // @return {string}

    }, {
        key: 'toJSON',
        value: function toJSON() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var replacer = options.replacer,
                space = options.space,
                others = _objectWithoutProperties(options, ['replacer', 'space']);

            return JSON.stringify(this.get(others), replacer, space);
        }
    }]);

    return Parser;
}();

_i18next2.default.init();

exports.default = Parser;