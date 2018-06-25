(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = require('./lib/fingerprint.js');
var pad = require('./lib/pad.js');

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((Math.random() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;

},{"./lib/fingerprint.js":2,"./lib/pad.js":3}],2:[function(require,module,exports){
var pad = require('./pad.js');

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};

},{"./pad.js":3}],3:[function(require,module,exports){
module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};

},{}],4:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":9}],6:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns ? fns.length : 0

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],7:[function(require,module,exports){
!function() {
    'use strict';
    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i) ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || !1 === value) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        var vnodeName = vnode.nodeName;
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__preactattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (!1 === unmountOnly || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst, list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var defer = 'function' == typeof Promise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function(state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();

},{}],8:[function(require,module,exports){
module.exports = prettierBytes

function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  var neg = num < 0
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (neg) {
    num = -num
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  num = Number(num / Math.pow(1000, exponent))
  var unit = units[exponent]

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

},{}],9:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],10:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var preact = require('preact');
var findDOMElement = require('./../../utils/lib/findDOMElement');

/**
 * Defer a frequent call to the microtask queue.
 */
function debounce(fn) {
  var calling = null;
  var latestArgs = null;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    latestArgs = args;
    if (!calling) {
      calling = Promise.resolve().then(function () {
        calling = null;
        // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.
        return fn.apply(undefined, latestArgs);
      });
    }
    return calling;
  };
}

/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @return {array | string} files or success/fail message
 */
module.exports = function () {
  function Plugin(uppy, opts) {
    _classCallCheck(this, Plugin);

    this.uppy = uppy;
    this.opts = opts || {};

    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  Plugin.prototype.getPluginState = function getPluginState() {
    var _uppy$getState = this.uppy.getState(),
        plugins = _uppy$getState.plugins;

    return plugins[this.id];
  };

  Plugin.prototype.setPluginState = function setPluginState(update) {
    var plugins = _extends({}, this.uppy.getState().plugins);
    plugins[this.id] = _extends({}, plugins[this.id], update);

    this.uppy.setState({
      plugins: plugins
    });
  };

  Plugin.prototype.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    if (this._updateUI) {
      this._updateUI(state);
    }
  };

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {String|Object} target
   *
   */

  Plugin.prototype.mount = function mount(target, plugin) {
    var _this = this;

    var callerPluginName = plugin.id;

    var targetElement = findDOMElement(target);

    if (targetElement) {
      this.isTargetDOMEl = true;

      // API for plugins that require a synchronous rerender.
      this.rerender = function (state) {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!_this.uppy.getPlugin(_this.id)) return;
        _this.el = preact.render(_this.render(state), targetElement, _this.el);
      };
      this._updateUI = debounce(this.rerender);

      this.uppy.log('Installing ' + callerPluginName + ' to a DOM element');

      // clear everything inside the target container
      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = preact.render(this.render(this.uppy.getState()), targetElement);

      return this.el;
    }

    var targetPlugin = void 0;
    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target instanceof Plugin) {
      // Targeting a plugin *instance*
      targetPlugin = target;
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      var Target = target;
      // Find the target plugin instance.
      this.uppy.iteratePlugins(function (plugin) {
        if (plugin instanceof Target) {
          targetPlugin = plugin;
          return false;
        }
      });
    }

    if (targetPlugin) {
      var targetPluginName = targetPlugin.id;
      this.uppy.log('Installing ' + callerPluginName + ' to ' + targetPluginName);
      this.el = targetPlugin.addTarget(plugin);
      return this.el;
    }

    this.uppy.log('Not installing ' + callerPluginName);
    throw new Error('Invalid target option given to ' + callerPluginName);
  };

  Plugin.prototype.render = function render(state) {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  };

  Plugin.prototype.addTarget = function addTarget(plugin) {
    throw new Error('Extend the addTarget method to add your plugin to another plugin\'s target');
  };

  Plugin.prototype.unmount = function unmount() {
    if (this.isTargetDOMEl && this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  Plugin.prototype.install = function install() {};

  Plugin.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return Plugin;
}();

},{"./../../utils/lib/findDOMElement":21,"preact":7}],11:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Translator = require('./../../utils/lib/Translator');
var ee = require('namespace-emitter');
var cuid = require('cuid');
// const throttle = require('lodash.throttle')
var prettyBytes = require('prettier-bytes');
var match = require('mime-match');
var DefaultStore = require('./../../store-default');
var getFileType = require('./../../utils/lib/getFileType');
var getFileNameAndExtension = require('./../../utils/lib/getFileNameAndExtension');
var generateFileID = require('./../../utils/lib/generateFileID');
var isObjectURL = require('./../../utils/lib/isObjectURL');
var getTimeStamp = require('./../../utils/lib/getTimeStamp');

/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */

var Uppy = function () {
  /**
  * Instantiate Uppy
  * @param {object} opts — Uppy options
  */
  function Uppy(opts) {
    var _this = this;

    _classCallCheck(this, Uppy);

    var defaultLocale = {
      strings: {
        youCanOnlyUploadX: {
          0: 'You can only upload %{smart_count} file',
          1: 'You can only upload %{smart_count} files'
        },
        youHaveToAtLeastSelectX: {
          0: 'You have to select at least %{smart_count} file',
          1: 'You have to select at least %{smart_count} files'
        },
        exceedsSize: 'This file exceeds maximum allowed size of',
        youCanOnlyUploadFileTypes: 'You can only upload:',
        uppyServerError: 'Connection with Uppy Server failed',
        failedToUpload: 'Failed to upload %{file}',
        noInternetConnection: 'No Internet connection',
        connectedToInternet: 'Connected to the Internet',
        // Strings for remote providers
        noFilesFound: 'You have no files or folders here',
        selectXFiles: {
          0: 'Select %{smart_count} file',
          1: 'Select %{smart_count} files'
        },
        cancel: 'Cancel',
        logOut: 'Log out'

        // set default options
      } };var defaultOptions = {
      id: 'uppy',
      autoProceed: true,
      debug: false,
      restrictions: {
        maxFileSize: null,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: null
      },
      meta: {},
      onBeforeFileAdded: function onBeforeFileAdded(currentFile, files) {
        return currentFile;
      },
      onBeforeUpload: function onBeforeUpload(files) {
        return files;
      },
      locale: defaultLocale,
      store: DefaultStore()

      // Merge default options with the ones set by user
    };this.opts = _extends({}, defaultOptions, opts);
    this.opts.restrictions = _extends({}, defaultOptions.restrictions, this.opts.restrictions);

    this.locale = _extends({}, defaultLocale, this.opts.locale);
    this.locale.strings = _extends({}, defaultLocale.strings, this.opts.locale.strings);

    // i18n
    this.translator = new Translator({ locale: this.locale });
    this.i18n = this.translator.translate.bind(this.translator);

    // Container for different types of plugins
    this.plugins = {};

    this.getState = this.getState.bind(this);
    this.getPlugin = this.getPlugin.bind(this);
    this.setFileMeta = this.setFileMeta.bind(this);
    this.setFileState = this.setFileState.bind(this);
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.hideInfo = this.hideInfo.bind(this);
    this.addFile = this.addFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.pauseResume = this.pauseResume.bind(this);
    this._calculateProgress = this._calculateProgress.bind(this);
    this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
    this.resetProgress = this.resetProgress.bind(this);

    this.pauseAll = this.pauseAll.bind(this);
    this.resumeAll = this.resumeAll.bind(this);
    this.retryAll = this.retryAll.bind(this);
    this.cancelAll = this.cancelAll.bind(this);
    this.retryUpload = this.retryUpload.bind(this);
    this.upload = this.upload.bind(this);

    this.emitter = ee();
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.emitter.once.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);

    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];

    this.store = this.opts.store;
    this.setState({
      plugins: {},
      files: {},
      currentUploads: {},
      capabilities: {
        resumableUploads: false
      },
      totalProgress: 0,
      meta: _extends({}, this.opts.meta),
      info: {
        isHidden: true,
        type: 'info',
        message: ''
      }
    });

    this._storeUnsubscribe = this.store.subscribe(function (prevState, nextState, patch) {
      _this.emit('state-update', prevState, nextState, patch);
      _this.updateAll(nextState);
    });

    // for debugging and testing
    // this.updateNum = 0
    if (this.opts.debug && typeof window !== 'undefined') {
      window['uppyLog'] = '';
      window[this.opts.id] = this;
    }

    this._addListeners();
  }

  Uppy.prototype.on = function on(event, callback) {
    this.emitter.on(event, callback);
    return this;
  };

  Uppy.prototype.off = function off(event, callback) {
    this.emitter.off(event, callback);
    return this;
  };

  /**
   * Iterate on all plugins and run `update` on them.
   * Called each time state changes.
   *
   */

  Uppy.prototype.updateAll = function updateAll(state) {
    this.iteratePlugins(function (plugin) {
      plugin.update(state);
    });
  };

  /**
   * Updates state with a patch
   *
   * @param {object} patch {foo: 'bar'}
   */

  Uppy.prototype.setState = function setState(patch) {
    this.store.setState(patch);
  };

  /**
   * Returns current state.
   * @return {object}
   */

  Uppy.prototype.getState = function getState() {
    return this.store.getState();
  };

  /**
  * Back compat for when uppy.state is used instead of uppy.getState().
  */

  /**
  * Shorthand to set state for a specific file.
  */
  Uppy.prototype.setFileState = function setFileState(fileID, state) {
    var _extends2;

    if (!this.getState().files[fileID]) {
      throw new Error("Can\u2019t set state for " + fileID + ' (the file could have been removed)');
    }

    this.setState({
      files: _extends({}, this.getState().files, (_extends2 = {}, _extends2[fileID] = _extends({}, this.getState().files[fileID], state), _extends2))
    });
  };

  Uppy.prototype.resetProgress = function resetProgress() {
    var defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: false
    };
    var files = _extends({}, this.getState().files);
    var updatedFiles = {};
    Object.keys(files).forEach(function (fileID) {
      var updatedFile = _extends({}, files[fileID]);
      updatedFile.progress = _extends({}, updatedFile.progress, defaultProgress);
      updatedFiles[fileID] = updatedFile;
    });

    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });

    // TODO Document on the website
    this.emit('reset-progress');
  };

  Uppy.prototype.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  Uppy.prototype.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);
    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  Uppy.prototype.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);
    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  Uppy.prototype.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);
    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  Uppy.prototype.setMeta = function setMeta(data) {
    var updatedMeta = _extends({}, this.getState().meta, data);
    var updatedFiles = _extends({}, this.getState().files);

    Object.keys(updatedFiles).forEach(function (fileID) {
      updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
        meta: _extends({}, updatedFiles[fileID].meta, data)
      });
    });

    this.log('Adding metadata:');
    this.log(data);

    this.setState({
      meta: updatedMeta,
      files: updatedFiles
    });
  };

  Uppy.prototype.setFileMeta = function setFileMeta(fileID, data) {
    var updatedFiles = _extends({}, this.getState().files);
    if (!updatedFiles[fileID]) {
      this.log('Was trying to set metadata for a file that’s not with us anymore: ', fileID);
      return;
    }
    var newMeta = _extends({}, updatedFiles[fileID].meta, data);
    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({ files: updatedFiles });
  };

  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */

  Uppy.prototype.getFile = function getFile(fileID) {
    return this.getState().files[fileID];
  };

  /**
   * Get all files in an array.
   */

  Uppy.prototype.getFiles = function getFiles() {
    var _getState = this.getState(),
        files = _getState.files;

    return Object.keys(files).map(function (fileID) {
      return files[fileID];
    });
  };

  /**
  * Check if minNumberOfFiles restriction is reached before uploading.
  *
  * @private
  */

  Uppy.prototype._checkMinNumberOfFiles = function _checkMinNumberOfFiles(files) {
    var minNumberOfFiles = this.opts.restrictions.minNumberOfFiles;

    if (Object.keys(files).length < minNumberOfFiles) {
      throw new Error('' + this.i18n('youHaveToAtLeastSelectX', { smart_count: minNumberOfFiles }));
    }
  };

  /**
  * Check if file passes a set of restrictions set in options: maxFileSize,
  * maxNumberOfFiles and allowedFileTypes.
  *
  * @param {object} file object to check
  * @private
  */

  Uppy.prototype._checkRestrictions = function _checkRestrictions(file) {
    var _opts$restrictions = this.opts.restrictions,
        maxFileSize = _opts$restrictions.maxFileSize,
        maxNumberOfFiles = _opts$restrictions.maxNumberOfFiles,
        allowedFileTypes = _opts$restrictions.allowedFileTypes;

    if (maxNumberOfFiles) {
      if (Object.keys(this.getState().files).length + 1 > maxNumberOfFiles) {
        throw new Error('' + this.i18n('youCanOnlyUploadX', { smart_count: maxNumberOfFiles }));
      }
    }

    if (allowedFileTypes) {
      var isCorrectFileType = allowedFileTypes.filter(function (type) {
        // if (!file.type) return false

        // is this is a mime-type
        if (type.indexOf('/') > -1) {
          if (!file.type) return false;
          return match(file.type, type);
        }

        // otherwise this is likely an extension
        if (type[0] === '.') {
          if (file.extension === type.substr(1)) {
            return file.extension;
          }
        }
      }).length > 0;

      if (!isCorrectFileType) {
        var allowedFileTypesString = allowedFileTypes.join(', ');
        throw new Error(this.i18n('youCanOnlyUploadFileTypes') + ' ' + allowedFileTypesString);
      }
    }

    if (maxFileSize) {
      if (file.data.size > maxFileSize) {
        throw new Error(this.i18n('exceedsSize') + ' ' + prettyBytes(maxFileSize));
      }
    }
  };

  /**
  * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
  * try to guess file type in a clever way, check file against restrictions,
  * and start an upload if `autoProceed === true`.
  *
  * @param {object} file object to add
  */

  Uppy.prototype.addFile = function addFile(file) {
    var _this2 = this,
        _extends3;

    var _getState2 = this.getState(),
        files = _getState2.files;

    var onError = function onError(msg) {
      var err = (typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object' ? msg : new Error(msg);
      _this2.log(err.message);
      _this2.info(err.message, 'error', 5000);
      throw err;
    };

    var onBeforeFileAddedResult = this.opts.onBeforeFileAdded(file, files);

    if (onBeforeFileAddedResult === false) {
      this.log('Not adding file because onBeforeFileAdded returned false');
      return;
    }

    if ((typeof onBeforeFileAddedResult === 'undefined' ? 'undefined' : _typeof(onBeforeFileAddedResult)) === 'object' && onBeforeFileAddedResult) {
      // warning after the change in 0.24
      if (onBeforeFileAddedResult.then) {
        throw new TypeError('onBeforeFileAdded() returned a Promise, but this is no longer supported. It must be synchronous.');
      }
      file = onBeforeFileAddedResult;
    }

    var fileType = getFileType(file);
    var fileName = void 0;
    if (file.name) {
      fileName = file.name;
    } else if (fileType.split('/')[0] === 'image') {
      fileName = fileType.split('/')[0] + '.' + fileType.split('/')[1];
    } else {
      fileName = 'noname';
    }
    var fileExtension = getFileNameAndExtension(fileName).extension;
    var isRemote = file.isRemote || false;

    var fileID = generateFileID(file);

    var meta = file.meta || {};
    meta.name = fileName;
    meta.type = fileType;

    var newFile = {
      source: file.source || '',
      id: fileID,
      name: fileName,
      extension: fileExtension || '',
      meta: _extends({}, this.getState().meta, meta),
      type: fileType,
      data: file.data,
      progress: {
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.data.size || 0,
        uploadComplete: false,
        uploadStarted: false
      },
      size: file.data.size || 0,
      isRemote: isRemote,
      remote: file.remote || '',
      preview: file.preview
    };

    try {
      this._checkRestrictions(newFile);
    } catch (err) {
      onError(err);
    }

    this.setState({
      files: _extends({}, files, (_extends3 = {}, _extends3[fileID] = newFile, _extends3))
    });

    this.emit('file-added', newFile);
    this.log('Added file: ' + fileName + ', ' + fileID + ', mime type: ' + fileType);

    if (this.opts.autoProceed && !this.scheduledAutoProceed) {
      this.scheduledAutoProceed = setTimeout(function () {
        _this2.scheduledAutoProceed = null;
        _this2.upload().catch(function (err) {
          console.error(err.stack || err.message || err);
        });
      }, 4);
    }
  };

  Uppy.prototype.removeFile = function removeFile(fileID) {
    var _this3 = this;

    var _getState3 = this.getState(),
        files = _getState3.files,
        currentUploads = _getState3.currentUploads;

    var updatedFiles = _extends({}, files);
    var removedFile = updatedFiles[fileID];
    delete updatedFiles[fileID];

    // Remove this file from its `currentUpload`.
    var updatedUploads = _extends({}, currentUploads);
    var removeUploads = [];
    Object.keys(updatedUploads).forEach(function (uploadID) {
      var newFileIDs = currentUploads[uploadID].fileIDs.filter(function (uploadFileID) {
        return uploadFileID !== fileID;
      });
      // Remove the upload if no files are associated with it anymore.
      if (newFileIDs.length === 0) {
        removeUploads.push(uploadID);
        return;
      }

      updatedUploads[uploadID] = _extends({}, currentUploads[uploadID], {
        fileIDs: newFileIDs
      });
    });

    this.setState({
      currentUploads: updatedUploads,
      files: updatedFiles
    });

    removeUploads.forEach(function (uploadID) {
      _this3._removeUpload(uploadID);
    });

    this._calculateTotalProgress();
    this.emit('file-removed', removedFile);
    this.log('File removed: ' + removedFile.id);

    // Clean up object URLs.
    if (removedFile.preview && isObjectURL(removedFile.preview)) {
      URL.revokeObjectURL(removedFile.preview);
    }

    this.log('Removed file: ' + fileID);
  };

  Uppy.prototype.pauseResume = function pauseResume(fileID) {
    if (this.getFile(fileID).uploadComplete) return;

    var wasPaused = this.getFile(fileID).isPaused || false;
    var isPaused = !wasPaused;

    this.setFileState(fileID, {
      isPaused: isPaused
    });

    this.emit('upload-pause', fileID, isPaused);

    return isPaused;
  };

  Uppy.prototype.pauseAll = function pauseAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: true
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('pause-all');
  };

  Uppy.prototype.resumeAll = function resumeAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('resume-all');
  };

  Uppy.prototype.retryAll = function retryAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var filesToRetry = Object.keys(updatedFiles).filter(function (file) {
      return updatedFiles[file].error;
    });

    filesToRetry.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      error: null
    });

    this.emit('retry-all', filesToRetry);

    var uploadID = this._createUpload(filesToRetry);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.cancelAll = function cancelAll() {
    var _this4 = this;

    this.emit('cancel-all');

    // TODO Or should we just call removeFile on all files?

    var _getState4 = this.getState(),
        currentUploads = _getState4.currentUploads;

    var uploadIDs = Object.keys(currentUploads);

    uploadIDs.forEach(function (id) {
      _this4._removeUpload(id);
    });

    this.setState({
      files: {},
      totalProgress: 0,
      error: null
    });
  };

  Uppy.prototype.retryUpload = function retryUpload(fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    var updatedFile = _extends({}, updatedFiles[fileID], { error: null, isPaused: false });
    updatedFiles[fileID] = updatedFile;
    this.setState({
      files: updatedFiles
    });

    this.emit('upload-retry', fileID);

    var uploadID = this._createUpload([fileID]);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.reset = function reset() {
    this.cancelAll();
  };

  Uppy.prototype._calculateProgress = function _calculateProgress(file, data) {
    if (!this.getFile(file.id)) {
      this.log('Not setting progress for a file that has been removed: ' + file.id);
      return;
    }

    this.setFileState(file.id, {
      progress: _extends({}, this.getFile(file.id).progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: Math.floor((data.bytesUploaded / data.bytesTotal * 100).toFixed(2))
      })
    });

    this._calculateTotalProgress();
  };

  Uppy.prototype._calculateTotalProgress = function _calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = _extends({}, this.getState().files);

    var inProgress = Object.keys(files).filter(function (file) {
      return files[file].progress.uploadStarted;
    });
    var progressMax = inProgress.length * 100;
    var progressAll = 0;
    inProgress.forEach(function (file) {
      progressAll = progressAll + files[file].progress.percentage;
    });

    var totalProgress = progressMax === 0 ? 0 : Math.floor((progressAll * 100 / progressMax).toFixed(2));

    this.setState({
      totalProgress: totalProgress
    });
  };

  /**
   * Registers listeners for all global actions, like:
   * `error`, `file-removed`, `upload-progress`
   */

  Uppy.prototype._addListeners = function _addListeners() {
    var _this5 = this;

    this.on('error', function (error) {
      _this5.setState({ error: error.message });
    });

    this.on('upload-error', function (file, error) {
      _this5.setFileState(file.id, { error: error.message });
      _this5.setState({ error: error.message });

      var message = _this5.i18n('failedToUpload', { file: file.name });
      if ((typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && error.message) {
        message = { message: message, details: error.message };
      }
      _this5.info(message, 'error', 5000);
    });

    this.on('upload', function () {
      _this5.setState({ error: null });
    });

    this.on('upload-started', function (file, upload) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: {
          uploadStarted: Date.now(),
          uploadComplete: false,
          percentage: 0,
          bytesUploaded: 0,
          bytesTotal: file.size
        }
      });
    });

    // upload progress events can occur frequently, especially when you have a good
    // connection to the remote server. Therefore, we are throtteling them to
    // prevent accessive function calls.
    // see also: https://github.com/tus/tus-js-client/commit/9940f27b2361fd7e10ba58b09b60d82422183bbb
    // const _throttledCalculateProgress = throttle(this._calculateProgress, 100, { leading: true, trailing: true })

    this.on('upload-progress', this._calculateProgress);

    this.on('upload-success', function (file, uploadResp, uploadURL) {
      var currentProgress = _this5.getFile(file.id).progress;
      _this5.setFileState(file.id, {
        progress: _extends({}, currentProgress, {
          uploadComplete: true,
          percentage: 100,
          bytesUploaded: currentProgress.bytesTotal
        }),
        uploadURL: uploadURL,
        isPaused: false
      });

      _this5._calculateTotalProgress();
    });

    this.on('preprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getFile(file.id).progress, {
          preprocess: progress
        })
      });
    });

    this.on('preprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.preprocess;

      _this5.setState({ files: files });
    });

    this.on('postprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getState().files[file.id].progress, {
          postprocess: progress
        })
      });
    });

    this.on('postprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.postprocess;
      // TODO should we set some kind of `fullyComplete` property on the file object
      // so it's easier to see that the file is upload…fully complete…rather than
      // what we have to do now (`uploadComplete && !postprocess`)

      _this5.setState({ files: files });
    });

    this.on('restored', function () {
      // Files may have changed--ensure progress is still accurate.
      _this5._calculateTotalProgress();
    });

    // show informer if offline
    if (typeof window !== 'undefined') {
      window.addEventListener('online', function () {
        return _this5.updateOnlineStatus();
      });
      window.addEventListener('offline', function () {
        return _this5.updateOnlineStatus();
      });
      setTimeout(function () {
        return _this5.updateOnlineStatus();
      }, 3000);
    }
  };

  Uppy.prototype.updateOnlineStatus = function updateOnlineStatus() {
    var online = typeof window.navigator.onLine !== 'undefined' ? window.navigator.onLine : true;
    if (!online) {
      this.emit('is-offline');
      this.info(this.i18n('noInternetConnection'), 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');
      if (this.wasOffline) {
        this.emit('back-online');
        this.info(this.i18n('connectedToInternet'), 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  Uppy.prototype.getID = function getID() {
    return this.opts.id;
  };

  /**
   * Registers a plugin with Core.
   *
   * @param {object} Plugin object
   * @param {object} [opts] object with options to be passed to Plugin
   * @return {Object} self for chaining
   */

  Uppy.prototype.use = function use(Plugin, opts) {
    if (typeof Plugin !== 'function') {
      var msg = 'Expected a plugin class, but got ' + (Plugin === null ? 'null' : typeof Plugin === 'undefined' ? 'undefined' : _typeof(Plugin)) + '.' + ' Please verify that the plugin was imported and spelled correctly.';
      throw new TypeError(msg);
    }

    // Instantiate
    var plugin = new Plugin(this, opts);
    var pluginId = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginId) {
      throw new Error('Your plugin must have an id');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginId);
    if (existsPluginAlready) {
      var _msg = 'Already found a plugin named \'' + existsPluginAlready.id + '\'. ' + ('Tried to use: \'' + pluginId + '\'.\n') + 'Uppy plugins must have unique \'id\' options. See https://uppy.io/docs/plugins/#id.';
      throw new Error(_msg);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();

    return this;
  };

  /**
   * Find one Plugin by name.
   *
   * @param {string} name description
   * @return {object | boolean}
   */

  Uppy.prototype.getPlugin = function getPlugin(name) {
    var foundPlugin = null;
    this.iteratePlugins(function (plugin) {
      var pluginName = plugin.id;
      if (pluginName === name) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  };

  /**
   * Iterate through all `use`d plugins.
   *
   * @param {function} method that will be run on each plugin
   */

  Uppy.prototype.iteratePlugins = function iteratePlugins(method) {
    var _this6 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this6.plugins[pluginType].forEach(method);
    });
  };

  /**
   * Uninstall and remove a plugin.
   *
   * @param {object} instance The plugin instance to remove.
   */

  Uppy.prototype.removePlugin = function removePlugin(instance) {
    this.log('Removing plugin ' + instance.id);
    this.emit('plugin-remove', instance);

    if (instance.uninstall) {
      instance.uninstall();
    }

    var list = this.plugins[instance.type].slice();
    var index = list.indexOf(instance);
    if (index !== -1) {
      list.splice(index, 1);
      this.plugins[instance.type] = list;
    }

    var updatedState = this.getState();
    delete updatedState.plugins[instance.id];
    this.setState(updatedState);
  };

  /**
   * Uninstall all plugins and close down this Uppy instance.
   */

  Uppy.prototype.close = function close() {
    var _this7 = this;

    this.log('Closing Uppy instance ' + this.opts.id + ': removing all files and uninstalling plugins');

    this.reset();

    this._storeUnsubscribe();

    this.iteratePlugins(function (plugin) {
      _this7.removePlugin(plugin);
    });
  };

  /**
  * Set info message in `state.info`, so that UI plugins like `Informer`
  * can display the message.
  *
  * @param {string | object} message Message to be displayed by the informer
  * @param {string} [type]
  * @param {number} [duration]
  */

  Uppy.prototype.info = function info(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;

    var isComplexMessage = (typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object';

    this.setState({
      info: {
        isHidden: false,
        type: type,
        message: isComplexMessage ? message.message : message,
        details: isComplexMessage ? message.details : null
      }
    });

    this.emit('info-visible');

    clearTimeout(this.infoTimeoutID);
    if (duration === 0) {
      this.infoTimeoutID = undefined;
      return;
    }

    // hide the informer after `duration` milliseconds
    this.infoTimeoutID = setTimeout(this.hideInfo, duration);
  };

  Uppy.prototype.hideInfo = function hideInfo() {
    var newInfo = _extends({}, this.getState().info, {
      isHidden: true
    });
    this.setState({
      info: newInfo
    });
    this.emit('info-hidden');
  };

  /**
   * Logs stuff to console, only if `debug` is set to true. Silent in production.
   *
   * @param {String|Object} msg to log
   * @param {String} [type] optional `error` or `warning`
   */

  Uppy.prototype.log = function log(msg, type) {
    if (!this.opts.debug) {
      return;
    }

    var message = '[Uppy] [' + getTimeStamp() + '] ' + msg;

    window['uppyLog'] = window['uppyLog'] + '\n' + 'DEBUG LOG: ' + msg;

    if (type === 'error') {
      console.error(message);
      return;
    }

    if (type === 'warning') {
      console.warn(message);
      return;
    }

    if (msg === '' + msg) {
      console.log(message);
    } else {
      message = '[Uppy] [' + getTimeStamp() + ']';
      console.log(message);
      console.dir(msg);
    }
  };

  /**
   * Obsolete, event listeners are now added in the constructor.
   */

  Uppy.prototype.run = function run() {
    this.log('Calling run() is no longer necessary.', 'warning');
    return this;
  };

  /**
   * Restore an upload by its ID.
   */

  Uppy.prototype.restore = function restore(uploadID) {
    this.log('Core: attempting to restore upload "' + uploadID + '"');

    if (!this.getState().currentUploads[uploadID]) {
      this._removeUpload(uploadID);
      return Promise.reject(new Error('Nonexistent upload'));
    }

    return this._runUpload(uploadID);
  };

  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @return {string} ID of this upload.
   */

  Uppy.prototype._createUpload = function _createUpload(fileIDs) {
    var _extends4;

    var uploadID = cuid();

    this.emit('upload', {
      id: uploadID,
      fileIDs: fileIDs
    });

    this.setState({
      currentUploads: _extends({}, this.getState().currentUploads, (_extends4 = {}, _extends4[uploadID] = {
        fileIDs: fileIDs,
        step: 0,
        result: {}
      }, _extends4))
    });

    return uploadID;
  };

  Uppy.prototype._getUpload = function _getUpload(uploadID) {
    return this.getState().currentUploads[uploadID];
  };

  /**
   * Add data to an upload's result object.
   *
   * @param {string} uploadID The ID of the upload.
   * @param {object} data Data properties to add to the result object.
   */

  Uppy.prototype.addResultData = function addResultData(uploadID, data) {
    var _extends5;

    if (!this._getUpload(uploadID)) {
      this.log('Not setting result for an upload that has been removed: ' + uploadID);
      return;
    }
    var currentUploads = this.getState().currentUploads;
    var currentUpload = _extends({}, currentUploads[uploadID], {
      result: _extends({}, currentUploads[uploadID].result, data)
    });
    this.setState({
      currentUploads: _extends({}, currentUploads, (_extends5 = {}, _extends5[uploadID] = currentUpload, _extends5))
    });
  };

  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */

  Uppy.prototype._removeUpload = function _removeUpload(uploadID) {
    var currentUploads = _extends({}, this.getState().currentUploads);
    delete currentUploads[uploadID];

    this.setState({
      currentUploads: currentUploads
    });
  };

  /**
   * Run an upload. This picks up where it left off in case the upload is being restored.
   *
   * @private
   */

  Uppy.prototype._runUpload = function _runUpload(uploadID) {
    var _this8 = this;

    var uploadData = this.getState().currentUploads[uploadID];
    var fileIDs = uploadData.fileIDs;
    var restoreStep = uploadData.step;

    var steps = [].concat(this.preProcessors, this.uploaders, this.postProcessors);
    var lastStep = Promise.resolve();
    steps.forEach(function (fn, step) {
      // Skip this step if we are restoring and have already completed this step before.
      if (step < restoreStep) {
        return;
      }

      lastStep = lastStep.then(function () {
        var _extends6;

        var _getState5 = _this8.getState(),
            currentUploads = _getState5.currentUploads;

        var currentUpload = _extends({}, currentUploads[uploadID], {
          step: step
        });
        _this8.setState({
          currentUploads: _extends({}, currentUploads, (_extends6 = {}, _extends6[uploadID] = currentUpload, _extends6))
        });
        // TODO give this the `currentUpload` object as its only parameter maybe?
        // Otherwise when more metadata may be added to the upload this would keep getting more parameters
        return fn(fileIDs, uploadID);
      }).then(function (result) {
        return null;
      });
    });

    // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.
    lastStep.catch(function (err) {
      _this8.emit('error', err, uploadID);

      _this8._removeUpload(uploadID);
    });

    return lastStep.then(function () {
      var files = fileIDs.map(function (fileID) {
        return _this8.getFile(fileID);
      });
      var successful = files.filter(function (file) {
        return file && !file.error;
      });
      var failed = files.filter(function (file) {
        return file && file.error;
      });
      _this8.addResultData(uploadID, { successful: successful, failed: failed, uploadID: uploadID });

      var _getState6 = _this8.getState(),
          currentUploads = _getState6.currentUploads;

      if (!currentUploads[uploadID]) {
        _this8.log('Not setting result for an upload that has been removed: ' + uploadID);
        return;
      }

      var result = currentUploads[uploadID].result;
      _this8.emit('complete', result);

      _this8._removeUpload(uploadID);

      return result;
    });
  };

  /**
   * Start an upload for all the files that are not currently being uploaded.
   *
   * @return {Promise}
   */

  Uppy.prototype.upload = function upload() {
    var _this9 = this;

    if (!this.plugins.uploader) {
      this.log('No uploader type plugins are used', 'warning');
    }

    var files = this.getState().files;
    var onBeforeUploadResult = this.opts.onBeforeUpload(files);

    if (onBeforeUploadResult === false) {
      return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
    }

    if (onBeforeUploadResult && (typeof onBeforeUploadResult === 'undefined' ? 'undefined' : _typeof(onBeforeUploadResult)) === 'object') {
      // warning after the change in 0.24
      if (onBeforeUploadResult.then) {
        throw new TypeError('onBeforeUpload() returned a Promise, but this is no longer supported. It must be synchronous.');
      }

      files = onBeforeUploadResult;
    }

    return Promise.resolve().then(function () {
      return _this9._checkMinNumberOfFiles(files);
    }).then(function () {
      var _getState7 = _this9.getState(),
          currentUploads = _getState7.currentUploads;
      // get a list of files that are currently assigned to uploads


      var currentlyUploadingFiles = Object.keys(currentUploads).reduce(function (prev, curr) {
        return prev.concat(currentUploads[curr].fileIDs);
      }, []);

      var waitingFileIDs = [];
      Object.keys(files).forEach(function (fileID) {
        var file = _this9.getFile(fileID);
        // if the file hasn't started uploading and hasn't already been assigned to an upload..
        if (!file.progress.uploadStarted && currentlyUploadingFiles.indexOf(fileID) === -1) {
          waitingFileIDs.push(file.id);
        }
      });

      var uploadID = _this9._createUpload(waitingFileIDs);
      return _this9._runUpload(uploadID);
    }).catch(function (err) {
      var message = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.message : err;
      var details = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.details : null;
      _this9.log(message + ' ' + details);
      _this9.info({ message: message, details: details }, 'error', 4000);
      return Promise.reject((typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err : new Error(err));
    });
  };

  _createClass(Uppy, [{
    key: 'state',
    get: function get() {
      return this.getState();
    }
  }]);

  return Uppy;
}();

module.exports = function (opts) {
  return new Uppy(opts);
};

// Expose class constructor.
module.exports.Uppy = Uppy;

},{"./../../store-default":18,"./../../utils/lib/Translator":19,"./../../utils/lib/generateFileID":22,"./../../utils/lib/getFileNameAndExtension":23,"./../../utils/lib/getFileType":24,"./../../utils/lib/getTimeStamp":26,"./../../utils/lib/isObjectURL":28,"cuid":1,"mime-match":5,"namespace-emitter":6,"prettier-bytes":8}],12:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Plugin = require('./../../core/lib/Plugin');
var toArray = require('./../../utils/lib/toArray');
var Translator = require('./../../utils/lib/Translator');

var _require = require('preact'),
    h = _require.h;

module.exports = function (_Plugin) {
  _inherits(FileInput, _Plugin);

  function FileInput(uppy, opts) {
    _classCallCheck(this, FileInput);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'FileInput';
    _this.title = 'File Input';
    _this.type = 'acquirer';

    var defaultLocale = {
      strings: {
        chooseFiles: 'Choose files'

        // Default options
      } };var defaultOptions = {
      target: null,
      pretty: true,
      inputName: 'files[]',
      locale: defaultLocale

      // Merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    _this.locale = _extends({}, defaultLocale, _this.opts.locale);
    _this.locale.strings = _extends({}, defaultLocale.strings, _this.opts.locale.strings);

    // i18n
    _this.translator = new Translator({ locale: _this.locale });
    _this.i18n = _this.translator.translate.bind(_this.translator);

    _this.render = _this.render.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.handleClick = _this.handleClick.bind(_this);
    return _this;
  }

  FileInput.prototype.handleInputChange = function handleInputChange(ev) {
    var _this2 = this;

    this.uppy.log('[FileInput] Something selected through input...');

    var files = toArray(ev.target.files);

    files.forEach(function (file) {
      try {
        _this2.uppy.addFile({
          source: _this2.id,
          name: file.name,
          type: file.type,
          data: file
        });
      } catch (err) {
        // Nothing, restriction errors handled in Core
      }
    });
  };

  FileInput.prototype.handleClick = function handleClick(ev) {
    this.input.click();
  };

  FileInput.prototype.render = function render(state) {
    var _this3 = this;

    /* http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/ */
    var hiddenInputStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    };

    var restrictions = this.uppy.opts.restrictions;

    // empty value="" on file input, so that the input is cleared after a file is selected,
    // because Uppy will be handling the upload and so we can select same file
    // after removing — otherwise browser thinks it’s already selected
    return h('div', { 'class': 'uppy-Root uppy-FileInput-container' }, h('input', { 'class': 'uppy-FileInput-input',
      style: this.opts.pretty && hiddenInputStyle,
      type: 'file',
      name: this.opts.inputName,
      onchange: this.handleInputChange,
      multiple: restrictions.maxNumberOfFiles !== 1,
      accept: restrictions.allowedFileTypes,
      ref: function ref(input) {
        _this3.input = input;
      },
      value: '' }), this.opts.pretty && h('button', { 'class': 'uppy-FileInput-btn', type: 'button', onclick: this.handleClick }, this.i18n('chooseFiles')));
  };

  FileInput.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  FileInput.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return FileInput;
}(Plugin);

},{"./../../core/lib/Plugin":10,"./../../utils/lib/Translator":19,"./../../utils/lib/toArray":32,"preact":7}],13:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Plugin = require('./../../core/lib/Plugin');

var _require = require('preact'),
    h = _require.h;

/**
 * Progress bar
 *
 */

module.exports = function (_Plugin) {
  _inherits(ProgressBar, _Plugin);

  function ProgressBar(uppy, opts) {
    _classCallCheck(this, ProgressBar);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'ProgressBar';
    _this.title = 'Progress Bar';
    _this.type = 'progressindicator';

    // set default options
    var defaultOptions = {
      target: 'body',
      replaceTargetContent: false,
      fixed: false,
      hideAfterFinish: true

      // merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    _this.render = _this.render.bind(_this);
    return _this;
  }

  ProgressBar.prototype.render = function render(state) {
    var progress = state.totalProgress || 0;
    var isHidden = progress === 100 && this.opts.hideAfterFinish;
    return h('div', { 'class': 'uppy uppy-ProgressBar', style: { position: this.opts.fixed ? 'fixed' : 'initial' }, 'aria-hidden': isHidden }, h('div', { 'class': 'uppy-ProgressBar-inner', style: { width: progress + '%' } }), h('div', { 'class': 'uppy-ProgressBar-percentage' }, progress));
  };

  ProgressBar.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  ProgressBar.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return ProgressBar;
}(Plugin);

},{"./../../core/lib/Plugin":10,"preact":7}],14:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var RequestClient = require('./RequestClient');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports = function (_RequestClient) {
  _inherits(Provider, _RequestClient);

  function Provider(uppy, opts) {
    _classCallCheck(this, Provider);

    var _this = _possibleConstructorReturn(this, _RequestClient.call(this, uppy, opts));

    _this.provider = opts.provider;
    _this.id = _this.provider;
    _this.authProvider = opts.authProvider || _this.provider;
    _this.name = _this.opts.name || _getName(_this.id);
    _this.tokenKey = 'uppy-server-' + _this.id + '-auth-token';
    return _this;
  }

  // @todo(i.olarewaju) consider whether or not this method should be exposed
  Provider.prototype.setAuthToken = function setAuthToken(token) {
    // @todo(i.olarewaju) add fallback for OOM storage
    localStorage.setItem(this.tokenKey, token);
  };

  Provider.prototype.checkAuth = function checkAuth() {
    return this.get(this.id + '/authorized').then(function (payload) {
      return payload.authenticated;
    });
  };

  Provider.prototype.authUrl = function authUrl() {
    return this.hostname + '/' + this.id + '/connect';
  };

  Provider.prototype.fileUrl = function fileUrl(id) {
    return this.hostname + '/' + this.id + '/get/' + id;
  };

  Provider.prototype.list = function list(directory) {
    return this.get(this.id + '/list/' + (directory || ''));
  };

  Provider.prototype.logout = function logout() {
    var _this2 = this;

    var redirect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : location.href;

    return this.get(this.id + '/logout?redirect=' + redirect).then(function (res) {
      localStorage.removeItem(_this2.tokenKey);
      return res;
    });
  };

  _createClass(Provider, [{
    key: 'defaultHeaders',
    get: function get() {
      return _extends({}, _RequestClient.prototype.defaultHeaders, { 'uppy-auth-token': localStorage.getItem(this.tokenKey) });
    }
  }]);

  return Provider;
}(RequestClient);

},{"./RequestClient":15}],15:[function(require,module,exports){
'use strict';

// Remove the trailing slash so we can always safely append /xyz.

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function stripSlash(url) {
  return url.replace(/\/$/, '');
}

module.exports = function () {
  function RequestClient(uppy, opts) {
    _classCallCheck(this, RequestClient);

    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
  }

  RequestClient.prototype.onReceiveResponse = function onReceiveResponse(response) {
    var state = this.uppy.getState();
    var uppyServer = state.uppyServer || {};
    var host = this.opts.serverUrl;
    var headers = response.headers;
    // Store the self-identified domain name for the uppy-server we just hit.
    if (headers.has('i-am') && headers.get('i-am') !== uppyServer[host]) {
      var _extends2;

      this.uppy.setState({
        uppyServer: _extends({}, uppyServer, (_extends2 = {}, _extends2[host] = headers.get('i-am'), _extends2))
      });
    }
    return response;
  };

  RequestClient.prototype._getUrl = function _getUrl(url) {
    if (/^(https?:|)\/\//.test(url)) {
      return url;
    }
    return this.hostname + '/' + url;
  };

  RequestClient.prototype.get = function get(path) {
    var _this = this;

    return fetch(this._getUrl(path), {
      method: 'get',
      headers: this.defaultHeaders
    })
    // @todo validate response status before calling json
    .then(this.onReceiveResponse).then(function (res) {
      return res.json();
    }).catch(function (err) {
      throw new Error('Could not get ' + _this._getUrl(path) + '. ' + err);
    });
  };

  RequestClient.prototype.post = function post(path, data) {
    var _this2 = this;

    return fetch(this._getUrl(path), {
      method: 'post',
      headers: this.defaultHeaders,
      body: JSON.stringify(data)
    }).then(this.onReceiveResponse).then(function (res) {
      if (res.status < 200 || res.status > 300) {
        throw new Error('Could not post ' + _this2._getUrl(path) + '. ' + res.statusText);
      }
      return res.json();
    }).catch(function (err) {
      throw new Error('Could not post ' + _this2._getUrl(path) + '. ' + err);
    });
  };

  RequestClient.prototype.delete = function _delete(path, data) {
    var _this3 = this;

    return fetch(this.hostname + '/' + path, {
      method: 'delete',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : null
    }).then(this.onReceiveResponse)
    // @todo validate response status before calling json
    .then(function (res) {
      return res.json();
    }).catch(function (err) {
      throw new Error('Could not delete ' + _this3._getUrl(path) + '. ' + err);
    });
  };

  _createClass(RequestClient, [{
    key: 'hostname',
    get: function get() {
      var _uppy$getState = this.uppy.getState(),
          uppyServer = _uppy$getState.uppyServer;

      var host = this.opts.serverUrl;
      return stripSlash(uppyServer && uppyServer[host] ? uppyServer[host] : host);
    }
  }, {
    key: 'defaultHeaders',
    get: function get() {
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    }
  }]);

  return RequestClient;
}();

},{}],16:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var ee = require('namespace-emitter');

module.exports = function () {
  function UppySocket(opts) {
    var _this = this;

    _classCallCheck(this, UppySocket);

    this.queued = [];
    this.isOpen = false;
    this.socket = new WebSocket(opts.target);
    this.emitter = ee();

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this.queued.length > 0 && _this.isOpen) {
        var first = _this.queued[0];
        _this.send(first.action, first.payload);
        _this.queued = _this.queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this._handleMessage = this._handleMessage.bind(this);

    this.socket.onmessage = this._handleMessage;

    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);
  }

  UppySocket.prototype.close = function close() {
    return this.socket.close();
  };

  UppySocket.prototype.send = function send(action, payload) {
    // attach uuid

    if (!this.isOpen) {
      this.queued.push({ action: action, payload: payload });
      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  UppySocket.prototype.on = function on(action, handler) {
    this.emitter.on(action, handler);
  };

  UppySocket.prototype.emit = function emit(action, payload) {
    this.emitter.emit(action, payload);
  };

  UppySocket.prototype.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  UppySocket.prototype._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":6}],17:[function(require,module,exports){
'use-strict';
/**
 * Manages communications with Uppy Server
 */

var RequestClient = require('./RequestClient');
var Provider = require('./Provider');
var Socket = require('./Socket');

module.exports = {
  RequestClient: RequestClient,
  Provider: Provider,
  Socket: Socket
};

},{"./Provider":14,"./RequestClient":15,"./Socket":16}],18:[function(require,module,exports){
var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Default store that keeps state in a simple object.
 */
var DefaultStore = function () {
  function DefaultStore() {
    _classCallCheck(this, DefaultStore);

    this.state = {};
    this.callbacks = [];
  }

  DefaultStore.prototype.getState = function getState() {
    return this.state;
  };

  DefaultStore.prototype.setState = function setState(patch) {
    var prevState = _extends({}, this.state);
    var nextState = _extends({}, this.state, patch);

    this.state = nextState;
    this._publish(prevState, nextState, patch);
  };

  DefaultStore.prototype.subscribe = function subscribe(listener) {
    var _this = this;

    this.callbacks.push(listener);
    return function () {
      // Remove the listener.
      _this.callbacks.splice(_this.callbacks.indexOf(listener), 1);
    };
  };

  DefaultStore.prototype._publish = function _publish() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.callbacks.forEach(function (listener) {
      listener.apply(undefined, args);
    });
  };

  return DefaultStore;
}();

module.exports = function defaultStore() {
  return new DefaultStore();
};

},{}],19:[function(require,module,exports){
var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 *
 * @param {object} opts
 */
module.exports = function () {
  function Translator(opts) {
    _classCallCheck(this, Translator);

    var defaultOptions = {
      locale: {
        strings: {},
        pluralize: function pluralize(n) {
          if (n === 1) {
            return 0;
          }
          return 1;
        }
      }
    };

    this.opts = _extends({}, defaultOptions, opts);
    this.locale = _extends({}, defaultOptions.locale, opts.locale);
  }

  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @return {string} interpolated
   */

  Translator.prototype.interpolate = function interpolate(phrase, options) {
    var _String$prototype = String.prototype,
        split = _String$prototype.split,
        replace = _String$prototype.replace;

    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';
    var interpolated = [phrase];

    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];
        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        }
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        interpolated = insertReplacement(interpolated, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }

    return interpolated;

    function insertReplacement(source, rx, replacement) {
      var newParts = [];
      source.forEach(function (chunk) {
        split.call(chunk, rx).forEach(function (raw, i, list) {
          if (raw !== '') {
            newParts.push(raw);
          }

          // Interlace with the `replacement` value
          if (i < list.length - 1) {
            newParts.push(replacement);
          }
        });
      });
      return newParts;
    }
  };

  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @return {string} translated (and interpolated)
   */

  Translator.prototype.translate = function translate(key, options) {
    return this.translateArray(key, options).join('');
  };

  /**
   * Get a translation and return the translated and interpolated parts as an array.
   * @param {string} key
   * @param {object} options with values that will be used to replace placeholders
   * @return {Array} The translated and interpolated parts, in order.
   */

  Translator.prototype.translateArray = function translateArray(key, options) {
    if (options && typeof options.smart_count !== 'undefined') {
      var plural = this.locale.pluralize(options.smart_count);
      return this.interpolate(this.opts.locale.strings[key][plural], options);
    }

    return this.interpolate(this.opts.locale.strings[key], options);
  };

  return Translator;
}();

},{}],20:[function(require,module,exports){
var throttle = require('lodash.throttle');

function _emitSocketProgress(uploader, progressData, file) {
  var progress = progressData.progress,
      bytesUploaded = progressData.bytesUploaded,
      bytesTotal = progressData.bytesTotal;

  if (progress) {
    uploader.uppy.log('Upload progress: ' + progress);
    uploader.uppy.emit('upload-progress', file, {
      uploader: uploader,
      bytesUploaded: bytesUploaded,
      bytesTotal: bytesTotal
    });
  }
}

module.exports = throttle(_emitSocketProgress, 300, { leading: true, trailing: true });

},{"lodash.throttle":4}],21:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var isDOMElement = require('./isDOMElement');

/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @return {Node|null}
 */
module.exports = function findDOMElement(element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }

  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && isDOMElement(element)) {
    return element;
  }
};

},{"./isDOMElement":27}],22:[function(require,module,exports){
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 *
 * @param {Object} file
 * @return {String} the fileID
 *
 */
module.exports = function generateFileID(file) {
  // filter is needed to not join empty values with `-`
  return ['uppy', file.name ? file.name.toLowerCase().replace(/[^A-Z0-9]/ig, '') : '', file.type, file.data.size, file.data.lastModified].filter(function (val) {
    return val;
  }).join('-');
};

},{}],23:[function(require,module,exports){
/**
* Takes a full filename string and returns an object {name, extension}
*
* @param {string} fullFileName
* @return {object} {name, extension}
*/
module.exports = function getFileNameAndExtension(fullFileName) {
  var re = /(?:\.([^.]+))?$/;
  var fileExt = re.exec(fullFileName)[1];
  var fileName = fullFileName.replace('.' + fileExt, '');
  return {
    name: fileName,
    extension: fileExt
  };
};

},{}],24:[function(require,module,exports){
var getFileNameAndExtension = require('./getFileNameAndExtension');
var mimeTypes = require('./mimeTypes');

module.exports = function getFileType(file) {
  var fileExtension = file.name ? getFileNameAndExtension(file.name).extension : null;

  if (file.isRemote) {
    // some remote providers do not support file types
    return file.type ? file.type : mimeTypes[fileExtension];
  }

  // check if mime type is set in the file object
  if (file.type) {
    return file.type;
  }

  // see if we can map extension to a mime type
  if (fileExtension && mimeTypes[fileExtension]) {
    return mimeTypes[fileExtension];
  }

  // if all fails, well, return empty
  return null;
};

},{"./getFileNameAndExtension":23,"./mimeTypes":30}],25:[function(require,module,exports){
module.exports = function getSocketHost(url) {
  // get the host domain
  var regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/;
  var host = regex.exec(url)[1];
  var socketProtocol = location.protocol === 'https:' ? 'wss' : 'ws';

  return socketProtocol + '://' + host;
};

},{}],26:[function(require,module,exports){
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
*/
module.exports = function getTimeStamp() {
  var date = new Date();
  var hours = pad(date.getHours().toString());
  var minutes = pad(date.getMinutes().toString());
  var seconds = pad(date.getSeconds().toString());
  return hours + ':' + minutes + ':' + seconds;
};

/**
 * Adds zero to strings shorter than two characters
*/
function pad(str) {
  return str.length !== 2 ? 0 + str : str;
}

},{}],27:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.nodeType === Node.ELEMENT_NODE;
};

},{}],28:[function(require,module,exports){
/**
 * Check if a URL string is an object URL from `URL.createObjectURL`.
 *
 * @param {string} url
 * @return {boolean}
 */
module.exports = function isObjectURL(url) {
  return url.indexOf('blob:') === 0;
};

},{}],29:[function(require,module,exports){
/**
 * Limit the amount of simultaneously pending Promises.
 * Returns a function that, when passed a function `fn`,
 * will make sure that at most `limit` calls to `fn` are pending.
 *
 * @param {number} limit
 * @return {function()}
 */
module.exports = function limitPromises(limit) {
  var pending = 0;
  var queue = [];
  return function (fn) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var call = function call() {
        pending++;
        var promise = fn.apply(undefined, args);
        promise.then(onfinish, onfinish);
        return promise;
      };

      if (pending >= limit) {
        return new Promise(function (resolve, reject) {
          queue.push(function () {
            call().then(resolve, reject);
          });
        });
      }
      return call();
    };
  };
  function onfinish() {
    pending--;
    var next = queue.shift();
    if (next) next();
  }
};

},{}],30:[function(require,module,exports){
module.exports = {
  'md': 'text/markdown',
  'markdown': 'text/markdown',
  'mp4': 'video/mp4',
  'mp3': 'audio/mp3',
  'svg': 'image/svg+xml',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'yaml': 'text/yaml',
  'yml': 'text/yaml',
  'csv': 'text/csv',
  'avi': 'video/x-msvideo',
  'mks': 'video/x-matroska',
  'mkv': 'video/x-matroska',
  'mov': 'video/quicktime',
  'doc': 'application/msword',
  'docm': 'application/vnd.ms-word.document.macroenabled.12',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'dot': 'application/msword',
  'dotm': 'application/vnd.ms-word.template.macroenabled.12',
  'dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'xla': 'application/vnd.ms-excel',
  'xlam': 'application/vnd.ms-excel.addin.macroenabled.12',
  'xlc': 'application/vnd.ms-excel',
  'xlf': 'application/x-xliff+xml',
  'xlm': 'application/vnd.ms-excel',
  'xls': 'application/vnd.ms-excel',
  'xlsb': 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  'xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xlt': 'application/vnd.ms-excel',
  'xltm': 'application/vnd.ms-excel.template.macroenabled.12',
  'xltx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'xlw': 'application/vnd.ms-excel'
};

},{}],31:[function(require,module,exports){
module.exports = function settle(promises) {
  var resolutions = [];
  var rejections = [];
  function resolved(value) {
    resolutions.push(value);
  }
  function rejected(error) {
    rejections.push(error);
  }

  var wait = Promise.all(promises.map(function (promise) {
    return promise.then(resolved, rejected);
  }));

  return wait.then(function () {
    return {
      successful: resolutions,
      failed: rejections
    };
  });
};

},{}],32:[function(require,module,exports){
/**
 * Converts list into array
*/
module.exports = function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
};

},{}],33:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Plugin = require('./../../core/lib/Plugin');
var cuid = require('cuid');
var Translator = require('./../../utils/lib/Translator');

var _require = require('./../../server-utils'),
    Provider = _require.Provider,
    Socket = _require.Socket;

var emitSocketProgress = require('./../../utils/lib/emitSocketProgress');
var getSocketHost = require('./../../utils/lib/getSocketHost');
var settle = require('./../../utils/lib/settle');
var limitPromises = require('./../../utils/lib/limitPromises');

function buildResponseError(xhr, error) {
  // No error message
  if (!error) error = new Error('Upload error');
  // Got an error message string
  if (typeof error === 'string') error = new Error(error);
  // Got something else
  if (!(error instanceof Error)) {
    error = _extends(new Error('Upload error'), { data: error });
  }

  error.request = xhr;
  return error;
}

module.exports = function (_Plugin) {
  _inherits(XHRUpload, _Plugin);

  function XHRUpload(uppy, opts) {
    _classCallCheck(this, XHRUpload);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.type = 'uploader';
    _this.id = 'XHRUpload';
    _this.title = 'XHRUpload';

    var defaultLocale = {
      strings: {
        timedOut: 'Upload stalled for %{seconds} seconds, aborting.'

        // Default options
      } };var defaultOptions = {
      formData: true,
      fieldName: 'files[]',
      method: 'post',
      metaFields: null,
      responseUrlFieldName: 'url',
      bundle: false,
      headers: {},
      locale: defaultLocale,
      timeout: 30 * 1000,
      limit: 0,
      withCredentials: false,
      /**
       * @typedef respObj
       * @property {string} responseText
       * @property {number} status
       * @property {string} statusText
       * @property {Object.<string, string>} headers
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseData: function getResponseData(responseText, response) {
        var parsedResponse = {};
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (err) {
          console.log(err);
        }

        return parsedResponse;
      },

      /**
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseError: function getResponseError(responseText, response) {
        return new Error('Upload error');
      }
    };

    // Merge default options with the ones set by user
    _this.opts = _extends({}, defaultOptions, opts);
    _this.locale = _extends({}, defaultLocale, _this.opts.locale);
    _this.locale.strings = _extends({}, defaultLocale.strings, _this.opts.locale.strings);

    // i18n
    _this.translator = new Translator({ locale: _this.locale });
    _this.i18n = _this.translator.translate.bind(_this.translator);

    _this.handleUpload = _this.handleUpload.bind(_this);

    // Simultaneous upload limiting is shared across all uploads with this plugin.
    if (typeof _this.opts.limit === 'number' && _this.opts.limit !== 0) {
      _this.limitUploads = limitPromises(_this.opts.limit);
    } else {
      _this.limitUploads = function (fn) {
        return fn;
      };
    }

    if (_this.opts.bundle && !_this.opts.formData) {
      throw new Error('`opts.formData` must be true when `opts.bundle` is enabled.');
    }
    return _this;
  }

  XHRUpload.prototype.getOptions = function getOptions(file) {
    var overrides = this.uppy.getState().xhrUpload;
    var opts = _extends({}, this.opts, overrides || {}, file.xhrUpload || {});
    opts.headers = {};
    _extends(opts.headers, this.opts.headers);
    if (overrides) {
      _extends(opts.headers, overrides.headers);
    }
    if (file.xhrUpload) {
      _extends(opts.headers, file.xhrUpload.headers);
    }

    return opts;
  };

  // Helper to abort upload requests if there has not been any progress for `timeout` ms.
  // Create an instance using `timer = createProgressTimeout(10000, onTimeout)`
  // Call `timer.progress()` to signal that there has been progress of any kind.
  // Call `timer.done()` when the upload has completed.


  XHRUpload.prototype.createProgressTimeout = function createProgressTimeout(timeout, timeoutHandler) {
    var uppy = this.uppy;
    var self = this;
    var isDone = false;

    function onTimedOut() {
      uppy.log('[XHRUpload] timed out');
      var error = new Error(self.i18n('timedOut', { seconds: Math.ceil(timeout / 1000) }));
      timeoutHandler(error);
    }

    var aliveTimer = null;
    function progress() {
      // Some browsers fire another progress event when the upload is
      // cancelled, so we have to ignore progress after the timer was
      // told to stop.
      if (isDone) return;

      if (timeout > 0) {
        if (aliveTimer) clearTimeout(aliveTimer);
        aliveTimer = setTimeout(onTimedOut, timeout);
      }
    }

    function done() {
      uppy.log('[XHRUpload] timer done');
      if (aliveTimer) {
        clearTimeout(aliveTimer);
        aliveTimer = null;
      }
      isDone = true;
    }

    return {
      progress: progress,
      done: done
    };
  };

  XHRUpload.prototype.createFormDataUpload = function createFormDataUpload(file, opts) {
    var formPost = new FormData();

    var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields
    // Send along all fields by default.
    : Object.keys(file.meta);
    metaFields.forEach(function (item) {
      formPost.append(item, file.meta[item]);
    });

    formPost.append(opts.fieldName, file.data);

    return formPost;
  };

  XHRUpload.prototype.createBareUpload = function createBareUpload(file, opts) {
    return file.data;
  };

  XHRUpload.prototype.upload = function upload(file, current, total) {
    var _this2 = this;

    var opts = this.getOptions(file);

    this.uppy.log('uploading ' + current + ' of ' + total);
    return new Promise(function (resolve, reject) {
      var data = opts.formData ? _this2.createFormDataUpload(file, opts) : _this2.createBareUpload(file, opts);

      var timer = _this2.createProgressTimeout(opts.timeout, function (error) {
        xhr.abort();
        _this2.uppy.emit('upload-error', file, error);
        reject(error);
      });

      var xhr = new XMLHttpRequest();
      var id = cuid();

      xhr.upload.addEventListener('loadstart', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' started');
        // Begin checking for timeouts when loading starts.
        timer.progress();
      });

      xhr.upload.addEventListener('progress', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' progress: ' + ev.loaded + ' / ' + ev.total);
        timer.progress();

        if (ev.lengthComputable) {
          _this2.uppy.emit('upload-progress', file, {
            uploader: _this2,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total
          });
        }
      });

      xhr.addEventListener('load', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' finished');
        timer.done();

        if (ev.target.status >= 200 && ev.target.status < 300) {
          var body = opts.getResponseData(xhr.responseText, xhr);
          var uploadURL = body[opts.responseUrlFieldName];

          var response = {
            status: ev.target.status,
            body: body,
            uploadURL: uploadURL
          };

          _this2.uppy.setFileState(file.id, { response: response });

          _this2.uppy.emit('upload-success', file, body, uploadURL);

          if (uploadURL) {
            _this2.uppy.log('Download ' + file.name + ' from ' + file.uploadURL);
          }

          return resolve(file);
        } else {
          var _body = opts.getResponseData(xhr.responseText, xhr);
          var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));

          var _response = {
            status: ev.target.status,
            body: _body
          };

          _this2.uppy.setFileState(file.id, { response: _response });

          _this2.uppy.emit('upload-error', file, error);
          return reject(error);
        }
      });

      xhr.addEventListener('error', function (ev) {
        _this2.uppy.log('[XHRUpload] ' + id + ' errored');
        timer.done();

        var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));
        _this2.uppy.emit('upload-error', file, error);
        return reject(error);
      });

      xhr.open(opts.method.toUpperCase(), opts.endpoint, true);

      xhr.withCredentials = opts.withCredentials;

      Object.keys(opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, opts.headers[header]);
      });

      xhr.send(data);

      _this2.uppy.on('file-removed', function (removedFile) {
        if (removedFile.id === file.id) {
          timer.done();
          xhr.abort();
        }
      });

      _this2.uppy.on('upload-cancel', function (fileID) {
        if (fileID === file.id) {
          timer.done();
          xhr.abort();
        }
      });

      _this2.uppy.on('cancel-all', function () {
        timer.done();
        xhr.abort();
      });
    });
  };

  XHRUpload.prototype.uploadRemote = function uploadRemote(file, current, total) {
    var _this3 = this;

    var opts = this.getOptions(file);
    return new Promise(function (resolve, reject) {
      var fields = {};
      var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields
      // Send along all fields by default.
      : Object.keys(file.meta);

      metaFields.forEach(function (name) {
        fields[name] = file.meta[name];
      });

      var provider = new Provider(_this3.uppy, file.remote.providerOptions);
      provider.post(file.remote.url, _extends({}, file.remote.body, {
        endpoint: opts.endpoint,
        size: file.data.size,
        fieldname: opts.fieldName,
        metadata: fields,
        headers: opts.headers
      })).then(function (res) {
        var token = res.token;
        var host = getSocketHost(file.remote.serverUrl);
        var socket = new Socket({ target: host + '/api/' + token });

        socket.on('progress', function (progressData) {
          return emitSocketProgress(_this3, progressData, file);
        });

        socket.on('success', function (data) {
          var resp = opts.getResponseData(data.response.responseText, data.response);
          var uploadURL = resp[opts.responseUrlFieldName];
          _this3.uppy.emit('upload-success', file, resp, uploadURL);
          socket.close();
          return resolve();
        });

        socket.on('error', function (errData) {
          var resp = errData.response;
          var error = resp ? opts.getResponseError(resp.responseText, resp) : _extends(new Error(errData.error.message), { cause: errData.error });
          _this3.uppy.emit('upload-error', file, error);
          reject(error);
        });
      });
    });
  };

  XHRUpload.prototype.uploadBundle = function uploadBundle(files) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      var endpoint = _this4.opts.endpoint;
      var method = _this4.opts.method;

      var formData = new FormData();
      files.forEach(function (file, i) {
        var opts = _this4.getOptions(file);
        formData.append(opts.fieldName, file.data);
      });

      var xhr = new XMLHttpRequest();

      xhr.withCredentials = _this4.opts.withCredentials;

      var timer = _this4.createProgressTimeout(_this4.opts.timeout, function (error) {
        xhr.abort();
        emitError(error);
        reject(error);
      });

      var emitError = function emitError(error) {
        files.forEach(function (file) {
          _this4.uppy.emit('upload-error', file, error);
        });
      };

      xhr.upload.addEventListener('loadstart', function (ev) {
        _this4.uppy.log('[XHRUpload] started uploading bundle');
        timer.progress();
      });

      xhr.upload.addEventListener('progress', function (ev) {
        timer.progress();

        if (!ev.lengthComputable) return;

        files.forEach(function (file) {
          _this4.uppy.emit('upload-progress', file, {
            uploader: _this4,
            bytesUploaded: ev.loaded / ev.total * file.size,
            bytesTotal: file.size
          });
        });
      });

      xhr.addEventListener('load', function (ev) {
        timer.done();

        if (ev.target.status >= 200 && ev.target.status < 300) {
          var resp = _this4.opts.getResponseData(xhr.responseText, xhr);
          files.forEach(function (file) {
            _this4.uppy.emit('upload-success', file, resp);
          });
          return resolve();
        }

        var error = _this4.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        error.request = xhr;
        emitError(error);
        return reject(error);
      });

      xhr.addEventListener('error', function (ev) {
        timer.done();

        var error = _this4.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        emitError(error);
        return reject(error);
      });

      _this4.uppy.on('cancel-all', function () {
        timer.done();
        xhr.abort();
      });

      xhr.open(method.toUpperCase(), endpoint, true);

      xhr.withCredentials = _this4.opts.withCredentials;

      Object.keys(_this4.opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, _this4.opts.headers[header]);
      });

      xhr.send(formData);

      files.forEach(function (file) {
        _this4.uppy.emit('upload-started', file);
      });
    });
  };

  XHRUpload.prototype.uploadFiles = function uploadFiles(files) {
    var _this5 = this;

    var actions = files.map(function (file, i) {
      var current = parseInt(i, 10) + 1;
      var total = files.length;

      if (file.error) {
        return function () {
          return Promise.reject(new Error(file.error));
        };
      } else if (file.isRemote) {
        // We emit upload-started here, so that it's also emitted for files
        // that have to wait due to the `limit` option.
        _this5.uppy.emit('upload-started', file);
        return _this5.uploadRemote.bind(_this5, file, current, total);
      } else {
        _this5.uppy.emit('upload-started', file);
        return _this5.upload.bind(_this5, file, current, total);
      }
    });

    var promises = actions.map(function (action) {
      var limitedAction = _this5.limitUploads(action);
      return limitedAction();
    });

    return settle(promises);
  };

  XHRUpload.prototype.handleUpload = function handleUpload(fileIDs) {
    var _this6 = this;

    if (fileIDs.length === 0) {
      this.uppy.log('[XHRUpload] No files to upload!');
      return Promise.resolve();
    }

    this.uppy.log('[XHRUpload] Uploading...');
    var files = fileIDs.map(function (fileID) {
      return _this6.uppy.getFile(fileID);
    });

    if (this.opts.bundle) {
      return this.uploadBundle(files);
    }

    return this.uploadFiles(files).then(function () {
      return null;
    });
  };

  XHRUpload.prototype.install = function install() {
    if (this.opts.bundle) {
      this.uppy.setState({
        capabilities: _extends({}, this.uppy.getState().capabilities, {
          bundled: true
        })
      });
    }

    this.uppy.addUploader(this.handleUpload);
  };

  XHRUpload.prototype.uninstall = function uninstall() {
    if (this.opts.bundle) {
      this.uppy.setState({
        capabilities: _extends({}, this.uppy.getState().capabilities, {
          bundled: true
        })
      });
    }

    this.uppy.removeUploader(this.handleUpload);
  };

  return XHRUpload;
}(Plugin);

},{"./../../core/lib/Plugin":10,"./../../server-utils":17,"./../../utils/lib/Translator":19,"./../../utils/lib/emitSocketProgress":20,"./../../utils/lib/getSocketHost":25,"./../../utils/lib/limitPromises":29,"./../../utils/lib/settle":31,"cuid":1}],34:[function(require,module,exports){
var Uppy = require('./../../../../packages/@uppy/core');
var FileInput = require('./../../../../packages/@uppy/file-input');
var XHRUpload = require('./../../../../packages/@uppy/xhr-upload');
var ProgressBar = require('./../../../../packages/@uppy/progress-bar');

var uppy = new Uppy({ debug: true, autoProceed: true });
uppy.use(FileInput, { target: '.UppyForm', replaceTargetContent: true });
uppy.use(XHRUpload, {
  endpoint: '//api2.transloadit.com',
  formData: true,
  fieldName: 'files[]'
});
uppy.use(ProgressBar, {
  target: 'body',
  fixed: true,
  hideAfterFinish: false
});

console.log('Uppy with Formtag and XHRUpload is loaded');

},{"./../../../../packages/@uppy/core":11,"./../../../../packages/@uppy/file-input":12,"./../../../../packages/@uppy/progress-bar":13,"./../../../../packages/@uppy/xhr-upload":33}]},{},[34])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jdWlkL2xpYi9maW5nZXJwcmludC5icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2N1aWQvbGliL3BhZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWltZS1tYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW1lc3BhY2UtZW1pdHRlci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJldHRpZXItYnl0ZXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2lsZGNhcmQvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL2xpYi9QbHVnaW4uanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL2xpYi9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2ZpbGUtaW5wdXQvbGliL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvcHJvZ3Jlc3MtYmFyL2xpYi9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3NlcnZlci11dGlscy9saWIvUHJvdmlkZXIuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zZXJ2ZXItdXRpbHMvbGliL1JlcXVlc3RDbGllbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zZXJ2ZXItdXRpbHMvbGliL1NvY2tldC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3NlcnZlci11dGlscy9saWIvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdG9yZS1kZWZhdWx0L2xpYi9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9UcmFuc2xhdG9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvbGliL2VtaXRTb2NrZXRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9maW5kRE9NRWxlbWVudC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9nZW5lcmF0ZUZpbGVJRC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlVHlwZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9nZXRTb2NrZXRIb3N0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvbGliL2dldFRpbWVTdGFtcC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9pc0RPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvaXNPYmplY3RVUkwuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvbGltaXRQcm9taXNlcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9taW1lVHlwZXMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvc2V0dGxlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvbGliL3RvQXJyYXkuanMiLCIuLi9wYWNrYWdlcy9AdXBweS94aHItdXBsb2FkL2xpYi9pbmRleC5qcyIsInNyYy9leGFtcGxlcy94aHJ1cGxvYWQvYXBwLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QVQsRUFBb0I7QUFDbEIsWUFBVSx3QkFEUTtBQUVsQixZQUFVLElBRlE7QUFHbEIsYUFBVztBQUhPLENBQXBCO0FBS0EsS0FBSyxHQUFMLENBQVMsV0FBVCxFQUFzQjtBQUNwQixVQUFRLE1BRFk7QUFFcEIsU0FBTyxJQUZhO0FBR3BCLG1CQUFpQjtBQUhHLENBQXRCOztBQU1BLFFBQVEsR0FBUixDQUFZLDJDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBjdWlkLmpzXG4gKiBDb2xsaXNpb24tcmVzaXN0YW50IFVJRCBnZW5lcmF0b3IgZm9yIGJyb3dzZXJzIGFuZCBub2RlLlxuICogU2VxdWVudGlhbCBmb3IgZmFzdCBkYiBsb29rdXBzIGFuZCByZWNlbmN5IHNvcnRpbmcuXG4gKiBTYWZlIGZvciBlbGVtZW50IElEcyBhbmQgc2VydmVyLXNpZGUgbG9va3Vwcy5cbiAqXG4gKiBFeHRyYWN0ZWQgZnJvbSBDTENUUlxuICpcbiAqIENvcHlyaWdodCAoYykgRXJpYyBFbGxpb3R0IDIwMTJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxudmFyIGZpbmdlcnByaW50ID0gcmVxdWlyZSgnLi9saWIvZmluZ2VycHJpbnQuanMnKTtcbnZhciBwYWQgPSByZXF1aXJlKCcuL2xpYi9wYWQuanMnKTtcblxudmFyIGMgPSAwLFxuICBibG9ja1NpemUgPSA0LFxuICBiYXNlID0gMzYsXG4gIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKTtcblxuZnVuY3Rpb24gcmFuZG9tQmxvY2sgKCkge1xuICByZXR1cm4gcGFkKChNYXRoLnJhbmRvbSgpICpcbiAgICBkaXNjcmV0ZVZhbHVlcyA8PCAwKVxuICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbn1cblxuZnVuY3Rpb24gc2FmZUNvdW50ZXIgKCkge1xuICBjID0gYyA8IGRpc2NyZXRlVmFsdWVzID8gYyA6IDA7XG4gIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICByZXR1cm4gYyAtIDE7XG59XG5cbmZ1bmN0aW9uIGN1aWQgKCkge1xuICAvLyBTdGFydGluZyB3aXRoIGEgbG93ZXJjYXNlIGxldHRlciBtYWtlc1xuICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgLy8gdGltZXN0YW1wXG4gICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoYmFzZSksXG5cbiAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgIGNvdW50ZXIgPSBwYWQoc2FmZUNvdW50ZXIoKS50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKSxcblxuICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAvLyBsaWtlbHkgdG8gZ2VuZXJhdGUgdGhlIHNhbWUgaWQpXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLFxuXG4gICAgLy8gR3JhYiBzb21lIG1vcmUgY2hhcnMgZnJvbSBNYXRoLnJhbmRvbSgpXG4gICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgcmV0dXJuIGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbn1cblxuY3VpZC5zbHVnID0gZnVuY3Rpb24gc2x1ZyAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCksXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLnNsaWNlKDAsIDEpICtcbiAgICAgIGZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gIHJldHVybiBkYXRlLnNsaWNlKC0yKSArXG4gICAgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xufTtcblxuY3VpZC5maW5nZXJwcmludCA9IGZpbmdlcnByaW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGN1aWQ7XG4iLCJ2YXIgcGFkID0gcmVxdWlyZSgnLi9wYWQuanMnKTtcblxudmFyIGVudiA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93IDogc2VsZjtcbnZhciBnbG9iYWxDb3VudCA9IE9iamVjdC5rZXlzKGVudikubGVuZ3RoO1xudmFyIG1pbWVUeXBlc0xlbmd0aCA9IG5hdmlnYXRvci5taW1lVHlwZXMgPyBuYXZpZ2F0b3IubWltZVR5cGVzLmxlbmd0aCA6IDA7XG52YXIgY2xpZW50SWQgPSBwYWQoKG1pbWVUeXBlc0xlbmd0aCArXG4gIG5hdmlnYXRvci51c2VyQWdlbnQubGVuZ3RoKS50b1N0cmluZygzNikgK1xuICBnbG9iYWxDb3VudC50b1N0cmluZygzNiksIDQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmdlcnByaW50ICgpIHtcbiAgcmV0dXJuIGNsaWVudElkO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFkIChudW0sIHNpemUpIHtcbiAgdmFyIHMgPSAnMDAwMDAwMDAwJyArIG51bTtcbiAgcmV0dXJuIHMuc3Vic3RyKHMubGVuZ3RoIC0gc2l6ZSk7XG59O1xuIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICByZXN1bHQgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nID8gbmF0aXZlTWluKHJlc3VsdCwgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRocm90dGxlZCBmdW5jdGlvbiB0aGF0IG9ubHkgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmNlIHBlclxuICogZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGBcbiAqIG1ldGhvZCB0byBjYW5jZWwgZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG9cbiAqIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYFxuICogc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YFxuICogdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZVxuICogdGhyb3R0bGVkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gcmV0dXJuIHRoZVxuICogcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLnRocm90dGxlYCBhbmQgYF8uZGVib3VuY2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCkpO1xuICpcbiAqIC8vIEludm9rZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzLlxuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7ICd0cmFpbGluZyc6IGZhbHNlIH0pO1xuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIHRocm90dGxlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyB0aHJvdHRsZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRocm90dGxlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwge1xuICAgICdsZWFkaW5nJzogbGVhZGluZyxcbiAgICAnbWF4V2FpdCc6IHdhaXQsXG4gICAgJ3RyYWlsaW5nJzogdHJhaWxpbmdcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVUcmltLCAnJyk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwidmFyIHdpbGRjYXJkID0gcmVxdWlyZSgnd2lsZGNhcmQnKTtcbnZhciByZU1pbWVQYXJ0U3BsaXQgPSAvW1xcL1xcK1xcLl0vO1xuXG4vKipcbiAgIyBtaW1lLW1hdGNoXG5cbiAgQSBzaW1wbGUgZnVuY3Rpb24gdG8gY2hlY2tlciB3aGV0aGVyIGEgdGFyZ2V0IG1pbWUgdHlwZSBtYXRjaGVzIGEgbWltZS10eXBlXG4gIHBhdHRlcm4gKGUuZy4gaW1hZ2UvanBlZyBtYXRjaGVzIGltYWdlL2pwZWcgT1IgaW1hZ2UvKikuXG5cbiAgIyMgRXhhbXBsZSBVc2FnZVxuXG4gIDw8PCBleGFtcGxlLmpzXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHBhdHRlcm4pIHtcbiAgZnVuY3Rpb24gdGVzdChwYXR0ZXJuKSB7XG4gICAgdmFyIHJlc3VsdCA9IHdpbGRjYXJkKHBhdHRlcm4sIHRhcmdldCwgcmVNaW1lUGFydFNwbGl0KTtcblxuICAgIC8vIGVuc3VyZSB0aGF0IHdlIGhhdmUgYSB2YWxpZCBtaW1lIHR5cGUgKHNob3VsZCBoYXZlIHR3byBwYXJ0cylcbiAgICByZXR1cm4gcmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPj0gMjtcbiAgfVxuXG4gIHJldHVybiBwYXR0ZXJuID8gdGVzdChwYXR0ZXJuLnNwbGl0KCc7JylbMF0pIDogdGVzdDtcbn07XG4iLCIvKipcbiogQ3JlYXRlIGFuIGV2ZW50IGVtaXR0ZXIgd2l0aCBuYW1lc3BhY2VzXG4qIEBuYW1lIGNyZWF0ZU5hbWVzcGFjZUVtaXR0ZXJcbiogQGV4YW1wbGVcbiogdmFyIGVtaXR0ZXIgPSByZXF1aXJlKCcuL2luZGV4JykoKVxuKlxuKiBlbWl0dGVyLm9uKCcqJywgZnVuY3Rpb24gKCkge1xuKiAgIGNvbnNvbGUubG9nKCdhbGwgZXZlbnRzIGVtaXR0ZWQnLCB0aGlzLmV2ZW50KVxuKiB9KVxuKlxuKiBlbWl0dGVyLm9uKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge1xuKiAgIGNvbnNvbGUubG9nKCdleGFtcGxlIGV2ZW50IGVtaXR0ZWQnKVxuKiB9KVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlTmFtZXNwYWNlRW1pdHRlciAoKSB7XG4gIHZhciBlbWl0dGVyID0ge31cbiAgdmFyIF9mbnMgPSBlbWl0dGVyLl9mbnMgPSB7fVxuXG4gIC8qKlxuICAqIEVtaXQgYW4gZXZlbnQuIE9wdGlvbmFsbHkgbmFtZXNwYWNlIHRoZSBldmVudC4gSGFuZGxlcnMgYXJlIGZpcmVkIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IHdlcmUgYWRkZWQgd2l0aCBleGFjdCBtYXRjaGVzIHRha2luZyBwcmVjZWRlbmNlLiBTZXBhcmF0ZSB0aGUgbmFtZXNwYWNlIGFuZCBldmVudCB3aXRoIGEgYDpgXG4gICogQG5hbWUgZW1pdFxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCDigJMgdGhlIG5hbWUgb2YgdGhlIGV2ZW50LCB3aXRoIG9wdGlvbmFsIG5hbWVzcGFjZVxuICAqIEBwYXJhbSB7Li4uKn0gZGF0YSDigJMgdXAgdG8gNiBhcmd1bWVudHMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBldmVudCBsaXN0ZW5lclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5lbWl0KCdleGFtcGxlJylcbiAgKiBlbWl0dGVyLmVtaXQoJ2RlbW86dGVzdCcpXG4gICogZW1pdHRlci5lbWl0KCdkYXRhJywgeyBleGFtcGxlOiB0cnVlfSwgJ2Egc3RyaW5nJywgMSlcbiAgKi9cbiAgZW1pdHRlci5lbWl0ID0gZnVuY3Rpb24gZW1pdCAoZXZlbnQsIGFyZzEsIGFyZzIsIGFyZzMsIGFyZzQsIGFyZzUsIGFyZzYpIHtcbiAgICB2YXIgdG9FbWl0ID0gZ2V0TGlzdGVuZXJzKGV2ZW50KVxuXG4gICAgaWYgKHRvRW1pdC5sZW5ndGgpIHtcbiAgICAgIGVtaXRBbGwoZXZlbnQsIHRvRW1pdCwgW2FyZzEsIGFyZzIsIGFyZzMsIGFyZzQsIGFyZzUsIGFyZzZdKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZSBlbiBldmVudCBsaXN0ZW5lci5cbiAgKiBAbmFtZSBvblxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9uKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbignZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9uID0gZnVuY3Rpb24gb24gKGV2ZW50LCBmbikge1xuICAgIGlmICghX2Zuc1tldmVudF0pIHtcbiAgICAgIF9mbnNbZXZlbnRdID0gW11cbiAgICB9XG5cbiAgICBfZm5zW2V2ZW50XS5wdXNoKGZuKVxuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlIGVuIGV2ZW50IGxpc3RlbmVyIHRoYXQgZmlyZXMgb25jZS5cbiAgKiBAbmFtZSBvbmNlXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub25jZSgnZXhhbXBsZScsIGZ1bmN0aW9uICgpIHt9KVxuICAqIGVtaXR0ZXIub25jZSgnZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9uY2UgPSBmdW5jdGlvbiBvbmNlIChldmVudCwgZm4pIHtcbiAgICBmdW5jdGlvbiBvbmUgKCkge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgZW1pdHRlci5vZmYoZXZlbnQsIG9uZSlcbiAgICB9XG4gICAgdGhpcy5vbihldmVudCwgb25lKVxuICB9XG5cbiAgLyoqXG4gICogU3RvcCBsaXN0ZW5pbmcgdG8gYW4gZXZlbnQuIFN0b3AgYWxsIGxpc3RlbmVycyBvbiBhbiBldmVudCBieSBvbmx5IHBhc3NpbmcgdGhlIGV2ZW50IG5hbWUuIFN0b3AgYSBzaW5nbGUgbGlzdGVuZXIgYnkgcGFzc2luZyB0aGF0IGV2ZW50IGhhbmRsZXIgYXMgYSBjYWxsYmFjay5cbiAgKiBZb3UgbXVzdCBiZSBleHBsaWNpdCBhYm91dCB3aGF0IHdpbGwgYmUgdW5zdWJzY3JpYmVkOiBgZW1pdHRlci5vZmYoJ2RlbW8nKWAgd2lsbCB1bnN1YnNjcmliZSBhbiBgZW1pdHRlci5vbignZGVtbycpYCBsaXN0ZW5lcixcbiAgKiBgZW1pdHRlci5vZmYoJ2RlbW86ZXhhbXBsZScpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vOmV4YW1wbGUnKWAgbGlzdGVuZXJcbiAgKiBAbmFtZSBvZmZcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dIOKAkyB0aGUgc3BlY2lmaWMgaGFuZGxlclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vZmYoJ2V4YW1wbGUnKVxuICAqIGVtaXR0ZXIub2ZmKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub2ZmID0gZnVuY3Rpb24gb2ZmIChldmVudCwgZm4pIHtcbiAgICB2YXIga2VlcCA9IFtdXG5cbiAgICBpZiAoZXZlbnQgJiYgZm4pIHtcbiAgICAgIHZhciBmbnMgPSB0aGlzLl9mbnNbZXZlbnRdXG4gICAgICB2YXIgaSA9IDBcbiAgICAgIHZhciBsID0gZm5zID8gZm5zLmxlbmd0aCA6IDBcblxuICAgICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChmbnNbaV0gIT09IGZuKSB7XG4gICAgICAgICAga2VlcC5wdXNoKGZuc1tpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGtlZXAubGVuZ3RoID8gdGhpcy5fZm5zW2V2ZW50XSA9IGtlZXAgOiBkZWxldGUgdGhpcy5fZm5zW2V2ZW50XVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGlzdGVuZXJzIChlKSB7XG4gICAgdmFyIG91dCA9IF9mbnNbZV0gPyBfZm5zW2VdIDogW11cbiAgICB2YXIgaWR4ID0gZS5pbmRleE9mKCc6JylcbiAgICB2YXIgYXJncyA9IChpZHggPT09IC0xKSA/IFtlXSA6IFtlLnN1YnN0cmluZygwLCBpZHgpLCBlLnN1YnN0cmluZyhpZHggKyAxKV1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoX2ZucylcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbCA9IGtleXMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICBpZiAoa2V5ID09PSAnKicpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMiAmJiBhcmdzWzBdID09PSBrZXkpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdEFsbCAoZSwgZm5zLCBhcmdzKSB7XG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIGwgPSBmbnMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICghZm5zW2ldKSBicmVha1xuICAgICAgZm5zW2ldLmV2ZW50ID0gZVxuICAgICAgZm5zW2ldLmFwcGx5KGZuc1tpXSwgYXJncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZW1pdHRlclxufVxuIiwiIWZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBmdW5jdGlvbiBWTm9kZSgpIHt9XG4gICAgZnVuY3Rpb24gaChub2RlTmFtZSwgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIgbGFzdFNpbXBsZSwgY2hpbGQsIHNpbXBsZSwgaSwgY2hpbGRyZW4gPSBFTVBUWV9DSElMRFJFTjtcbiAgICAgICAgZm9yIChpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSBzdGFjay5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzICYmIG51bGwgIT0gYXR0cmlidXRlcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgaWYgKCFzdGFjay5sZW5ndGgpIHN0YWNrLnB1c2goYXR0cmlidXRlcy5jaGlsZHJlbik7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy5jaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoKSBpZiAoKGNoaWxkID0gc3RhY2sucG9wKCkpICYmIHZvaWQgMCAhPT0gY2hpbGQucG9wKSBmb3IgKGkgPSBjaGlsZC5sZW5ndGg7IGktLTsgKSBzdGFjay5wdXNoKGNoaWxkW2ldKTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiBjaGlsZCkgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSA9ICdmdW5jdGlvbicgIT0gdHlwZW9mIG5vZGVOYW1lKSBpZiAobnVsbCA9PSBjaGlsZCkgY2hpbGQgPSAnJzsgZWxzZSBpZiAoJ251bWJlcicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IFN0cmluZyhjaGlsZCk7IGVsc2UgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBjaGlsZCkgc2ltcGxlID0gITE7XG4gICAgICAgICAgICBpZiAoc2ltcGxlICYmIGxhc3RTaW1wbGUpIGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aCAtIDFdICs9IGNoaWxkOyBlbHNlIGlmIChjaGlsZHJlbiA9PT0gRU1QVFlfQ0hJTERSRU4pIGNoaWxkcmVuID0gWyBjaGlsZCBdOyBlbHNlIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgbGFzdFNpbXBsZSA9IHNpbXBsZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcCA9IG5ldyBWTm9kZSgpO1xuICAgICAgICBwLm5vZGVOYW1lID0gbm9kZU5hbWU7XG4gICAgICAgIHAuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgcC5hdHRyaWJ1dGVzID0gbnVsbCA9PSBhdHRyaWJ1dGVzID8gdm9pZCAwIDogYXR0cmlidXRlcztcbiAgICAgICAgcC5rZXkgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzLmtleTtcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gb3B0aW9ucy52bm9kZSkgb3B0aW9ucy52bm9kZShwKTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV4dGVuZChvYmosIHByb3BzKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gcHJvcHMpIG9ialtpXSA9IHByb3BzW2ldO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbG9uZUVsZW1lbnQodm5vZGUsIHByb3BzKSB7XG4gICAgICAgIHJldHVybiBoKHZub2RlLm5vZGVOYW1lLCBleHRlbmQoZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKSwgcHJvcHMpLCBhcmd1bWVudHMubGVuZ3RoID4gMiA/IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSA6IHZub2RlLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX19kICYmIChjb21wb25lbnQuX19kID0gITApICYmIDEgPT0gaXRlbXMucHVzaChjb21wb25lbnQpKSAob3B0aW9ucy5kZWJvdW5jZVJlbmRlcmluZyB8fCBkZWZlcikocmVyZW5kZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXJlbmRlcigpIHtcbiAgICAgICAgdmFyIHAsIGxpc3QgPSBpdGVtcztcbiAgICAgICAgaXRlbXMgPSBbXTtcbiAgICAgICAgd2hpbGUgKHAgPSBsaXN0LnBvcCgpKSBpZiAocC5fX2QpIHJlbmRlckNvbXBvbmVudChwKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTYW1lTm9kZVR5cGUobm9kZSwgdm5vZGUsIGh5ZHJhdGluZykge1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkgcmV0dXJuIHZvaWQgMCAhPT0gbm9kZS5zcGxpdFRleHQ7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUubm9kZU5hbWUpIHJldHVybiAhbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgJiYgaXNOYW1lZE5vZGUobm9kZSwgdm5vZGUubm9kZU5hbWUpOyBlbHNlIHJldHVybiBoeWRyYXRpbmcgfHwgbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc05hbWVkTm9kZShub2RlLCBub2RlTmFtZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5fX24gPT09IG5vZGVOYW1lIHx8IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0Tm9kZVByb3BzKHZub2RlKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyk7XG4gICAgICAgIHByb3BzLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIHZhciBkZWZhdWx0UHJvcHMgPSB2bm9kZS5ub2RlTmFtZS5kZWZhdWx0UHJvcHM7XG4gICAgICAgIGlmICh2b2lkIDAgIT09IGRlZmF1bHRQcm9wcykgZm9yICh2YXIgaSBpbiBkZWZhdWx0UHJvcHMpIGlmICh2b2lkIDAgPT09IHByb3BzW2ldKSBwcm9wc1tpXSA9IGRlZmF1bHRQcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVOb2RlKG5vZGVOYW1lLCBpc1N2Zykge1xuICAgICAgICB2YXIgbm9kZSA9IGlzU3ZnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5vZGVOYW1lKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuICAgICAgICBub2RlLl9fbiA9IG5vZGVOYW1lO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICBpZiAocGFyZW50Tm9kZSkgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0QWNjZXNzb3Iobm9kZSwgbmFtZSwgb2xkLCB2YWx1ZSwgaXNTdmcpIHtcbiAgICAgICAgaWYgKCdjbGFzc05hbWUnID09PSBuYW1lKSBuYW1lID0gJ2NsYXNzJztcbiAgICAgICAgaWYgKCdrZXknID09PSBuYW1lKSA7IGVsc2UgaWYgKCdyZWYnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAob2xkKSBvbGQobnVsbCk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHZhbHVlKG5vZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKCdjbGFzcycgPT09IG5hbWUgJiYgIWlzU3ZnKSBub2RlLmNsYXNzTmFtZSA9IHZhbHVlIHx8ICcnOyBlbHNlIGlmICgnc3R5bGUnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiB2YWx1ZSB8fCAnc3RyaW5nJyA9PSB0eXBlb2Ygb2xkKSBub2RlLnN0eWxlLmNzc1RleHQgPSB2YWx1ZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIG9sZCkgZm9yICh2YXIgaSBpbiBvbGQpIGlmICghKGkgaW4gdmFsdWUpKSBub2RlLnN0eWxlW2ldID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB2YWx1ZSkgbm9kZS5zdHlsZVtpXSA9ICdudW1iZXInID09IHR5cGVvZiB2YWx1ZVtpXSAmJiAhMSA9PT0gSVNfTk9OX0RJTUVOU0lPTkFMLnRlc3QoaSkgPyB2YWx1ZVtpXSArICdweCcgOiB2YWx1ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIG5vZGUuaW5uZXJIVE1MID0gdmFsdWUuX19odG1sIHx8ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKCdvJyA9PSBuYW1lWzBdICYmICduJyA9PSBuYW1lWzFdKSB7XG4gICAgICAgICAgICB2YXIgdXNlQ2FwdHVyZSA9IG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9DYXB0dXJlJC8sICcnKSk7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghb2xkKSBub2RlLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9IGVsc2Ugbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgKG5vZGUuX19sIHx8IChub2RlLl9fbCA9IHt9KSlbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICgnbGlzdCcgIT09IG5hbWUgJiYgJ3R5cGUnICE9PSBuYW1lICYmICFpc1N2ZyAmJiBuYW1lIGluIG5vZGUpIHtcbiAgICAgICAgICAgIHNldFByb3BlcnR5KG5vZGUsIG5hbWUsIG51bGwgPT0gdmFsdWUgPyAnJyA6IHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8ICExID09PSB2YWx1ZSkgbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbnMgPSBpc1N2ZyAmJiBuYW1lICE9PSAobmFtZSA9IG5hbWUucmVwbGFjZSgvXnhsaW5rOj8vLCAnJykpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgITEgPT09IHZhbHVlKSBpZiAobnMpIG5vZGUucmVtb3ZlQXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBuYW1lLnRvTG93ZXJDYXNlKCkpOyBlbHNlIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpOyBlbHNlIGlmICgnZnVuY3Rpb24nICE9IHR5cGVvZiB2YWx1ZSkgaWYgKG5zKSBub2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpLCB2YWx1ZSk7IGVsc2Ugbm9kZS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldFByb3BlcnR5KG5vZGUsIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBub2RlW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV2ZW50UHJveHkoZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2xbZS50eXBlXShvcHRpb25zLmV2ZW50ICYmIG9wdGlvbnMuZXZlbnQoZSkgfHwgZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZsdXNoTW91bnRzKCkge1xuICAgICAgICB2YXIgYztcbiAgICAgICAgd2hpbGUgKGMgPSBtb3VudHMucG9wKCkpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmFmdGVyTW91bnQpIG9wdGlvbnMuYWZ0ZXJNb3VudChjKTtcbiAgICAgICAgICAgIGlmIChjLmNvbXBvbmVudERpZE1vdW50KSBjLmNvbXBvbmVudERpZE1vdW50KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgcGFyZW50LCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIGlmICghZGlmZkxldmVsKyspIHtcbiAgICAgICAgICAgIGlzU3ZnTW9kZSA9IG51bGwgIT0gcGFyZW50ICYmIHZvaWQgMCAhPT0gcGFyZW50Lm93bmVyU1ZHRWxlbWVudDtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9IG51bGwgIT0gZG9tICYmICEoJ19fcHJlYWN0YXR0cl8nIGluIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJldCA9IGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KTtcbiAgICAgICAgaWYgKHBhcmVudCAmJiByZXQucGFyZW50Tm9kZSAhPT0gcGFyZW50KSBwYXJlbnQuYXBwZW5kQ2hpbGQocmV0KTtcbiAgICAgICAgaWYgKCEtLWRpZmZMZXZlbCkge1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gITE7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudFJvb3QpIGZsdXNoTW91bnRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgdmFyIG91dCA9IGRvbSwgcHJldlN2Z01vZGUgPSBpc1N2Z01vZGU7XG4gICAgICAgIGlmIChudWxsID09IHZub2RlIHx8ICdib29sZWFuJyA9PSB0eXBlb2Ygdm5vZGUpIHZub2RlID0gJyc7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSB7XG4gICAgICAgICAgICBpZiAoZG9tICYmIHZvaWQgMCAhPT0gZG9tLnNwbGl0VGV4dCAmJiBkb20ucGFyZW50Tm9kZSAmJiAoIWRvbS5fY29tcG9uZW50IHx8IGNvbXBvbmVudFJvb3QpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbS5ub2RlVmFsdWUgIT0gdm5vZGUpIGRvbS5ub2RlVmFsdWUgPSB2bm9kZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodm5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKSBkb20ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQob3V0LCBkb20pO1xuICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXQuX19wcmVhY3RhdHRyXyA9ICEwO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdm5vZGVOYW1lID0gdm5vZGUubm9kZU5hbWU7XG4gICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB2bm9kZU5hbWUpIHJldHVybiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgIGlzU3ZnTW9kZSA9ICdzdmcnID09PSB2bm9kZU5hbWUgPyAhMCA6ICdmb3JlaWduT2JqZWN0JyA9PT0gdm5vZGVOYW1lID8gITEgOiBpc1N2Z01vZGU7XG4gICAgICAgIHZub2RlTmFtZSA9IFN0cmluZyh2bm9kZU5hbWUpO1xuICAgICAgICBpZiAoIWRvbSB8fCAhaXNOYW1lZE5vZGUoZG9tLCB2bm9kZU5hbWUpKSB7XG4gICAgICAgICAgICBvdXQgPSBjcmVhdGVOb2RlKHZub2RlTmFtZSwgaXNTdmdNb2RlKTtcbiAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIG91dC5hcHBlbmRDaGlsZChkb20uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKSBkb20ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQob3V0LCBkb20pO1xuICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgITApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBmYyA9IG91dC5maXJzdENoaWxkLCBwcm9wcyA9IG91dC5fX3ByZWFjdGF0dHJfLCB2Y2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKG51bGwgPT0gcHJvcHMpIHtcbiAgICAgICAgICAgIHByb3BzID0gb3V0Ll9fcHJlYWN0YXR0cl8gPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGEgPSBvdXQuYXR0cmlidXRlcywgaSA9IGEubGVuZ3RoOyBpLS07ICkgcHJvcHNbYVtpXS5uYW1lXSA9IGFbaV0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoeWRyYXRpbmcgJiYgdmNoaWxkcmVuICYmIDEgPT09IHZjaGlsZHJlbi5sZW5ndGggJiYgJ3N0cmluZycgPT0gdHlwZW9mIHZjaGlsZHJlblswXSAmJiBudWxsICE9IGZjICYmIHZvaWQgMCAhPT0gZmMuc3BsaXRUZXh0ICYmIG51bGwgPT0gZmMubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIGlmIChmYy5ub2RlVmFsdWUgIT0gdmNoaWxkcmVuWzBdKSBmYy5ub2RlVmFsdWUgPSB2Y2hpbGRyZW5bMF07XG4gICAgICAgIH0gZWxzZSBpZiAodmNoaWxkcmVuICYmIHZjaGlsZHJlbi5sZW5ndGggfHwgbnVsbCAhPSBmYykgaW5uZXJEaWZmTm9kZShvdXQsIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGh5ZHJhdGluZyB8fCBudWxsICE9IHByb3BzLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MKTtcbiAgICAgICAgZGlmZkF0dHJpYnV0ZXMob3V0LCB2bm9kZS5hdHRyaWJ1dGVzLCBwcm9wcyk7XG4gICAgICAgIGlzU3ZnTW9kZSA9IHByZXZTdmdNb2RlO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbm5lckRpZmZOb2RlKGRvbSwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgaXNIeWRyYXRpbmcpIHtcbiAgICAgICAgdmFyIGosIGMsIGYsIHZjaGlsZCwgY2hpbGQsIG9yaWdpbmFsQ2hpbGRyZW4gPSBkb20uY2hpbGROb2RlcywgY2hpbGRyZW4gPSBbXSwga2V5ZWQgPSB7fSwga2V5ZWRMZW4gPSAwLCBtaW4gPSAwLCBsZW4gPSBvcmlnaW5hbENoaWxkcmVuLmxlbmd0aCwgY2hpbGRyZW5MZW4gPSAwLCB2bGVuID0gdmNoaWxkcmVuID8gdmNoaWxkcmVuLmxlbmd0aCA6IDA7XG4gICAgICAgIGlmICgwICE9PSBsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBfY2hpbGQgPSBvcmlnaW5hbENoaWxkcmVuW2ldLCBwcm9wcyA9IF9jaGlsZC5fX3ByZWFjdGF0dHJfLCBrZXkgPSB2bGVuICYmIHByb3BzID8gX2NoaWxkLl9jb21wb25lbnQgPyBfY2hpbGQuX2NvbXBvbmVudC5fX2sgOiBwcm9wcy5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKG51bGwgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAga2V5ZWRMZW4rKztcbiAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gX2NoaWxkO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wcyB8fCAodm9pZCAwICE9PSBfY2hpbGQuc3BsaXRUZXh0ID8gaXNIeWRyYXRpbmcgPyBfY2hpbGQubm9kZVZhbHVlLnRyaW0oKSA6ICEwIDogaXNIeWRyYXRpbmcpKSBjaGlsZHJlbltjaGlsZHJlbkxlbisrXSA9IF9jaGlsZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoMCAhPT0gdmxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCB2bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZjaGlsZCA9IHZjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNoaWxkID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBrZXkgPSB2Y2hpbGQua2V5O1xuICAgICAgICAgICAgaWYgKG51bGwgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleWVkTGVuICYmIHZvaWQgMCAhPT0ga2V5ZWRba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IGtleWVkW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgIGtleWVkTGVuLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hpbGQgJiYgbWluIDwgY2hpbGRyZW5MZW4pIGZvciAoaiA9IG1pbjsgaiA8IGNoaWxkcmVuTGVuOyBqKyspIGlmICh2b2lkIDAgIT09IGNoaWxkcmVuW2pdICYmIGlzU2FtZU5vZGVUeXBlKGMgPSBjaGlsZHJlbltqXSwgdmNoaWxkLCBpc0h5ZHJhdGluZykpIHtcbiAgICAgICAgICAgICAgICBjaGlsZCA9IGM7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bal0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IGNoaWxkcmVuTGVuIC0gMSkgY2hpbGRyZW5MZW4tLTtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gbWluKSBtaW4rKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkID0gaWRpZmYoY2hpbGQsIHZjaGlsZCwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZiA9IG9yaWdpbmFsQ2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQgIT09IGRvbSAmJiBjaGlsZCAhPT0gZikgaWYgKG51bGwgPT0gZikgZG9tLmFwcGVuZENoaWxkKGNoaWxkKTsgZWxzZSBpZiAoY2hpbGQgPT09IGYubmV4dFNpYmxpbmcpIHJlbW92ZU5vZGUoZik7IGVsc2UgZG9tLmluc2VydEJlZm9yZShjaGlsZCwgZik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleWVkTGVuKSBmb3IgKHZhciBpIGluIGtleWVkKSBpZiAodm9pZCAwICE9PSBrZXllZFtpXSkgcmVjb2xsZWN0Tm9kZVRyZWUoa2V5ZWRbaV0sICExKTtcbiAgICAgICAgd2hpbGUgKG1pbiA8PSBjaGlsZHJlbkxlbikgaWYgKHZvaWQgMCAhPT0gKGNoaWxkID0gY2hpbGRyZW5bY2hpbGRyZW5MZW4tLV0pKSByZWNvbGxlY3ROb2RlVHJlZShjaGlsZCwgITEpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZWNvbGxlY3ROb2RlVHJlZShub2RlLCB1bm1vdW50T25seSkge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gbm9kZS5fY29tcG9uZW50O1xuICAgICAgICBpZiAoY29tcG9uZW50KSB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCk7IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gbm9kZS5fX3ByZWFjdGF0dHJfICYmIG5vZGUuX19wcmVhY3RhdHRyXy5yZWYpIG5vZGUuX19wcmVhY3RhdHRyXy5yZWYobnVsbCk7XG4gICAgICAgICAgICBpZiAoITEgPT09IHVubW91bnRPbmx5IHx8IG51bGwgPT0gbm9kZS5fX3ByZWFjdGF0dHJfKSByZW1vdmVOb2RlKG5vZGUpO1xuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4obm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQ2hpbGRyZW4obm9kZSkge1xuICAgICAgICBub2RlID0gbm9kZS5sYXN0Q2hpbGQ7XG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xuICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUobm9kZSwgITApO1xuICAgICAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZGlmZkF0dHJpYnV0ZXMoZG9tLCBhdHRycywgb2xkKSB7XG4gICAgICAgIHZhciBuYW1lO1xuICAgICAgICBmb3IgKG5hbWUgaW4gb2xkKSBpZiAoKCFhdHRycyB8fCBudWxsID09IGF0dHJzW25hbWVdKSAmJiBudWxsICE9IG9sZFtuYW1lXSkgc2V0QWNjZXNzb3IoZG9tLCBuYW1lLCBvbGRbbmFtZV0sIG9sZFtuYW1lXSA9IHZvaWQgMCwgaXNTdmdNb2RlKTtcbiAgICAgICAgZm9yIChuYW1lIGluIGF0dHJzKSBpZiAoISgnY2hpbGRyZW4nID09PSBuYW1lIHx8ICdpbm5lckhUTUwnID09PSBuYW1lIHx8IG5hbWUgaW4gb2xkICYmIGF0dHJzW25hbWVdID09PSAoJ3ZhbHVlJyA9PT0gbmFtZSB8fCAnY2hlY2tlZCcgPT09IG5hbWUgPyBkb21bbmFtZV0gOiBvbGRbbmFtZV0pKSkgc2V0QWNjZXNzb3IoZG9tLCBuYW1lLCBvbGRbbmFtZV0sIG9sZFtuYW1lXSA9IGF0dHJzW25hbWVdLCBpc1N2Z01vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb2xsZWN0Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgICAgICB2YXIgbmFtZSA9IGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICAoY29tcG9uZW50c1tuYW1lXSB8fCAoY29tcG9uZW50c1tuYW1lXSA9IFtdKSkucHVzaChjb21wb25lbnQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnQoQ3RvciwgcHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGluc3QsIGxpc3QgPSBjb21wb25lbnRzW0N0b3IubmFtZV07XG4gICAgICAgIGlmIChDdG9yLnByb3RvdHlwZSAmJiBDdG9yLnByb3RvdHlwZS5yZW5kZXIpIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBDb21wb25lbnQuY2FsbChpbnN0LCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnN0ID0gbmV3IENvbXBvbmVudChwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpbnN0LmNvbnN0cnVjdG9yID0gQ3RvcjtcbiAgICAgICAgICAgIGluc3QucmVuZGVyID0gZG9SZW5kZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3QpIGZvciAodmFyIGkgPSBsaXN0Lmxlbmd0aDsgaS0tOyApIGlmIChsaXN0W2ldLmNvbnN0cnVjdG9yID09PSBDdG9yKSB7XG4gICAgICAgICAgICBpbnN0Ll9fYiA9IGxpc3RbaV0uX19iO1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9SZW5kZXIocHJvcHMsIHN0YXRlLCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0Q29tcG9uZW50UHJvcHMoY29tcG9uZW50LCBwcm9wcywgb3B0cywgY29udGV4dCwgbW91bnRBbGwpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX194KSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX194ID0gITA7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fciA9IHByb3BzLnJlZikgZGVsZXRlIHByb3BzLnJlZjtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19rID0gcHJvcHMua2V5KSBkZWxldGUgcHJvcHMua2V5O1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYmFzZSB8fCBtb3VudEFsbCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbE1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbE1vdW50KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKSBjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0ICE9PSBjb21wb25lbnQuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50Ll9fYykgY29tcG9uZW50Ll9fYyA9IGNvbXBvbmVudC5jb250ZXh0O1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50Ll9fcCkgY29tcG9uZW50Ll9fcCA9IGNvbXBvbmVudC5wcm9wcztcbiAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9feCA9ICExO1xuICAgICAgICAgICAgaWYgKDAgIT09IG9wdHMpIGlmICgxID09PSBvcHRzIHx8ICExICE9PSBvcHRpb25zLnN5bmNDb21wb25lbnRVcGRhdGVzIHx8ICFjb21wb25lbnQuYmFzZSkgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCwgMSwgbW91bnRBbGwpOyBlbHNlIGVucXVldWVSZW5kZXIoY29tcG9uZW50KTtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19yKSBjb21wb25lbnQuX19yKGNvbXBvbmVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCwgb3B0cywgbW91bnRBbGwsIGlzQ2hpbGQpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX194KSB7XG4gICAgICAgICAgICB2YXIgcmVuZGVyZWQsIGluc3QsIGNiYXNlLCBwcm9wcyA9IGNvbXBvbmVudC5wcm9wcywgc3RhdGUgPSBjb21wb25lbnQuc3RhdGUsIGNvbnRleHQgPSBjb21wb25lbnQuY29udGV4dCwgcHJldmlvdXNQcm9wcyA9IGNvbXBvbmVudC5fX3AgfHwgcHJvcHMsIHByZXZpb3VzU3RhdGUgPSBjb21wb25lbnQuX19zIHx8IHN0YXRlLCBwcmV2aW91c0NvbnRleHQgPSBjb21wb25lbnQuX19jIHx8IGNvbnRleHQsIGlzVXBkYXRlID0gY29tcG9uZW50LmJhc2UsIG5leHRCYXNlID0gY29tcG9uZW50Ll9fYiwgaW5pdGlhbEJhc2UgPSBpc1VwZGF0ZSB8fCBuZXh0QmFzZSwgaW5pdGlhbENoaWxkQ29tcG9uZW50ID0gY29tcG9uZW50Ll9jb21wb25lbnQsIHNraXAgPSAhMTtcbiAgICAgICAgICAgIGlmIChpc1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByZXZpb3VzUHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gcHJldmlvdXNTdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IHByZXZpb3VzQ29udGV4dDtcbiAgICAgICAgICAgICAgICBpZiAoMiAhPT0gb3B0cyAmJiBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlICYmICExID09PSBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCkpIHNraXAgPSAhMDsgZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50Ll9fcCA9IGNvbXBvbmVudC5fX3MgPSBjb21wb25lbnQuX19jID0gY29tcG9uZW50Ll9fYiA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX19kID0gITE7XG4gICAgICAgICAgICBpZiAoIXNraXApIHtcbiAgICAgICAgICAgICAgICByZW5kZXJlZCA9IGNvbXBvbmVudC5yZW5kZXIocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmdldENoaWxkQ29udGV4dCkgY29udGV4dCA9IGV4dGVuZChleHRlbmQoe30sIGNvbnRleHQpLCBjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KCkpO1xuICAgICAgICAgICAgICAgIHZhciB0b1VubW91bnQsIGJhc2UsIGNoaWxkQ29tcG9uZW50ID0gcmVuZGVyZWQgJiYgcmVuZGVyZWQubm9kZU5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGNoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZFByb3BzID0gZ2V0Tm9kZVByb3BzKHJlbmRlcmVkKTtcbiAgICAgICAgICAgICAgICAgICAgaW5zdCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3QgJiYgaW5zdC5jb25zdHJ1Y3RvciA9PT0gY2hpbGRDb21wb25lbnQgJiYgY2hpbGRQcm9wcy5rZXkgPT0gaW5zdC5fX2spIHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDEsIGNvbnRleHQsICExKTsgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbnN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Ll9jb21wb25lbnQgPSBpbnN0ID0gY3JlYXRlQ29tcG9uZW50KGNoaWxkQ29tcG9uZW50LCBjaGlsZFByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX19iID0gaW5zdC5fX2IgfHwgbmV4dEJhc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fdSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDAsIGNvbnRleHQsICExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudChpbnN0LCAxLCBtb3VudEFsbCwgITApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJhc2UgPSBpbnN0LmJhc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2Jhc2UgPSBpbml0aWFsQmFzZTtcbiAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9Vbm1vdW50KSBjYmFzZSA9IGNvbXBvbmVudC5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlIHx8IDEgPT09IG9wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYmFzZSkgY2Jhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gZGlmZihjYmFzZSwgcmVuZGVyZWQsIGNvbnRleHQsIG1vdW50QWxsIHx8ICFpc1VwZGF0ZSwgaW5pdGlhbEJhc2UgJiYgaW5pdGlhbEJhc2UucGFyZW50Tm9kZSwgITApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSAmJiBiYXNlICE9PSBpbml0aWFsQmFzZSAmJiBpbnN0ICE9PSBpbml0aWFsQ2hpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2VQYXJlbnQgPSBpbml0aWFsQmFzZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZVBhcmVudCAmJiBiYXNlICE9PSBiYXNlUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlUGFyZW50LnJlcGxhY2VDaGlsZChiYXNlLCBpbml0aWFsQmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRvVW5tb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxCYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGluaXRpYWxCYXNlLCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgdW5tb3VudENvbXBvbmVudCh0b1VubW91bnQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5iYXNlID0gYmFzZTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZSAmJiAhaXNDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50UmVmID0gY29tcG9uZW50LCB0ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodCA9IHQuX191KSAoY29tcG9uZW50UmVmID0gdCkuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudCA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPSBjb21wb25lbnRSZWYuY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc1VwZGF0ZSB8fCBtb3VudEFsbCkgbW91bnRzLnVuc2hpZnQoY29tcG9uZW50KTsgZWxzZSBpZiAoIXNraXApIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzLCBwcmV2aW91c1N0YXRlLCBwcmV2aW91c0NvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmFmdGVyVXBkYXRlKSBvcHRpb25zLmFmdGVyVXBkYXRlKGNvbXBvbmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBjb21wb25lbnQuX19oKSB3aGlsZSAoY29tcG9uZW50Ll9faC5sZW5ndGgpIGNvbXBvbmVudC5fX2gucG9wKCkuY2FsbChjb21wb25lbnQpO1xuICAgICAgICAgICAgaWYgKCFkaWZmTGV2ZWwgJiYgIWlzQ2hpbGQpIGZsdXNoTW91bnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpIHtcbiAgICAgICAgdmFyIGMgPSBkb20gJiYgZG9tLl9jb21wb25lbnQsIG9yaWdpbmFsQ29tcG9uZW50ID0gYywgb2xkRG9tID0gZG9tLCBpc0RpcmVjdE93bmVyID0gYyAmJiBkb20uX2NvbXBvbmVudENvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZSwgaXNPd25lciA9IGlzRGlyZWN0T3duZXIsIHByb3BzID0gZ2V0Tm9kZVByb3BzKHZub2RlKTtcbiAgICAgICAgd2hpbGUgKGMgJiYgIWlzT3duZXIgJiYgKGMgPSBjLl9fdSkpIGlzT3duZXIgPSBjLmNvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKGMgJiYgaXNPd25lciAmJiAoIW1vdW50QWxsIHx8IGMuX2NvbXBvbmVudCkpIHtcbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAzLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxDb21wb25lbnQgJiYgIWlzRGlyZWN0T3duZXIpIHtcbiAgICAgICAgICAgICAgICB1bm1vdW50Q29tcG9uZW50KG9yaWdpbmFsQ29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBkb20gPSBvbGREb20gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyA9IGNyZWF0ZUNvbXBvbmVudCh2bm9kZS5ub2RlTmFtZSwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGRvbSAmJiAhYy5fX2IpIHtcbiAgICAgICAgICAgICAgICBjLl9fYiA9IGRvbTtcbiAgICAgICAgICAgICAgICBvbGREb20gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDEsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgICAgIGlmIChvbGREb20gJiYgZG9tICE9PSBvbGREb20pIHtcbiAgICAgICAgICAgICAgICBvbGREb20uX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUob2xkRG9tLCAhMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRvbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdW5tb3VudENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuYmVmb3JlVW5tb3VudCkgb3B0aW9ucy5iZWZvcmVVbm1vdW50KGNvbXBvbmVudCk7XG4gICAgICAgIHZhciBiYXNlID0gY29tcG9uZW50LmJhc2U7XG4gICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG4gICAgICAgIGNvbXBvbmVudC5iYXNlID0gbnVsbDtcbiAgICAgICAgdmFyIGlubmVyID0gY29tcG9uZW50Ll9jb21wb25lbnQ7XG4gICAgICAgIGlmIChpbm5lcikgdW5tb3VudENvbXBvbmVudChpbm5lcik7IGVsc2UgaWYgKGJhc2UpIHtcbiAgICAgICAgICAgIGlmIChiYXNlLl9fcHJlYWN0YXR0cl8gJiYgYmFzZS5fX3ByZWFjdGF0dHJfLnJlZikgYmFzZS5fX3ByZWFjdGF0dHJfLnJlZihudWxsKTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2IgPSBiYXNlO1xuICAgICAgICAgICAgcmVtb3ZlTm9kZShiYXNlKTtcbiAgICAgICAgICAgIGNvbGxlY3RDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKGJhc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb21wb25lbnQuX19yKSBjb21wb25lbnQuX19yKG51bGwpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fX2QgPSAhMDtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZSB8fCB7fTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVuZGVyKHZub2RlLCBwYXJlbnQsIG1lcmdlKSB7XG4gICAgICAgIHJldHVybiBkaWZmKG1lcmdlLCB2bm9kZSwge30sICExLCBwYXJlbnQsICExKTtcbiAgICB9XG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICB2YXIgRU1QVFlfQ0hJTERSRU4gPSBbXTtcbiAgICB2YXIgZGVmZXIgPSAnZnVuY3Rpb24nID09IHR5cGVvZiBQcm9taXNlID8gUHJvbWlzZS5yZXNvbHZlKCkudGhlbi5iaW5kKFByb21pc2UucmVzb2x2ZSgpKSA6IHNldFRpbWVvdXQ7XG4gICAgdmFyIElTX05PTl9ESU1FTlNJT05BTCA9IC9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8b3dzfG1uY3xudHd8aW5lW2NoXXx6b298Xm9yZC9pO1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHZhciBtb3VudHMgPSBbXTtcbiAgICB2YXIgZGlmZkxldmVsID0gMDtcbiAgICB2YXIgaXNTdmdNb2RlID0gITE7XG4gICAgdmFyIGh5ZHJhdGluZyA9ICExO1xuICAgIHZhciBjb21wb25lbnRzID0ge307XG4gICAgZXh0ZW5kKENvbXBvbmVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgc2V0U3RhdGU6IGZ1bmN0aW9uKHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHMgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9fcykgdGhpcy5fX3MgPSBleHRlbmQoe30sIHMpO1xuICAgICAgICAgICAgZXh0ZW5kKHMsICdmdW5jdGlvbicgPT0gdHlwZW9mIHN0YXRlID8gc3RhdGUocywgdGhpcy5wcm9wcykgOiBzdGF0ZSk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spICh0aGlzLl9faCA9IHRoaXMuX19oIHx8IFtdKS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGVucXVldWVSZW5kZXIodGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvcmNlVXBkYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSAodGhpcy5fX2ggPSB0aGlzLl9faCB8fCBbXSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICByZW5kZXJDb21wb25lbnQodGhpcywgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7fVxuICAgIH0pO1xuICAgIHZhciBwcmVhY3QgPSB7XG4gICAgICAgIGg6IGgsXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQ6IGgsXG4gICAgICAgIGNsb25lRWxlbWVudDogY2xvbmVFbGVtZW50LFxuICAgICAgICBDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgICAgICAgcmVuZGVyOiByZW5kZXIsXG4gICAgICAgIHJlcmVuZGVyOiByZXJlbmRlcixcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH07XG4gICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBtb2R1bGUpIG1vZHVsZS5leHBvcnRzID0gcHJlYWN0OyBlbHNlIHNlbGYucHJlYWN0ID0gcHJlYWN0O1xufSgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJlYWN0LmpzLm1hcCIsIm1vZHVsZS5leHBvcnRzID0gcHJldHRpZXJCeXRlc1xuXG5mdW5jdGlvbiBwcmV0dGllckJ5dGVzIChudW0pIHtcbiAgaWYgKHR5cGVvZiBudW0gIT09ICdudW1iZXInIHx8IGlzTmFOKG51bSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIG51bWJlciwgZ290ICcgKyB0eXBlb2YgbnVtKVxuICB9XG5cbiAgdmFyIG5lZyA9IG51bSA8IDBcbiAgdmFyIHVuaXRzID0gWydCJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ11cblxuICBpZiAobmVnKSB7XG4gICAgbnVtID0gLW51bVxuICB9XG5cbiAgaWYgKG51bSA8IDEpIHtcbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bSArICcgQidcbiAgfVxuXG4gIHZhciBleHBvbmVudCA9IE1hdGgubWluKE1hdGguZmxvb3IoTWF0aC5sb2cobnVtKSAvIE1hdGgubG9nKDEwMDApKSwgdW5pdHMubGVuZ3RoIC0gMSlcbiAgbnVtID0gTnVtYmVyKG51bSAvIE1hdGgucG93KDEwMDAsIGV4cG9uZW50KSlcbiAgdmFyIHVuaXQgPSB1bml0c1tleHBvbmVudF1cblxuICBpZiAobnVtID49IDEwIHx8IG51bSAlIDEgPT09IDApIHtcbiAgICAvLyBEbyBub3Qgc2hvdyBkZWNpbWFscyB3aGVuIHRoZSBudW1iZXIgaXMgdHdvLWRpZ2l0LCBvciBpZiB0aGUgbnVtYmVyIGhhcyBub1xuICAgIC8vIGRlY2ltYWwgY29tcG9uZW50LlxuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtLnRvRml4ZWQoMCkgKyAnICcgKyB1bml0XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0udG9GaXhlZCgxKSArICcgJyArIHVuaXRcbiAgfVxufVxuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMgd2lsZGNhcmRcblxuICBWZXJ5IHNpbXBsZSB3aWxkY2FyZCBtYXRjaGluZywgd2hpY2ggaXMgZGVzaWduZWQgdG8gcHJvdmlkZSB0aGUgc2FtZVxuICBmdW5jdGlvbmFsaXR5IHRoYXQgaXMgZm91bmQgaW4gdGhlXG4gIFtldmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9hZG9iZS13ZWJwbGF0Zm9ybS9ldmUpIGV2ZW50aW5nIGxpYnJhcnkuXG5cbiAgIyMgVXNhZ2VcblxuICBJdCB3b3JrcyB3aXRoIHN0cmluZ3M6XG5cbiAgPDw8IGV4YW1wbGVzL3N0cmluZ3MuanNcblxuICBBcnJheXM6XG5cbiAgPDw8IGV4YW1wbGVzL2FycmF5cy5qc1xuXG4gIE9iamVjdHMgKG1hdGNoaW5nIGFnYWluc3Qga2V5cyk6XG5cbiAgPDw8IGV4YW1wbGVzL29iamVjdHMuanNcblxuICBXaGlsZSB0aGUgbGlicmFyeSB3b3JrcyBpbiBOb2RlLCBpZiB5b3UgYXJlIGFyZSBsb29raW5nIGZvciBmaWxlLWJhc2VkXG4gIHdpbGRjYXJkIG1hdGNoaW5nIHRoZW4geW91IHNob3VsZCBoYXZlIGEgbG9vayBhdDpcblxuICA8aHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLWdsb2I+XG4qKi9cblxuZnVuY3Rpb24gV2lsZGNhcmRNYXRjaGVyKHRleHQsIHNlcGFyYXRvcikge1xuICB0aGlzLnRleHQgPSB0ZXh0ID0gdGV4dCB8fCAnJztcbiAgdGhpcy5oYXNXaWxkID0gfnRleHQuaW5kZXhPZignKicpO1xuICB0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcbiAgdGhpcy5wYXJ0cyA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKTtcbn1cblxuV2lsZGNhcmRNYXRjaGVyLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gIHZhciBtYXRjaGVzID0gdHJ1ZTtcbiAgdmFyIHBhcnRzID0gdGhpcy5wYXJ0cztcbiAgdmFyIGlpO1xuICB2YXIgcGFydHNDb3VudCA9IHBhcnRzLmxlbmd0aDtcbiAgdmFyIHRlc3RQYXJ0cztcblxuICBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmhhc1dpbGQgJiYgdGhpcy50ZXh0ICE9IGlucHV0KSB7XG4gICAgICBtYXRjaGVzID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRlc3RQYXJ0cyA9IChpbnB1dCB8fCAnJykuc3BsaXQodGhpcy5zZXBhcmF0b3IpO1xuICAgICAgZm9yIChpaSA9IDA7IG1hdGNoZXMgJiYgaWkgPCBwYXJ0c0NvdW50OyBpaSsrKSB7XG4gICAgICAgIGlmIChwYXJ0c1tpaV0gPT09ICcqJykgIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpaSA8IHRlc3RQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICBtYXRjaGVzID0gcGFydHNbaWldID09PSB0ZXN0UGFydHNbaWldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdGNoZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBtYXRjaGVzLCB0aGVuIHJldHVybiB0aGUgY29tcG9uZW50IHBhcnRzXG4gICAgICBtYXRjaGVzID0gbWF0Y2hlcyAmJiB0ZXN0UGFydHM7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBpbnB1dC5zcGxpY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG1hdGNoZXMgPSBbXTtcblxuICAgIGZvciAoaWkgPSBpbnB1dC5sZW5ndGg7IGlpLS07ICkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goaW5wdXRbaWldKSkge1xuICAgICAgICBtYXRjaGVzW21hdGNoZXMubGVuZ3RoXSA9IGlucHV0W2lpXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdvYmplY3QnKSB7XG4gICAgbWF0Y2hlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGlucHV0KSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChrZXkpKSB7XG4gICAgICAgIG1hdGNoZXNba2V5XSA9IGlucHV0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRleHQsIHRlc3QsIHNlcGFyYXRvcikge1xuICB2YXIgbWF0Y2hlciA9IG5ldyBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yIHx8IC9bXFwvXFwuXS8pO1xuICBpZiAodHlwZW9mIHRlc3QgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbWF0Y2hlci5tYXRjaCh0ZXN0KTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVyO1xufTtcbiIsInZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHByZWFjdCA9IHJlcXVpcmUoJ3ByZWFjdCcpO1xudmFyIGZpbmRET01FbGVtZW50ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2ZpbmRET01FbGVtZW50Jyk7XG5cbi8qKlxuICogRGVmZXIgYSBmcmVxdWVudCBjYWxsIHRvIHRoZSBtaWNyb3Rhc2sgcXVldWUuXG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZuKSB7XG4gIHZhciBjYWxsaW5nID0gbnVsbDtcbiAgdmFyIGxhdGVzdEFyZ3MgPSBudWxsO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIGxhdGVzdEFyZ3MgPSBhcmdzO1xuICAgIGlmICghY2FsbGluZykge1xuICAgICAgY2FsbGluZyA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsaW5nID0gbnVsbDtcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCBgYXJnc2AgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBtb3N0XG4gICAgICAgIC8vIHJlY2VudCBzdGF0ZSwgaWYgbXVsdGlwbGUgY2FsbHMgaGFwcGVuZWQgc2luY2UgdGhpcyB0YXNrXG4gICAgICAgIC8vIHdhcyBxdWV1ZWQuIFNvIHdlIHVzZSB0aGUgYGxhdGVzdEFyZ3NgLCB3aGljaCBkZWZpbml0ZWx5XG4gICAgICAgIC8vIGlzIHRoZSBtb3N0IHJlY2VudCBjYWxsLlxuICAgICAgICByZXR1cm4gZm4uYXBwbHkodW5kZWZpbmVkLCBsYXRlc3RBcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY2FsbGluZztcbiAgfTtcbn1cblxuLyoqXG4gKiBCb2lsZXJwbGF0ZSB0aGF0IGFsbCBQbHVnaW5zIHNoYXJlIC0gYW5kIHNob3VsZCBub3QgYmUgdXNlZFxuICogZGlyZWN0bHkuIEl0IGFsc28gc2hvd3Mgd2hpY2ggbWV0aG9kcyBmaW5hbCBwbHVnaW5zIHNob3VsZCBpbXBsZW1lbnQvb3ZlcnJpZGUsXG4gKiB0aGlzIGRlY2lkaW5nIG9uIHN0cnVjdHVyZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbWFpbiBVcHB5IGNvcmUgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IHdpdGggcGx1Z2luIG9wdGlvbnNcbiAqIEByZXR1cm4ge2FycmF5IHwgc3RyaW5nfSBmaWxlcyBvciBzdWNjZXNzL2ZhaWwgbWVzc2FnZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGx1Z2luKHVwcHksIG9wdHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luKTtcblxuICAgIHRoaXMudXBweSA9IHVwcHk7XG4gICAgdGhpcy5vcHRzID0gb3B0cyB8fCB7fTtcblxuICAgIHRoaXMudXBkYXRlID0gdGhpcy51cGRhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLm1vdW50ID0gdGhpcy5tb3VudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaW5zdGFsbCA9IHRoaXMuaW5zdGFsbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMudW5pbnN0YWxsID0gdGhpcy51bmluc3RhbGwuYmluZCh0aGlzKTtcbiAgfVxuXG4gIFBsdWdpbi5wcm90b3R5cGUuZ2V0UGx1Z2luU3RhdGUgPSBmdW5jdGlvbiBnZXRQbHVnaW5TdGF0ZSgpIHtcbiAgICB2YXIgX3VwcHkkZ2V0U3RhdGUgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKSxcbiAgICAgICAgcGx1Z2lucyA9IF91cHB5JGdldFN0YXRlLnBsdWdpbnM7XG5cbiAgICByZXR1cm4gcGx1Z2luc1t0aGlzLmlkXTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnNldFBsdWdpblN0YXRlID0gZnVuY3Rpb24gc2V0UGx1Z2luU3RhdGUodXBkYXRlKSB7XG4gICAgdmFyIHBsdWdpbnMgPSBfZXh0ZW5kcyh7fSwgdGhpcy51cHB5LmdldFN0YXRlKCkucGx1Z2lucyk7XG4gICAgcGx1Z2luc1t0aGlzLmlkXSA9IF9leHRlbmRzKHt9LCBwbHVnaW5zW3RoaXMuaWRdLCB1cGRhdGUpO1xuXG4gICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IHBsdWdpbnNcbiAgICB9KTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZShzdGF0ZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5lbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdXBkYXRlVUkpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVVJKHN0YXRlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN1cHBsaWVkIGB0YXJnZXRgIGlzIGEgRE9NIGVsZW1lbnQgb3IgYW4gYG9iamVjdGAuXG4gICAqIElmIGl04oCZcyBhbiBvYmplY3Qg4oCUIHRhcmdldCBpcyBhIHBsdWdpbiwgYW5kIHdlIHNlYXJjaCBgcGx1Z2luc2BcbiAgICogZm9yIGEgcGx1Z2luIHdpdGggc2FtZSBuYW1lIGFuZCByZXR1cm4gaXRzIHRhcmdldC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB0YXJnZXRcbiAgICpcbiAgICovXG5cblxuICBQbHVnaW4ucHJvdG90eXBlLm1vdW50ID0gZnVuY3Rpb24gbW91bnQodGFyZ2V0LCBwbHVnaW4pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGNhbGxlclBsdWdpbk5hbWUgPSBwbHVnaW4uaWQ7XG5cbiAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGZpbmRET01FbGVtZW50KHRhcmdldCk7XG5cbiAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgdGhpcy5pc1RhcmdldERPTUVsID0gdHJ1ZTtcblxuICAgICAgLy8gQVBJIGZvciBwbHVnaW5zIHRoYXQgcmVxdWlyZSBhIHN5bmNocm9ub3VzIHJlcmVuZGVyLlxuICAgICAgdGhpcy5yZXJlbmRlciA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAvLyBwbHVnaW4gY291bGQgYmUgcmVtb3ZlZCwgYnV0IHRoaXMucmVyZW5kZXIgaXMgZGVib3VuY2VkIGJlbG93LFxuICAgICAgICAvLyBzbyBpdCBjb3VsZCBzdGlsbCBiZSBjYWxsZWQgZXZlbiBhZnRlciB1cHB5LnJlbW92ZVBsdWdpbiBvciB1cHB5LmNsb3NlXG4gICAgICAgIC8vIGhlbmNlIHRoZSBjaGVja1xuICAgICAgICBpZiAoIV90aGlzLnVwcHkuZ2V0UGx1Z2luKF90aGlzLmlkKSkgcmV0dXJuO1xuICAgICAgICBfdGhpcy5lbCA9IHByZWFjdC5yZW5kZXIoX3RoaXMucmVuZGVyKHN0YXRlKSwgdGFyZ2V0RWxlbWVudCwgX3RoaXMuZWwpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZVVJID0gZGVib3VuY2UodGhpcy5yZXJlbmRlcik7XG5cbiAgICAgIHRoaXMudXBweS5sb2coJ0luc3RhbGxpbmcgJyArIGNhbGxlclBsdWdpbk5hbWUgKyAnIHRvIGEgRE9NIGVsZW1lbnQnKTtcblxuICAgICAgLy8gY2xlYXIgZXZlcnl0aGluZyBpbnNpZGUgdGhlIHRhcmdldCBjb250YWluZXJcbiAgICAgIGlmICh0aGlzLm9wdHMucmVwbGFjZVRhcmdldENvbnRlbnQpIHtcbiAgICAgICAgdGFyZ2V0RWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbCA9IHByZWFjdC5yZW5kZXIodGhpcy5yZW5kZXIodGhpcy51cHB5LmdldFN0YXRlKCkpLCB0YXJnZXRFbGVtZW50KTtcblxuICAgICAgcmV0dXJuIHRoaXMuZWw7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldFBsdWdpbiA9IHZvaWQgMDtcbiAgICBpZiAoKHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHRhcmdldCkpID09PSAnb2JqZWN0JyAmJiB0YXJnZXQgaW5zdGFuY2VvZiBQbHVnaW4pIHtcbiAgICAgIC8vIFRhcmdldGluZyBhIHBsdWdpbiAqaW5zdGFuY2UqXG4gICAgICB0YXJnZXRQbHVnaW4gPSB0YXJnZXQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gdHlwZVxuICAgICAgdmFyIFRhcmdldCA9IHRhcmdldDtcbiAgICAgIC8vIEZpbmQgdGhlIHRhcmdldCBwbHVnaW4gaW5zdGFuY2UuXG4gICAgICB0aGlzLnVwcHkuaXRlcmF0ZVBsdWdpbnMoZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgICBpZiAocGx1Z2luIGluc3RhbmNlb2YgVGFyZ2V0KSB7XG4gICAgICAgICAgdGFyZ2V0UGx1Z2luID0gcGx1Z2luO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldFBsdWdpbikge1xuICAgICAgdmFyIHRhcmdldFBsdWdpbk5hbWUgPSB0YXJnZXRQbHVnaW4uaWQ7XG4gICAgICB0aGlzLnVwcHkubG9nKCdJbnN0YWxsaW5nICcgKyBjYWxsZXJQbHVnaW5OYW1lICsgJyB0byAnICsgdGFyZ2V0UGx1Z2luTmFtZSk7XG4gICAgICB0aGlzLmVsID0gdGFyZ2V0UGx1Z2luLmFkZFRhcmdldChwbHVnaW4pO1xuICAgICAgcmV0dXJuIHRoaXMuZWw7XG4gICAgfVxuXG4gICAgdGhpcy51cHB5LmxvZygnTm90IGluc3RhbGxpbmcgJyArIGNhbGxlclBsdWdpbk5hbWUpO1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0YXJnZXQgb3B0aW9uIGdpdmVuIHRvICcgKyBjYWxsZXJQbHVnaW5OYW1lKTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcihzdGF0ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXh0ZW5kIHRoZSByZW5kZXIgbWV0aG9kIHRvIGFkZCB5b3VyIHBsdWdpbiB0byBhIERPTSBlbGVtZW50Jyk7XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5hZGRUYXJnZXQgPSBmdW5jdGlvbiBhZGRUYXJnZXQocGx1Z2luKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHRlbmQgdGhlIGFkZFRhcmdldCBtZXRob2QgdG8gYWRkIHlvdXIgcGx1Z2luIHRvIGFub3RoZXIgcGx1Z2luXFwncyB0YXJnZXQnKTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnVubW91bnQgPSBmdW5jdGlvbiB1bm1vdW50KCkge1xuICAgIGlmICh0aGlzLmlzVGFyZ2V0RE9NRWwgJiYgdGhpcy5lbCAmJiB0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcbiAgICB9XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5pbnN0YWxsID0gZnVuY3Rpb24gaW5zdGFsbCgpIHt9O1xuXG4gIFBsdWdpbi5wcm90b3R5cGUudW5pbnN0YWxsID0gZnVuY3Rpb24gdW5pbnN0YWxsKCkge1xuICAgIHRoaXMudW5tb3VudCgpO1xuICB9O1xuXG4gIHJldHVybiBQbHVnaW47XG59KCk7IiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgVHJhbnNsYXRvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9UcmFuc2xhdG9yJyk7XG52YXIgZWUgPSByZXF1aXJlKCduYW1lc3BhY2UtZW1pdHRlcicpO1xudmFyIGN1aWQgPSByZXF1aXJlKCdjdWlkJyk7XG4vLyBjb25zdCB0aHJvdHRsZSA9IHJlcXVpcmUoJ2xvZGFzaC50aHJvdHRsZScpXG52YXIgcHJldHR5Qnl0ZXMgPSByZXF1aXJlKCdwcmV0dGllci1ieXRlcycpO1xudmFyIG1hdGNoID0gcmVxdWlyZSgnbWltZS1tYXRjaCcpO1xudmFyIERlZmF1bHRTdG9yZSA9IHJlcXVpcmUoJ0B1cHB5L3N0b3JlLWRlZmF1bHQnKTtcbnZhciBnZXRGaWxlVHlwZSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlVHlwZScpO1xudmFyIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldEZpbGVOYW1lQW5kRXh0ZW5zaW9uJyk7XG52YXIgZ2VuZXJhdGVGaWxlSUQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2VuZXJhdGVGaWxlSUQnKTtcbnZhciBpc09iamVjdFVSTCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9pc09iamVjdFVSTCcpO1xudmFyIGdldFRpbWVTdGFtcCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRUaW1lU3RhbXAnKTtcblxuLyoqXG4gKiBVcHB5IENvcmUgbW9kdWxlLlxuICogTWFuYWdlcyBwbHVnaW5zLCBzdGF0ZSB1cGRhdGVzLCBhY3RzIGFzIGFuIGV2ZW50IGJ1cyxcbiAqIGFkZHMvcmVtb3ZlcyBmaWxlcyBhbmQgbWV0YWRhdGEuXG4gKi9cblxudmFyIFVwcHkgPSBmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAqIEluc3RhbnRpYXRlIFVwcHlcbiAgKiBAcGFyYW0ge29iamVjdH0gb3B0cyDigJQgVXBweSBvcHRpb25zXG4gICovXG4gIGZ1bmN0aW9uIFVwcHkob3B0cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBweSk7XG5cbiAgICB2YXIgZGVmYXVsdExvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgeW91Q2FuT25seVVwbG9hZFg6IHtcbiAgICAgICAgICAwOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfSxcbiAgICAgICAgeW91SGF2ZVRvQXRMZWFzdFNlbGVjdFg6IHtcbiAgICAgICAgICAwOiAnWW91IGhhdmUgdG8gc2VsZWN0IGF0IGxlYXN0ICV7c21hcnRfY291bnR9IGZpbGUnLFxuICAgICAgICAgIDE6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnXG4gICAgICAgIH0sXG4gICAgICAgIGV4Y2VlZHNTaXplOiAnVGhpcyBmaWxlIGV4Y2VlZHMgbWF4aW11bSBhbGxvd2VkIHNpemUgb2YnLFxuICAgICAgICB5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzOiAnWW91IGNhbiBvbmx5IHVwbG9hZDonLFxuICAgICAgICB1cHB5U2VydmVyRXJyb3I6ICdDb25uZWN0aW9uIHdpdGggVXBweSBTZXJ2ZXIgZmFpbGVkJyxcbiAgICAgICAgZmFpbGVkVG9VcGxvYWQ6ICdGYWlsZWQgdG8gdXBsb2FkICV7ZmlsZX0nLFxuICAgICAgICBub0ludGVybmV0Q29ubmVjdGlvbjogJ05vIEludGVybmV0IGNvbm5lY3Rpb24nLFxuICAgICAgICBjb25uZWN0ZWRUb0ludGVybmV0OiAnQ29ubmVjdGVkIHRvIHRoZSBJbnRlcm5ldCcsXG4gICAgICAgIC8vIFN0cmluZ3MgZm9yIHJlbW90ZSBwcm92aWRlcnNcbiAgICAgICAgbm9GaWxlc0ZvdW5kOiAnWW91IGhhdmUgbm8gZmlsZXMgb3IgZm9sZGVycyBoZXJlJyxcbiAgICAgICAgc2VsZWN0WEZpbGVzOiB7XG4gICAgICAgICAgMDogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnU2VsZWN0ICV7c21hcnRfY291bnR9IGZpbGVzJ1xuICAgICAgICB9LFxuICAgICAgICBjYW5jZWw6ICdDYW5jZWwnLFxuICAgICAgICBsb2dPdXQ6ICdMb2cgb3V0J1xuICAgICAgfVxuXG4gICAgICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gICAgfTt2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBpZDogJ3VwcHknLFxuICAgICAgYXV0b1Byb2NlZWQ6IHRydWUsXG4gICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICByZXN0cmljdGlvbnM6IHtcbiAgICAgICAgbWF4RmlsZVNpemU6IG51bGwsXG4gICAgICAgIG1heE51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIG1pbk51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIGFsbG93ZWRGaWxlVHlwZXM6IG51bGxcbiAgICAgIH0sXG4gICAgICBtZXRhOiB7fSxcbiAgICAgIG9uQmVmb3JlRmlsZUFkZGVkOiBmdW5jdGlvbiBvbkJlZm9yZUZpbGVBZGRlZChjdXJyZW50RmlsZSwgZmlsZXMpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRGaWxlO1xuICAgICAgfSxcbiAgICAgIG9uQmVmb3JlVXBsb2FkOiBmdW5jdGlvbiBvbkJlZm9yZVVwbG9hZChmaWxlcykge1xuICAgICAgICByZXR1cm4gZmlsZXM7XG4gICAgICB9LFxuICAgICAgbG9jYWxlOiBkZWZhdWx0TG9jYWxlLFxuICAgICAgc3RvcmU6IERlZmF1bHRTdG9yZSgpXG5cbiAgICAgIC8vIE1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgfTt0aGlzLm9wdHMgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpO1xuICAgIHRoaXMub3B0cy5yZXN0cmljdGlvbnMgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdE9wdGlvbnMucmVzdHJpY3Rpb25zLCB0aGlzLm9wdHMucmVzdHJpY3Rpb25zKTtcblxuICAgIHRoaXMubG9jYWxlID0gX2V4dGVuZHMoe30sIGRlZmF1bHRMb2NhbGUsIHRoaXMub3B0cy5sb2NhbGUpO1xuICAgIHRoaXMubG9jYWxlLnN0cmluZ3MgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdExvY2FsZS5zdHJpbmdzLCB0aGlzLm9wdHMubG9jYWxlLnN0cmluZ3MpO1xuXG4gICAgLy8gaTE4blxuICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKHsgbG9jYWxlOiB0aGlzLmxvY2FsZSB9KTtcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKTtcblxuICAgIC8vIENvbnRhaW5lciBmb3IgZGlmZmVyZW50IHR5cGVzIG9mIHBsdWdpbnNcbiAgICB0aGlzLnBsdWdpbnMgPSB7fTtcblxuICAgIHRoaXMuZ2V0U3RhdGUgPSB0aGlzLmdldFN0YXRlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5nZXRQbHVnaW4gPSB0aGlzLmdldFBsdWdpbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0RmlsZU1ldGEgPSB0aGlzLnNldEZpbGVNZXRhLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXRGaWxlU3RhdGUgPSB0aGlzLnNldEZpbGVTdGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMubG9nID0gdGhpcy5sb2cuYmluZCh0aGlzKTtcbiAgICB0aGlzLmluZm8gPSB0aGlzLmluZm8uYmluZCh0aGlzKTtcbiAgICB0aGlzLmhpZGVJbmZvID0gdGhpcy5oaWRlSW5mby5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYWRkRmlsZSA9IHRoaXMuYWRkRmlsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlRmlsZSA9IHRoaXMucmVtb3ZlRmlsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMucGF1c2VSZXN1bWUgPSB0aGlzLnBhdXNlUmVzdW1lLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aGlzLl9jYWxjdWxhdGVQcm9ncmVzcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMudXBkYXRlT25saW5lU3RhdHVzID0gdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc2V0UHJvZ3Jlc3MgPSB0aGlzLnJlc2V0UHJvZ3Jlc3MuYmluZCh0aGlzKTtcblxuICAgIHRoaXMucGF1c2VBbGwgPSB0aGlzLnBhdXNlQWxsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXN1bWVBbGwgPSB0aGlzLnJlc3VtZUFsbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmV0cnlBbGwgPSB0aGlzLnJldHJ5QWxsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jYW5jZWxBbGwgPSB0aGlzLmNhbmNlbEFsbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmV0cnlVcGxvYWQgPSB0aGlzLnJldHJ5VXBsb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy51cGxvYWQgPSB0aGlzLnVwbG9hZC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5lbWl0dGVyID0gZWUoKTtcbiAgICB0aGlzLm9uID0gdGhpcy5vbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMub2ZmID0gdGhpcy5vZmYuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uY2UgPSB0aGlzLmVtaXR0ZXIub25jZS5iaW5kKHRoaXMuZW1pdHRlcik7XG4gICAgdGhpcy5lbWl0ID0gdGhpcy5lbWl0dGVyLmVtaXQuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgdGhpcy5wcmVQcm9jZXNzb3JzID0gW107XG4gICAgdGhpcy51cGxvYWRlcnMgPSBbXTtcbiAgICB0aGlzLnBvc3RQcm9jZXNzb3JzID0gW107XG5cbiAgICB0aGlzLnN0b3JlID0gdGhpcy5vcHRzLnN0b3JlO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcGx1Z2luczoge30sXG4gICAgICBmaWxlczoge30sXG4gICAgICBjdXJyZW50VXBsb2Fkczoge30sXG4gICAgICBjYXBhYmlsaXRpZXM6IHtcbiAgICAgICAgcmVzdW1hYmxlVXBsb2FkczogZmFsc2VcbiAgICAgIH0sXG4gICAgICB0b3RhbFByb2dyZXNzOiAwLFxuICAgICAgbWV0YTogX2V4dGVuZHMoe30sIHRoaXMub3B0cy5tZXRhKSxcbiAgICAgIGluZm86IHtcbiAgICAgICAgaXNIaWRkZW46IHRydWUsXG4gICAgICAgIHR5cGU6ICdpbmZvJyxcbiAgICAgICAgbWVzc2FnZTogJydcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX3N0b3JlVW5zdWJzY3JpYmUgPSB0aGlzLnN0b3JlLnN1YnNjcmliZShmdW5jdGlvbiAocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKSB7XG4gICAgICBfdGhpcy5lbWl0KCdzdGF0ZS11cGRhdGUnLCBwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcGF0Y2gpO1xuICAgICAgX3RoaXMudXBkYXRlQWxsKG5leHRTdGF0ZSk7XG4gICAgfSk7XG5cbiAgICAvLyBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nXG4gICAgLy8gdGhpcy51cGRhdGVOdW0gPSAwXG4gICAgaWYgKHRoaXMub3B0cy5kZWJ1ZyAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93Wyd1cHB5TG9nJ10gPSAnJztcbiAgICAgIHdpbmRvd1t0aGlzLm9wdHMuaWRdID0gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9hZGRMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIFVwcHkucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gb2ZmKGV2ZW50LCBjYWxsYmFjaykge1xuICAgIHRoaXMuZW1pdHRlci5vZmYoZXZlbnQsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogSXRlcmF0ZSBvbiBhbGwgcGx1Z2lucyBhbmQgcnVuIGB1cGRhdGVgIG9uIHRoZW0uXG4gICAqIENhbGxlZCBlYWNoIHRpbWUgc3RhdGUgY2hhbmdlcy5cbiAgICpcbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS51cGRhdGVBbGwgPSBmdW5jdGlvbiB1cGRhdGVBbGwoc3RhdGUpIHtcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHBsdWdpbi51cGRhdGUoc3RhdGUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHN0YXRlIHdpdGggYSBwYXRjaFxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF0Y2gge2ZvbzogJ2Jhcid9XG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiBzZXRTdGF0ZShwYXRjaCkge1xuICAgIHRoaXMuc3RvcmUuc2V0U3RhdGUocGF0Y2gpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGN1cnJlbnQgc3RhdGUuXG4gICAqIEByZXR1cm4ge29iamVjdH1cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCk7XG4gIH07XG5cbiAgLyoqXG4gICogQmFjayBjb21wYXQgZm9yIHdoZW4gdXBweS5zdGF0ZSBpcyB1c2VkIGluc3RlYWQgb2YgdXBweS5nZXRTdGF0ZSgpLlxuICAqL1xuXG5cbiAgLyoqXG4gICogU2hvcnRoYW5kIHRvIHNldCBzdGF0ZSBmb3IgYSBzcGVjaWZpYyBmaWxlLlxuICAqL1xuICBVcHB5LnByb3RvdHlwZS5zZXRGaWxlU3RhdGUgPSBmdW5jdGlvbiBzZXRGaWxlU3RhdGUoZmlsZUlELCBzdGF0ZSkge1xuICAgIHZhciBfZXh0ZW5kczI7XG5cbiAgICBpZiAoIXRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcdTIwMTl0IHNldCBzdGF0ZSBmb3IgJyArIGZpbGVJRCArICcgKHRoZSBmaWxlIGNvdWxkIGhhdmUgYmVlbiByZW1vdmVkKScpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMsIChfZXh0ZW5kczIgPSB7fSwgX2V4dGVuZHMyW2ZpbGVJRF0gPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzW2ZpbGVJRF0sIHN0YXRlKSwgX2V4dGVuZHMyKSlcbiAgICB9KTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZXNldFByb2dyZXNzID0gZnVuY3Rpb24gcmVzZXRQcm9ncmVzcygpIHtcbiAgICB2YXIgZGVmYXVsdFByb2dyZXNzID0ge1xuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICB1cGxvYWRTdGFydGVkOiBmYWxzZVxuICAgIH07XG4gICAgdmFyIGZpbGVzID0gX2V4dGVuZHMoe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcyk7XG4gICAgdmFyIHVwZGF0ZWRGaWxlcyA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICAgIHZhciB1cGRhdGVkRmlsZSA9IF9leHRlbmRzKHt9LCBmaWxlc1tmaWxlSURdKTtcbiAgICAgIHVwZGF0ZWRGaWxlLnByb2dyZXNzID0gX2V4dGVuZHMoe30sIHVwZGF0ZWRGaWxlLnByb2dyZXNzLCBkZWZhdWx0UHJvZ3Jlc3MpO1xuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB1cGRhdGVkRmlsZTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlcyxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDBcbiAgICB9KTtcblxuICAgIC8vIFRPRE8gRG9jdW1lbnQgb24gdGhlIHdlYnNpdGVcbiAgICB0aGlzLmVtaXQoJ3Jlc2V0LXByb2dyZXNzJyk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuYWRkUHJlUHJvY2Vzc29yID0gZnVuY3Rpb24gYWRkUHJlUHJvY2Vzc29yKGZuKSB7XG4gICAgdGhpcy5wcmVQcm9jZXNzb3JzLnB1c2goZm4pO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnJlbW92ZVByZVByb2Nlc3NvciA9IGZ1bmN0aW9uIHJlbW92ZVByZVByb2Nlc3Nvcihmbikge1xuICAgIHZhciBpID0gdGhpcy5wcmVQcm9jZXNzb3JzLmluZGV4T2YoZm4pO1xuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgdGhpcy5wcmVQcm9jZXNzb3JzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuYWRkUG9zdFByb2Nlc3NvciA9IGZ1bmN0aW9uIGFkZFBvc3RQcm9jZXNzb3IoZm4pIHtcbiAgICB0aGlzLnBvc3RQcm9jZXNzb3JzLnB1c2goZm4pO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnJlbW92ZVBvc3RQcm9jZXNzb3IgPSBmdW5jdGlvbiByZW1vdmVQb3N0UHJvY2Vzc29yKGZuKSB7XG4gICAgdmFyIGkgPSB0aGlzLnBvc3RQcm9jZXNzb3JzLmluZGV4T2YoZm4pO1xuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgdGhpcy5wb3N0UHJvY2Vzc29ycy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLmFkZFVwbG9hZGVyID0gZnVuY3Rpb24gYWRkVXBsb2FkZXIoZm4pIHtcbiAgICB0aGlzLnVwbG9hZGVycy5wdXNoKGZuKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZW1vdmVVcGxvYWRlciA9IGZ1bmN0aW9uIHJlbW92ZVVwbG9hZGVyKGZuKSB7XG4gICAgdmFyIGkgPSB0aGlzLnVwbG9hZGVycy5pbmRleE9mKGZuKTtcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMudXBsb2FkZXJzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuc2V0TWV0YSA9IGZ1bmN0aW9uIHNldE1ldGEoZGF0YSkge1xuICAgIHZhciB1cGRhdGVkTWV0YSA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkubWV0YSwgZGF0YSk7XG4gICAgdmFyIHVwZGF0ZWRGaWxlcyA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpO1xuXG4gICAgT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gX2V4dGVuZHMoe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLCB7XG4gICAgICAgIG1ldGE6IF9leHRlbmRzKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXS5tZXRhLCBkYXRhKVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvZygnQWRkaW5nIG1ldGFkYXRhOicpO1xuICAgIHRoaXMubG9nKGRhdGEpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtZXRhOiB1cGRhdGVkTWV0YSxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9KTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5zZXRGaWxlTWV0YSA9IGZ1bmN0aW9uIHNldEZpbGVNZXRhKGZpbGVJRCwgZGF0YSkge1xuICAgIHZhciB1cGRhdGVkRmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKTtcbiAgICBpZiAoIXVwZGF0ZWRGaWxlc1tmaWxlSURdKSB7XG4gICAgICB0aGlzLmxvZygnV2FzIHRyeWluZyB0byBzZXQgbWV0YWRhdGEgZm9yIGEgZmlsZSB0aGF04oCZcyBub3Qgd2l0aCB1cyBhbnltb3JlOiAnLCBmaWxlSUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbmV3TWV0YSA9IF9leHRlbmRzKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXS5tZXRhLCBkYXRhKTtcbiAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IF9leHRlbmRzKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgICAgbWV0YTogbmV3TWV0YVxuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogdXBkYXRlZEZpbGVzIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgYSBmaWxlIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJRCBUaGUgSUQgb2YgdGhlIGZpbGUgb2JqZWN0IHRvIHJldHVybi5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5nZXRGaWxlID0gZnVuY3Rpb24gZ2V0RmlsZShmaWxlSUQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpLmZpbGVzW2ZpbGVJRF07XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgZmlsZXMgaW4gYW4gYXJyYXkuXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuZ2V0RmlsZXMgPSBmdW5jdGlvbiBnZXRGaWxlcygpIHtcbiAgICB2YXIgX2dldFN0YXRlID0gdGhpcy5nZXRTdGF0ZSgpLFxuICAgICAgICBmaWxlcyA9IF9nZXRTdGF0ZS5maWxlcztcblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhmaWxlcykubWFwKGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICAgIHJldHVybiBmaWxlc1tmaWxlSURdO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAqIENoZWNrIGlmIG1pbk51bWJlck9mRmlsZXMgcmVzdHJpY3Rpb24gaXMgcmVhY2hlZCBiZWZvcmUgdXBsb2FkaW5nLlxuICAqXG4gICogQHByaXZhdGVcbiAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLl9jaGVja01pbk51bWJlck9mRmlsZXMgPSBmdW5jdGlvbiBfY2hlY2tNaW5OdW1iZXJPZkZpbGVzKGZpbGVzKSB7XG4gICAgdmFyIG1pbk51bWJlck9mRmlsZXMgPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zLm1pbk51bWJlck9mRmlsZXM7XG5cbiAgICBpZiAoT2JqZWN0LmtleXMoZmlsZXMpLmxlbmd0aCA8IG1pbk51bWJlck9mRmlsZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignJyArIHRoaXMuaTE4bigneW91SGF2ZVRvQXRMZWFzdFNlbGVjdFgnLCB7IHNtYXJ0X2NvdW50OiBtaW5OdW1iZXJPZkZpbGVzIH0pKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICogQ2hlY2sgaWYgZmlsZSBwYXNzZXMgYSBzZXQgb2YgcmVzdHJpY3Rpb25zIHNldCBpbiBvcHRpb25zOiBtYXhGaWxlU2l6ZSxcbiAgKiBtYXhOdW1iZXJPZkZpbGVzIGFuZCBhbGxvd2VkRmlsZVR5cGVzLlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGNoZWNrXG4gICogQHByaXZhdGVcbiAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLl9jaGVja1Jlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIF9jaGVja1Jlc3RyaWN0aW9ucyhmaWxlKSB7XG4gICAgdmFyIF9vcHRzJHJlc3RyaWN0aW9ucyA9IHRoaXMub3B0cy5yZXN0cmljdGlvbnMsXG4gICAgICAgIG1heEZpbGVTaXplID0gX29wdHMkcmVzdHJpY3Rpb25zLm1heEZpbGVTaXplLFxuICAgICAgICBtYXhOdW1iZXJPZkZpbGVzID0gX29wdHMkcmVzdHJpY3Rpb25zLm1heE51bWJlck9mRmlsZXMsXG4gICAgICAgIGFsbG93ZWRGaWxlVHlwZXMgPSBfb3B0cyRyZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlcztcblxuXG4gICAgaWYgKG1heE51bWJlck9mRmlsZXMpIHtcbiAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmdldFN0YXRlKCkuZmlsZXMpLmxlbmd0aCArIDEgPiBtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignJyArIHRoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZFgnLCB7IHNtYXJ0X2NvdW50OiBtYXhOdW1iZXJPZkZpbGVzIH0pKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYWxsb3dlZEZpbGVUeXBlcykge1xuICAgICAgdmFyIGlzQ29ycmVjdEZpbGVUeXBlID0gYWxsb3dlZEZpbGVUeXBlcy5maWx0ZXIoZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgLy8gaWYgKCFmaWxlLnR5cGUpIHJldHVybiBmYWxzZVxuXG4gICAgICAgIC8vIGlzIHRoaXMgaXMgYSBtaW1lLXR5cGVcbiAgICAgICAgaWYgKHR5cGUuaW5kZXhPZignLycpID4gLTEpIHtcbiAgICAgICAgICBpZiAoIWZpbGUudHlwZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIHJldHVybiBtYXRjaChmaWxlLnR5cGUsIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3RoZXJ3aXNlIHRoaXMgaXMgbGlrZWx5IGFuIGV4dGVuc2lvblxuICAgICAgICBpZiAodHlwZVswXSA9PT0gJy4nKSB7XG4gICAgICAgICAgaWYgKGZpbGUuZXh0ZW5zaW9uID09PSB0eXBlLnN1YnN0cigxKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGUuZXh0ZW5zaW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSkubGVuZ3RoID4gMDtcblxuICAgICAgaWYgKCFpc0NvcnJlY3RGaWxlVHlwZSkge1xuICAgICAgICB2YXIgYWxsb3dlZEZpbGVUeXBlc1N0cmluZyA9IGFsbG93ZWRGaWxlVHlwZXMuam9pbignLCAnKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZEZpbGVUeXBlcycpICsgJyAnICsgYWxsb3dlZEZpbGVUeXBlc1N0cmluZyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1heEZpbGVTaXplKSB7XG4gICAgICBpZiAoZmlsZS5kYXRhLnNpemUgPiBtYXhGaWxlU2l6ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy5pMThuKCdleGNlZWRzU2l6ZScpICsgJyAnICsgcHJldHR5Qnl0ZXMobWF4RmlsZVNpemUpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICogQWRkIGEgbmV3IGZpbGUgdG8gYHN0YXRlLmZpbGVzYC4gVGhpcyB3aWxsIHJ1biBgb25CZWZvcmVGaWxlQWRkZWRgLFxuICAqIHRyeSB0byBndWVzcyBmaWxlIHR5cGUgaW4gYSBjbGV2ZXIgd2F5LCBjaGVjayBmaWxlIGFnYWluc3QgcmVzdHJpY3Rpb25zLFxuICAqIGFuZCBzdGFydCBhbiB1cGxvYWQgaWYgYGF1dG9Qcm9jZWVkID09PSB0cnVlYC5cbiAgKlxuICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIG9iamVjdCB0byBhZGRcbiAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLmFkZEZpbGUgPSBmdW5jdGlvbiBhZGRGaWxlKGZpbGUpIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcyxcbiAgICAgICAgX2V4dGVuZHMzO1xuXG4gICAgdmFyIF9nZXRTdGF0ZTIgPSB0aGlzLmdldFN0YXRlKCksXG4gICAgICAgIGZpbGVzID0gX2dldFN0YXRlMi5maWxlcztcblxuICAgIHZhciBvbkVycm9yID0gZnVuY3Rpb24gb25FcnJvcihtc2cpIHtcbiAgICAgIHZhciBlcnIgPSAodHlwZW9mIG1zZyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YobXNnKSkgPT09ICdvYmplY3QnID8gbXNnIDogbmV3IEVycm9yKG1zZyk7XG4gICAgICBfdGhpczIubG9nKGVyci5tZXNzYWdlKTtcbiAgICAgIF90aGlzMi5pbmZvKGVyci5tZXNzYWdlLCAnZXJyb3InLCA1MDAwKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9O1xuXG4gICAgdmFyIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ID0gdGhpcy5vcHRzLm9uQmVmb3JlRmlsZUFkZGVkKGZpbGUsIGZpbGVzKTtcblxuICAgIGlmIChvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMubG9nKCdOb3QgYWRkaW5nIGZpbGUgYmVjYXVzZSBvbkJlZm9yZUZpbGVBZGRlZCByZXR1cm5lZCBmYWxzZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgodHlwZW9mIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCkpID09PSAnb2JqZWN0JyAmJiBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCkge1xuICAgICAgLy8gd2FybmluZyBhZnRlciB0aGUgY2hhbmdlIGluIDAuMjRcbiAgICAgIGlmIChvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdC50aGVuKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uQmVmb3JlRmlsZUFkZGVkKCkgcmV0dXJuZWQgYSBQcm9taXNlLCBidXQgdGhpcyBpcyBubyBsb25nZXIgc3VwcG9ydGVkLiBJdCBtdXN0IGJlIHN5bmNocm9ub3VzLicpO1xuICAgICAgfVxuICAgICAgZmlsZSA9IG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0O1xuICAgIH1cblxuICAgIHZhciBmaWxlVHlwZSA9IGdldEZpbGVUeXBlKGZpbGUpO1xuICAgIHZhciBmaWxlTmFtZSA9IHZvaWQgMDtcbiAgICBpZiAoZmlsZS5uYW1lKSB7XG4gICAgICBmaWxlTmFtZSA9IGZpbGUubmFtZTtcbiAgICB9IGVsc2UgaWYgKGZpbGVUeXBlLnNwbGl0KCcvJylbMF0gPT09ICdpbWFnZScpIHtcbiAgICAgIGZpbGVOYW1lID0gZmlsZVR5cGUuc3BsaXQoJy8nKVswXSArICcuJyArIGZpbGVUeXBlLnNwbGl0KCcvJylbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVOYW1lID0gJ25vbmFtZSc7XG4gICAgfVxuICAgIHZhciBmaWxlRXh0ZW5zaW9uID0gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24oZmlsZU5hbWUpLmV4dGVuc2lvbjtcbiAgICB2YXIgaXNSZW1vdGUgPSBmaWxlLmlzUmVtb3RlIHx8IGZhbHNlO1xuXG4gICAgdmFyIGZpbGVJRCA9IGdlbmVyYXRlRmlsZUlEKGZpbGUpO1xuXG4gICAgdmFyIG1ldGEgPSBmaWxlLm1ldGEgfHwge307XG4gICAgbWV0YS5uYW1lID0gZmlsZU5hbWU7XG4gICAgbWV0YS50eXBlID0gZmlsZVR5cGU7XG5cbiAgICB2YXIgbmV3RmlsZSA9IHtcbiAgICAgIHNvdXJjZTogZmlsZS5zb3VyY2UgfHwgJycsXG4gICAgICBpZDogZmlsZUlELFxuICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICBleHRlbnNpb246IGZpbGVFeHRlbnNpb24gfHwgJycsXG4gICAgICBtZXRhOiBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLm1ldGEsIG1ldGEpLFxuICAgICAgdHlwZTogZmlsZVR5cGUsXG4gICAgICBkYXRhOiBmaWxlLmRhdGEsXG4gICAgICBwcm9ncmVzczoge1xuICAgICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgICBieXRlc1VwbG9hZGVkOiAwLFxuICAgICAgICBieXRlc1RvdGFsOiBmaWxlLmRhdGEuc2l6ZSB8fCAwLFxuICAgICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IGZhbHNlXG4gICAgICB9LFxuICAgICAgc2l6ZTogZmlsZS5kYXRhLnNpemUgfHwgMCxcbiAgICAgIGlzUmVtb3RlOiBpc1JlbW90ZSxcbiAgICAgIHJlbW90ZTogZmlsZS5yZW1vdGUgfHwgJycsXG4gICAgICBwcmV2aWV3OiBmaWxlLnByZXZpZXdcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2NoZWNrUmVzdHJpY3Rpb25zKG5ld0ZpbGUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgb25FcnJvcihlcnIpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IF9leHRlbmRzKHt9LCBmaWxlcywgKF9leHRlbmRzMyA9IHt9LCBfZXh0ZW5kczNbZmlsZUlEXSA9IG5ld0ZpbGUsIF9leHRlbmRzMykpXG4gICAgfSk7XG5cbiAgICB0aGlzLmVtaXQoJ2ZpbGUtYWRkZWQnLCBuZXdGaWxlKTtcbiAgICB0aGlzLmxvZygnQWRkZWQgZmlsZTogJyArIGZpbGVOYW1lICsgJywgJyArIGZpbGVJRCArICcsIG1pbWUgdHlwZTogJyArIGZpbGVUeXBlKTtcblxuICAgIGlmICh0aGlzLm9wdHMuYXV0b1Byb2NlZWQgJiYgIXRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXMyLnNjaGVkdWxlZEF1dG9Qcm9jZWVkID0gbnVsbDtcbiAgICAgICAgX3RoaXMyLnVwbG9hZCgpLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSB8fCBlcnIpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDQpO1xuICAgIH1cbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZW1vdmVGaWxlID0gZnVuY3Rpb24gcmVtb3ZlRmlsZShmaWxlSUQpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHZhciBfZ2V0U3RhdGUzID0gdGhpcy5nZXRTdGF0ZSgpLFxuICAgICAgICBmaWxlcyA9IF9nZXRTdGF0ZTMuZmlsZXMsXG4gICAgICAgIGN1cnJlbnRVcGxvYWRzID0gX2dldFN0YXRlMy5jdXJyZW50VXBsb2FkcztcblxuICAgIHZhciB1cGRhdGVkRmlsZXMgPSBfZXh0ZW5kcyh7fSwgZmlsZXMpO1xuICAgIHZhciByZW1vdmVkRmlsZSA9IHVwZGF0ZWRGaWxlc1tmaWxlSURdO1xuICAgIGRlbGV0ZSB1cGRhdGVkRmlsZXNbZmlsZUlEXTtcblxuICAgIC8vIFJlbW92ZSB0aGlzIGZpbGUgZnJvbSBpdHMgYGN1cnJlbnRVcGxvYWRgLlxuICAgIHZhciB1cGRhdGVkVXBsb2FkcyA9IF9leHRlbmRzKHt9LCBjdXJyZW50VXBsb2Fkcyk7XG4gICAgdmFyIHJlbW92ZVVwbG9hZHMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyh1cGRhdGVkVXBsb2FkcykuZm9yRWFjaChmdW5jdGlvbiAodXBsb2FkSUQpIHtcbiAgICAgIHZhciBuZXdGaWxlSURzID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLmZpbGVJRHMuZmlsdGVyKGZ1bmN0aW9uICh1cGxvYWRGaWxlSUQpIHtcbiAgICAgICAgcmV0dXJuIHVwbG9hZEZpbGVJRCAhPT0gZmlsZUlEO1xuICAgICAgfSk7XG4gICAgICAvLyBSZW1vdmUgdGhlIHVwbG9hZCBpZiBubyBmaWxlcyBhcmUgYXNzb2NpYXRlZCB3aXRoIGl0IGFueW1vcmUuXG4gICAgICBpZiAobmV3RmlsZUlEcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVtb3ZlVXBsb2Fkcy5wdXNoKHVwbG9hZElEKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGVkVXBsb2Fkc1t1cGxvYWRJRF0gPSBfZXh0ZW5kcyh7fSwgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLCB7XG4gICAgICAgIGZpbGVJRHM6IG5ld0ZpbGVJRHNcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogdXBkYXRlZFVwbG9hZHMsXG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgfSk7XG5cbiAgICByZW1vdmVVcGxvYWRzLmZvckVhY2goZnVuY3Rpb24gKHVwbG9hZElEKSB7XG4gICAgICBfdGhpczMuX3JlbW92ZVVwbG9hZCh1cGxvYWRJRCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYWxjdWxhdGVUb3RhbFByb2dyZXNzKCk7XG4gICAgdGhpcy5lbWl0KCdmaWxlLXJlbW92ZWQnLCByZW1vdmVkRmlsZSk7XG4gICAgdGhpcy5sb2coJ0ZpbGUgcmVtb3ZlZDogJyArIHJlbW92ZWRGaWxlLmlkKTtcblxuICAgIC8vIENsZWFuIHVwIG9iamVjdCBVUkxzLlxuICAgIGlmIChyZW1vdmVkRmlsZS5wcmV2aWV3ICYmIGlzT2JqZWN0VVJMKHJlbW92ZWRGaWxlLnByZXZpZXcpKSB7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHJlbW92ZWRGaWxlLnByZXZpZXcpO1xuICAgIH1cblxuICAgIHRoaXMubG9nKCdSZW1vdmVkIGZpbGU6ICcgKyBmaWxlSUQpO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnBhdXNlUmVzdW1lID0gZnVuY3Rpb24gcGF1c2VSZXN1bWUoZmlsZUlEKSB7XG4gICAgaWYgKHRoaXMuZ2V0RmlsZShmaWxlSUQpLnVwbG9hZENvbXBsZXRlKSByZXR1cm47XG5cbiAgICB2YXIgd2FzUGF1c2VkID0gdGhpcy5nZXRGaWxlKGZpbGVJRCkuaXNQYXVzZWQgfHwgZmFsc2U7XG4gICAgdmFyIGlzUGF1c2VkID0gIXdhc1BhdXNlZDtcblxuICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGVJRCwge1xuICAgICAgaXNQYXVzZWQ6IGlzUGF1c2VkXG4gICAgfSk7XG5cbiAgICB0aGlzLmVtaXQoJ3VwbG9hZC1wYXVzZScsIGZpbGVJRCwgaXNQYXVzZWQpO1xuXG4gICAgcmV0dXJuIGlzUGF1c2VkO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnBhdXNlQWxsID0gZnVuY3Rpb24gcGF1c2VBbGwoKSB7XG4gICAgdmFyIHVwZGF0ZWRGaWxlcyA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpO1xuICAgIHZhciBpblByb2dyZXNzVXBkYXRlZEZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHJldHVybiAhdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlICYmIHVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRTdGFydGVkO1xuICAgIH0pO1xuXG4gICAgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICB2YXIgdXBkYXRlZEZpbGUgPSBfZXh0ZW5kcyh7fSwgdXBkYXRlZEZpbGVzW2ZpbGVdLCB7XG4gICAgICAgIGlzUGF1c2VkOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXSA9IHVwZGF0ZWRGaWxlO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogdXBkYXRlZEZpbGVzIH0pO1xuXG4gICAgdGhpcy5lbWl0KCdwYXVzZS1hbGwnKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZXN1bWVBbGwgPSBmdW5jdGlvbiByZXN1bWVBbGwoKSB7XG4gICAgdmFyIHVwZGF0ZWRGaWxlcyA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpO1xuICAgIHZhciBpblByb2dyZXNzVXBkYXRlZEZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHJldHVybiAhdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlICYmIHVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRTdGFydGVkO1xuICAgIH0pO1xuXG4gICAgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICB2YXIgdXBkYXRlZEZpbGUgPSBfZXh0ZW5kcyh7fSwgdXBkYXRlZEZpbGVzW2ZpbGVdLCB7XG4gICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGxcbiAgICAgIH0pO1xuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdID0gdXBkYXRlZEZpbGU7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiB1cGRhdGVkRmlsZXMgfSk7XG5cbiAgICB0aGlzLmVtaXQoJ3Jlc3VtZS1hbGwnKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZXRyeUFsbCA9IGZ1bmN0aW9uIHJldHJ5QWxsKCkge1xuICAgIHZhciB1cGRhdGVkRmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKTtcbiAgICB2YXIgZmlsZXNUb1JldHJ5ID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHJldHVybiB1cGRhdGVkRmlsZXNbZmlsZV0uZXJyb3I7XG4gICAgfSk7XG5cbiAgICBmaWxlc1RvUmV0cnkuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgdmFyIHVwZGF0ZWRGaWxlID0gX2V4dGVuZHMoe30sIHVwZGF0ZWRGaWxlc1tmaWxlXSwge1xuICAgICAgICBpc1BhdXNlZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBudWxsXG4gICAgICB9KTtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXSA9IHVwZGF0ZWRGaWxlO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlcyxcbiAgICAgIGVycm9yOiBudWxsXG4gICAgfSk7XG5cbiAgICB0aGlzLmVtaXQoJ3JldHJ5LWFsbCcsIGZpbGVzVG9SZXRyeSk7XG5cbiAgICB2YXIgdXBsb2FkSUQgPSB0aGlzLl9jcmVhdGVVcGxvYWQoZmlsZXNUb1JldHJ5KTtcbiAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5jYW5jZWxBbGwgPSBmdW5jdGlvbiBjYW5jZWxBbGwoKSB7XG4gICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICB0aGlzLmVtaXQoJ2NhbmNlbC1hbGwnKTtcblxuICAgIC8vIFRPRE8gT3Igc2hvdWxkIHdlIGp1c3QgY2FsbCByZW1vdmVGaWxlIG9uIGFsbCBmaWxlcz9cblxuICAgIHZhciBfZ2V0U3RhdGU0ID0gdGhpcy5nZXRTdGF0ZSgpLFxuICAgICAgICBjdXJyZW50VXBsb2FkcyA9IF9nZXRTdGF0ZTQuY3VycmVudFVwbG9hZHM7XG5cbiAgICB2YXIgdXBsb2FkSURzID0gT2JqZWN0LmtleXMoY3VycmVudFVwbG9hZHMpO1xuXG4gICAgdXBsb2FkSURzLmZvckVhY2goZnVuY3Rpb24gKGlkKSB7XG4gICAgICBfdGhpczQuX3JlbW92ZVVwbG9hZChpZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB7fSxcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDAsXG4gICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnJldHJ5VXBsb2FkID0gZnVuY3Rpb24gcmV0cnlVcGxvYWQoZmlsZUlEKSB7XG4gICAgdmFyIHVwZGF0ZWRGaWxlcyA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpO1xuICAgIHZhciB1cGRhdGVkRmlsZSA9IF9leHRlbmRzKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwgeyBlcnJvcjogbnVsbCwgaXNQYXVzZWQ6IGZhbHNlIH0pO1xuICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gdXBkYXRlZEZpbGU7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgfSk7XG5cbiAgICB0aGlzLmVtaXQoJ3VwbG9hZC1yZXRyeScsIGZpbGVJRCk7XG5cbiAgICB2YXIgdXBsb2FkSUQgPSB0aGlzLl9jcmVhdGVVcGxvYWQoW2ZpbGVJRF0pO1xuICAgIHJldHVybiB0aGlzLl9ydW5VcGxvYWQodXBsb2FkSUQpO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5jYW5jZWxBbGwoKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5fY2FsY3VsYXRlUHJvZ3Jlc3MgPSBmdW5jdGlvbiBfY2FsY3VsYXRlUHJvZ3Jlc3MoZmlsZSwgZGF0YSkge1xuICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICB0aGlzLmxvZygnTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcgKyBmaWxlLmlkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICBwcm9ncmVzczogX2V4dGVuZHMoe30sIHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcywge1xuICAgICAgICBieXRlc1VwbG9hZGVkOiBkYXRhLmJ5dGVzVXBsb2FkZWQsXG4gICAgICAgIGJ5dGVzVG90YWw6IGRhdGEuYnl0ZXNUb3RhbCxcbiAgICAgICAgcGVyY2VudGFnZTogTWF0aC5mbG9vcigoZGF0YS5ieXRlc1VwbG9hZGVkIC8gZGF0YS5ieXRlc1RvdGFsICogMTAwKS50b0ZpeGVkKDIpKVxuICAgICAgfSlcbiAgICB9KTtcblxuICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcyA9IGZ1bmN0aW9uIF9jYWxjdWxhdGVUb3RhbFByb2dyZXNzKCkge1xuICAgIC8vIGNhbGN1bGF0ZSB0b3RhbCBwcm9ncmVzcywgdXNpbmcgdGhlIG51bWJlciBvZiBmaWxlcyBjdXJyZW50bHkgdXBsb2FkaW5nLFxuICAgIC8vIG11bHRpcGxpZWQgYnkgMTAwIGFuZCB0aGUgc3VtbSBvZiBpbmRpdmlkdWFsIHByb2dyZXNzIG9mIGVhY2ggZmlsZVxuICAgIHZhciBmaWxlcyA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpO1xuXG4gICAgdmFyIGluUHJvZ3Jlc3MgPSBPYmplY3Qua2V5cyhmaWxlcykuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICByZXR1cm4gZmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZDtcbiAgICB9KTtcbiAgICB2YXIgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aCAqIDEwMDtcbiAgICB2YXIgcHJvZ3Jlc3NBbGwgPSAwO1xuICAgIGluUHJvZ3Jlc3MuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgcHJvZ3Jlc3NBbGwgPSBwcm9ncmVzc0FsbCArIGZpbGVzW2ZpbGVdLnByb2dyZXNzLnBlcmNlbnRhZ2U7XG4gICAgfSk7XG5cbiAgICB2YXIgdG90YWxQcm9ncmVzcyA9IHByb2dyZXNzTWF4ID09PSAwID8gMCA6IE1hdGguZmxvb3IoKHByb2dyZXNzQWxsICogMTAwIC8gcHJvZ3Jlc3NNYXgpLnRvRml4ZWQoMikpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0b3RhbFByb2dyZXNzOiB0b3RhbFByb2dyZXNzXG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBsaXN0ZW5lcnMgZm9yIGFsbCBnbG9iYWwgYWN0aW9ucywgbGlrZTpcbiAgICogYGVycm9yYCwgYGZpbGUtcmVtb3ZlZGAsIGB1cGxvYWQtcHJvZ3Jlc3NgXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuX2FkZExpc3RlbmVycyA9IGZ1bmN0aW9uIF9hZGRMaXN0ZW5lcnMoKSB7XG4gICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICB0aGlzLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgX3RoaXM1LnNldFN0YXRlKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtZXJyb3InLCBmdW5jdGlvbiAoZmlsZSwgZXJyb3IpIHtcbiAgICAgIF90aGlzNS5zZXRGaWxlU3RhdGUoZmlsZS5pZCwgeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgIF90aGlzNS5zZXRTdGF0ZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xuXG4gICAgICB2YXIgbWVzc2FnZSA9IF90aGlzNS5pMThuKCdmYWlsZWRUb1VwbG9hZCcsIHsgZmlsZTogZmlsZS5uYW1lIH0pO1xuICAgICAgaWYgKCh0eXBlb2YgZXJyb3IgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGVycm9yKSkgPT09ICdvYmplY3QnICYmIGVycm9yLm1lc3NhZ2UpIHtcbiAgICAgICAgbWVzc2FnZSA9IHsgbWVzc2FnZTogbWVzc2FnZSwgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9O1xuICAgICAgfVxuICAgICAgX3RoaXM1LmluZm8obWVzc2FnZSwgJ2Vycm9yJywgNTAwMCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCd1cGxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpczUuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ3VwbG9hZC1zdGFydGVkJywgZnVuY3Rpb24gKGZpbGUsIHVwbG9hZCkge1xuICAgICAgaWYgKCFfdGhpczUuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICBfdGhpczUubG9nKCdOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJyArIGZpbGUuaWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBfdGhpczUuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICB1cGxvYWRTdGFydGVkOiBEYXRlLm5vdygpLFxuICAgICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICAgICAgYnl0ZXNUb3RhbDogZmlsZS5zaXplXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gdXBsb2FkIHByb2dyZXNzIGV2ZW50cyBjYW4gb2NjdXIgZnJlcXVlbnRseSwgZXNwZWNpYWxseSB3aGVuIHlvdSBoYXZlIGEgZ29vZFxuICAgIC8vIGNvbm5lY3Rpb24gdG8gdGhlIHJlbW90ZSBzZXJ2ZXIuIFRoZXJlZm9yZSwgd2UgYXJlIHRocm90dGVsaW5nIHRoZW0gdG9cbiAgICAvLyBwcmV2ZW50IGFjY2Vzc2l2ZSBmdW5jdGlvbiBjYWxscy5cbiAgICAvLyBzZWUgYWxzbzogaHR0cHM6Ly9naXRodWIuY29tL3R1cy90dXMtanMtY2xpZW50L2NvbW1pdC85OTQwZjI3YjIzNjFmZDdlMTBiYTU4YjA5YjYwZDgyNDIyMTgzYmJiXG4gICAgLy8gY29uc3QgX3Rocm90dGxlZENhbGN1bGF0ZVByb2dyZXNzID0gdGhyb3R0bGUodGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MsIDEwMCwgeyBsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogdHJ1ZSB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkLXByb2dyZXNzJywgdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MpO1xuXG4gICAgdGhpcy5vbigndXBsb2FkLXN1Y2Nlc3MnLCBmdW5jdGlvbiAoZmlsZSwgdXBsb2FkUmVzcCwgdXBsb2FkVVJMKSB7XG4gICAgICB2YXIgY3VycmVudFByb2dyZXNzID0gX3RoaXM1LmdldEZpbGUoZmlsZS5pZCkucHJvZ3Jlc3M7XG4gICAgICBfdGhpczUuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IF9leHRlbmRzKHt9LCBjdXJyZW50UHJvZ3Jlc3MsIHtcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogdHJ1ZSxcbiAgICAgICAgICBwZXJjZW50YWdlOiAxMDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogY3VycmVudFByb2dyZXNzLmJ5dGVzVG90YWxcbiAgICAgICAgfSksXG4gICAgICAgIHVwbG9hZFVSTDogdXBsb2FkVVJMLFxuICAgICAgICBpc1BhdXNlZDogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpczUuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ3ByZXByb2Nlc3MtcHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZmlsZSwgcHJvZ3Jlc3MpIHtcbiAgICAgIGlmICghX3RoaXM1LmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgX3RoaXM1LmxvZygnTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcgKyBmaWxlLmlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgX3RoaXM1LnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBfZXh0ZW5kcyh7fSwgX3RoaXM1LmdldEZpbGUoZmlsZS5pZCkucHJvZ3Jlc3MsIHtcbiAgICAgICAgICBwcmVwcm9jZXNzOiBwcm9ncmVzc1xuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLWNvbXBsZXRlJywgZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIGlmICghX3RoaXM1LmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgX3RoaXM1LmxvZygnTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcgKyBmaWxlLmlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGZpbGVzID0gX2V4dGVuZHMoe30sIF90aGlzNS5nZXRTdGF0ZSgpLmZpbGVzKTtcbiAgICAgIGZpbGVzW2ZpbGUuaWRdID0gX2V4dGVuZHMoe30sIGZpbGVzW2ZpbGUuaWRdLCB7XG4gICAgICAgIHByb2dyZXNzOiBfZXh0ZW5kcyh7fSwgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MpXG4gICAgICB9KTtcbiAgICAgIGRlbGV0ZSBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcy5wcmVwcm9jZXNzO1xuXG4gICAgICBfdGhpczUuc2V0U3RhdGUoeyBmaWxlczogZmlsZXMgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdwb3N0cHJvY2Vzcy1wcm9ncmVzcycsIGZ1bmN0aW9uIChmaWxlLCBwcm9ncmVzcykge1xuICAgICAgaWYgKCFfdGhpczUuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICBfdGhpczUubG9nKCdOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJyArIGZpbGUuaWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBfdGhpczUuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IF9leHRlbmRzKHt9LCBfdGhpczUuZ2V0U3RhdGUoKS5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcywge1xuICAgICAgICAgIHBvc3Rwcm9jZXNzOiBwcm9ncmVzc1xuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdwb3N0cHJvY2Vzcy1jb21wbGV0ZScsIGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICBpZiAoIV90aGlzNS5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIF90aGlzNS5sb2coJ05vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnICsgZmlsZS5pZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBmaWxlcyA9IF9leHRlbmRzKHt9LCBfdGhpczUuZ2V0U3RhdGUoKS5maWxlcyk7XG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IF9leHRlbmRzKHt9LCBmaWxlc1tmaWxlLmlkXSwge1xuICAgICAgICBwcm9ncmVzczogX2V4dGVuZHMoe30sIGZpbGVzW2ZpbGUuaWRdLnByb2dyZXNzKVxuICAgICAgfSk7XG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucG9zdHByb2Nlc3M7XG4gICAgICAvLyBUT0RPIHNob3VsZCB3ZSBzZXQgc29tZSBraW5kIG9mIGBmdWxseUNvbXBsZXRlYCBwcm9wZXJ0eSBvbiB0aGUgZmlsZSBvYmplY3RcbiAgICAgIC8vIHNvIGl0J3MgZWFzaWVyIHRvIHNlZSB0aGF0IHRoZSBmaWxlIGlzIHVwbG9hZOKApmZ1bGx5IGNvbXBsZXRl4oCmcmF0aGVyIHRoYW5cbiAgICAgIC8vIHdoYXQgd2UgaGF2ZSB0byBkbyBub3cgKGB1cGxvYWRDb21wbGV0ZSAmJiAhcG9zdHByb2Nlc3NgKVxuXG4gICAgICBfdGhpczUuc2V0U3RhdGUoeyBmaWxlczogZmlsZXMgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdyZXN0b3JlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIEZpbGVzIG1heSBoYXZlIGNoYW5nZWQtLWVuc3VyZSBwcm9ncmVzcyBpcyBzdGlsbCBhY2N1cmF0ZS5cbiAgICAgIF90aGlzNS5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpO1xuICAgIH0pO1xuXG4gICAgLy8gc2hvdyBpbmZvcm1lciBpZiBvZmZsaW5lXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb25saW5lJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXM1LnVwZGF0ZU9ubGluZVN0YXR1cygpO1xuICAgICAgfSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzNS51cGRhdGVPbmxpbmVTdGF0dXMoKTtcbiAgICAgIH0pO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczUudXBkYXRlT25saW5lU3RhdHVzKCk7XG4gICAgICB9LCAzMDAwKTtcbiAgICB9XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUudXBkYXRlT25saW5lU3RhdHVzID0gZnVuY3Rpb24gdXBkYXRlT25saW5lU3RhdHVzKCkge1xuICAgIHZhciBvbmxpbmUgPSB0eXBlb2Ygd2luZG93Lm5hdmlnYXRvci5vbkxpbmUgIT09ICd1bmRlZmluZWQnID8gd2luZG93Lm5hdmlnYXRvci5vbkxpbmUgOiB0cnVlO1xuICAgIGlmICghb25saW5lKSB7XG4gICAgICB0aGlzLmVtaXQoJ2lzLW9mZmxpbmUnKTtcbiAgICAgIHRoaXMuaW5mbyh0aGlzLmkxOG4oJ25vSW50ZXJuZXRDb25uZWN0aW9uJyksICdlcnJvcicsIDApO1xuICAgICAgdGhpcy53YXNPZmZsaW5lID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbWl0KCdpcy1vbmxpbmUnKTtcbiAgICAgIGlmICh0aGlzLndhc09mZmxpbmUpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdiYWNrLW9ubGluZScpO1xuICAgICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdjb25uZWN0ZWRUb0ludGVybmV0JyksICdzdWNjZXNzJywgMzAwMCk7XG4gICAgICAgIHRoaXMud2FzT2ZmbGluZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5nZXRJRCA9IGZ1bmN0aW9uIGdldElEKCkge1xuICAgIHJldHVybiB0aGlzLm9wdHMuaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIHBsdWdpbiB3aXRoIENvcmUuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBQbHVnaW4gb2JqZWN0XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0c10gb2JqZWN0IHdpdGggb3B0aW9ucyB0byBiZSBwYXNzZWQgdG8gUGx1Z2luXG4gICAqIEByZXR1cm4ge09iamVjdH0gc2VsZiBmb3IgY2hhaW5pbmdcbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoUGx1Z2luLCBvcHRzKSB7XG4gICAgaWYgKHR5cGVvZiBQbHVnaW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBtc2cgPSAnRXhwZWN0ZWQgYSBwbHVnaW4gY2xhc3MsIGJ1dCBnb3QgJyArIChQbHVnaW4gPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgUGx1Z2luID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihQbHVnaW4pKSArICcuJyArICcgUGxlYXNlIHZlcmlmeSB0aGF0IHRoZSBwbHVnaW4gd2FzIGltcG9ydGVkIGFuZCBzcGVsbGVkIGNvcnJlY3RseS4nO1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cpO1xuICAgIH1cblxuICAgIC8vIEluc3RhbnRpYXRlXG4gICAgdmFyIHBsdWdpbiA9IG5ldyBQbHVnaW4odGhpcywgb3B0cyk7XG4gICAgdmFyIHBsdWdpbklkID0gcGx1Z2luLmlkO1xuICAgIHRoaXMucGx1Z2luc1twbHVnaW4udHlwZV0gPSB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdIHx8IFtdO1xuXG4gICAgaWYgKCFwbHVnaW5JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYW4gaWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIXBsdWdpbi50eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdXIgcGx1Z2luIG11c3QgaGF2ZSBhIHR5cGUnKTtcbiAgICB9XG5cbiAgICB2YXIgZXhpc3RzUGx1Z2luQWxyZWFkeSA9IHRoaXMuZ2V0UGx1Z2luKHBsdWdpbklkKTtcbiAgICBpZiAoZXhpc3RzUGx1Z2luQWxyZWFkeSkge1xuICAgICAgdmFyIF9tc2cgPSAnQWxyZWFkeSBmb3VuZCBhIHBsdWdpbiBuYW1lZCBcXCcnICsgZXhpc3RzUGx1Z2luQWxyZWFkeS5pZCArICdcXCcuICcgKyAoJ1RyaWVkIHRvIHVzZTogXFwnJyArIHBsdWdpbklkICsgJ1xcJy5cXG4nKSArICdVcHB5IHBsdWdpbnMgbXVzdCBoYXZlIHVuaXF1ZSBcXCdpZFxcJyBvcHRpb25zLiBTZWUgaHR0cHM6Ly91cHB5LmlvL2RvY3MvcGx1Z2lucy8jaWQuJztcbiAgICAgIHRocm93IG5ldyBFcnJvcihfbXNnKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdLnB1c2gocGx1Z2luKTtcbiAgICBwbHVnaW4uaW5zdGFsbCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZpbmQgb25lIFBsdWdpbiBieSBuYW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBkZXNjcmlwdGlvblxuICAgKiBAcmV0dXJuIHtvYmplY3QgfCBib29sZWFufVxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLmdldFBsdWdpbiA9IGZ1bmN0aW9uIGdldFBsdWdpbihuYW1lKSB7XG4gICAgdmFyIGZvdW5kUGx1Z2luID0gbnVsbDtcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHZhciBwbHVnaW5OYW1lID0gcGx1Z2luLmlkO1xuICAgICAgaWYgKHBsdWdpbk5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgZm91bmRQbHVnaW4gPSBwbHVnaW47XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZm91bmRQbHVnaW47XG4gIH07XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhyb3VnaCBhbGwgYHVzZWBkIHBsdWdpbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZCB0aGF0IHdpbGwgYmUgcnVuIG9uIGVhY2ggcGx1Z2luXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuaXRlcmF0ZVBsdWdpbnMgPSBmdW5jdGlvbiBpdGVyYXRlUGx1Z2lucyhtZXRob2QpIHtcbiAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgIE9iamVjdC5rZXlzKHRoaXMucGx1Z2lucykuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luVHlwZSkge1xuICAgICAgX3RoaXM2LnBsdWdpbnNbcGx1Z2luVHlwZV0uZm9yRWFjaChtZXRob2QpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVbmluc3RhbGwgYW5kIHJlbW92ZSBhIHBsdWdpbi5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGluc3RhbmNlIFRoZSBwbHVnaW4gaW5zdGFuY2UgdG8gcmVtb3ZlLlxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLnJlbW92ZVBsdWdpbiA9IGZ1bmN0aW9uIHJlbW92ZVBsdWdpbihpbnN0YW5jZSkge1xuICAgIHRoaXMubG9nKCdSZW1vdmluZyBwbHVnaW4gJyArIGluc3RhbmNlLmlkKTtcbiAgICB0aGlzLmVtaXQoJ3BsdWdpbi1yZW1vdmUnLCBpbnN0YW5jZSk7XG5cbiAgICBpZiAoaW5zdGFuY2UudW5pbnN0YWxsKSB7XG4gICAgICBpbnN0YW5jZS51bmluc3RhbGwoKTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdCA9IHRoaXMucGx1Z2luc1tpbnN0YW5jZS50eXBlXS5zbGljZSgpO1xuICAgIHZhciBpbmRleCA9IGxpc3QuaW5kZXhPZihpbnN0YW5jZSk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5wbHVnaW5zW2luc3RhbmNlLnR5cGVdID0gbGlzdDtcbiAgICB9XG5cbiAgICB2YXIgdXBkYXRlZFN0YXRlID0gdGhpcy5nZXRTdGF0ZSgpO1xuICAgIGRlbGV0ZSB1cGRhdGVkU3RhdGUucGx1Z2luc1tpbnN0YW5jZS5pZF07XG4gICAgdGhpcy5zZXRTdGF0ZSh1cGRhdGVkU3RhdGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVbmluc3RhbGwgYWxsIHBsdWdpbnMgYW5kIGNsb3NlIGRvd24gdGhpcyBVcHB5IGluc3RhbmNlLlxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgdmFyIF90aGlzNyA9IHRoaXM7XG5cbiAgICB0aGlzLmxvZygnQ2xvc2luZyBVcHB5IGluc3RhbmNlICcgKyB0aGlzLm9wdHMuaWQgKyAnOiByZW1vdmluZyBhbGwgZmlsZXMgYW5kIHVuaW5zdGFsbGluZyBwbHVnaW5zJyk7XG5cbiAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICB0aGlzLl9zdG9yZVVuc3Vic2NyaWJlKCk7XG5cbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIF90aGlzNy5yZW1vdmVQbHVnaW4ocGx1Z2luKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgKiBTZXQgaW5mbyBtZXNzYWdlIGluIGBzdGF0ZS5pbmZvYCwgc28gdGhhdCBVSSBwbHVnaW5zIGxpa2UgYEluZm9ybWVyYFxuICAqIGNhbiBkaXNwbGF5IHRoZSBtZXNzYWdlLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmcgfCBvYmplY3R9IG1lc3NhZ2UgTWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGluZm9ybWVyXG4gICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXVxuICAqIEBwYXJhbSB7bnVtYmVyfSBbZHVyYXRpb25dXG4gICovXG5cbiAgVXBweS5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uIGluZm8obWVzc2FnZSkge1xuICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnaW5mbyc7XG4gICAgdmFyIGR1cmF0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAzMDAwO1xuXG4gICAgdmFyIGlzQ29tcGxleE1lc3NhZ2UgPSAodHlwZW9mIG1lc3NhZ2UgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG1lc3NhZ2UpKSA9PT0gJ29iamVjdCc7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGluZm86IHtcbiAgICAgICAgaXNIaWRkZW46IGZhbHNlLFxuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBtZXNzYWdlOiBpc0NvbXBsZXhNZXNzYWdlID8gbWVzc2FnZS5tZXNzYWdlIDogbWVzc2FnZSxcbiAgICAgICAgZGV0YWlsczogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UuZGV0YWlscyA6IG51bGxcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZW1pdCgnaW5mby12aXNpYmxlJyk7XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5pbmZvVGltZW91dElEKTtcbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIHRoaXMuaW5mb1RpbWVvdXRJRCA9IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBoaWRlIHRoZSBpbmZvcm1lciBhZnRlciBgZHVyYXRpb25gIG1pbGxpc2Vjb25kc1xuICAgIHRoaXMuaW5mb1RpbWVvdXRJRCA9IHNldFRpbWVvdXQodGhpcy5oaWRlSW5mbywgZHVyYXRpb24pO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLmhpZGVJbmZvID0gZnVuY3Rpb24gaGlkZUluZm8oKSB7XG4gICAgdmFyIG5ld0luZm8gPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmluZm8sIHtcbiAgICAgIGlzSGlkZGVuOiB0cnVlXG4gICAgfSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpbmZvOiBuZXdJbmZvXG4gICAgfSk7XG4gICAgdGhpcy5lbWl0KCdpbmZvLWhpZGRlbicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb2dzIHN0dWZmIHRvIGNvbnNvbGUsIG9ubHkgaWYgYGRlYnVnYCBpcyBzZXQgdG8gdHJ1ZS4gU2lsZW50IGluIHByb2R1Y3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gbXNnIHRvIGxvZ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIG9wdGlvbmFsIGBlcnJvcmAgb3IgYHdhcm5pbmdgXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24gbG9nKG1zZywgdHlwZSkge1xuICAgIGlmICghdGhpcy5vcHRzLmRlYnVnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1lc3NhZ2UgPSAnW1VwcHldIFsnICsgZ2V0VGltZVN0YW1wKCkgKyAnXSAnICsgbXNnO1xuXG4gICAgd2luZG93Wyd1cHB5TG9nJ10gPSB3aW5kb3dbJ3VwcHlMb2cnXSArICdcXG4nICsgJ0RFQlVHIExPRzogJyArIG1zZztcblxuICAgIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0eXBlID09PSAnd2FybmluZycpIHtcbiAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobXNnID09PSAnJyArIG1zZykge1xuICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UgPSAnW1VwcHldIFsnICsgZ2V0VGltZVN0YW1wKCkgKyAnXSc7XG4gICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICAgIGNvbnNvbGUuZGlyKG1zZyk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBPYnNvbGV0ZSwgZXZlbnQgbGlzdGVuZXJzIGFyZSBub3cgYWRkZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uIHJ1bigpIHtcbiAgICB0aGlzLmxvZygnQ2FsbGluZyBydW4oKSBpcyBubyBsb25nZXIgbmVjZXNzYXJ5LicsICd3YXJuaW5nJyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgYW4gdXBsb2FkIGJ5IGl0cyBJRC5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24gcmVzdG9yZSh1cGxvYWRJRCkge1xuICAgIHRoaXMubG9nKCdDb3JlOiBhdHRlbXB0aW5nIHRvIHJlc3RvcmUgdXBsb2FkIFwiJyArIHVwbG9hZElEICsgJ1wiJyk7XG5cbiAgICBpZiAoIXRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0pIHtcbiAgICAgIHRoaXMuX3JlbW92ZVVwbG9hZCh1cGxvYWRJRCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdOb25leGlzdGVudCB1cGxvYWQnKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiB1cGxvYWQgZm9yIGEgYnVuY2ggb2YgZmlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmlsZUlEcyBGaWxlIElEcyB0byBpbmNsdWRlIGluIHRoaXMgdXBsb2FkLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IElEIG9mIHRoaXMgdXBsb2FkLlxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLl9jcmVhdGVVcGxvYWQgPSBmdW5jdGlvbiBfY3JlYXRlVXBsb2FkKGZpbGVJRHMpIHtcbiAgICB2YXIgX2V4dGVuZHM0O1xuXG4gICAgdmFyIHVwbG9hZElEID0gY3VpZCgpO1xuXG4gICAgdGhpcy5lbWl0KCd1cGxvYWQnLCB7XG4gICAgICBpZDogdXBsb2FkSUQsXG4gICAgICBmaWxlSURzOiBmaWxlSURzXG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzLCAoX2V4dGVuZHM0ID0ge30sIF9leHRlbmRzNFt1cGxvYWRJRF0gPSB7XG4gICAgICAgIGZpbGVJRHM6IGZpbGVJRHMsXG4gICAgICAgIHN0ZXA6IDAsXG4gICAgICAgIHJlc3VsdDoge31cbiAgICAgIH0sIF9leHRlbmRzNCkpXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXBsb2FkSUQ7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuX2dldFVwbG9hZCA9IGZ1bmN0aW9uIF9nZXRVcGxvYWQodXBsb2FkSUQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGRhdGEgdG8gYW4gdXBsb2FkJ3MgcmVzdWx0IG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwbG9hZElEIFRoZSBJRCBvZiB0aGUgdXBsb2FkLlxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBEYXRhIHByb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSByZXN1bHQgb2JqZWN0LlxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLmFkZFJlc3VsdERhdGEgPSBmdW5jdGlvbiBhZGRSZXN1bHREYXRhKHVwbG9hZElELCBkYXRhKSB7XG4gICAgdmFyIF9leHRlbmRzNTtcblxuICAgIGlmICghdGhpcy5fZ2V0VXBsb2FkKHVwbG9hZElEKSkge1xuICAgICAgdGhpcy5sb2coJ05vdCBzZXR0aW5nIHJlc3VsdCBmb3IgYW4gdXBsb2FkIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJyArIHVwbG9hZElEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGN1cnJlbnRVcGxvYWRzID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzO1xuICAgIHZhciBjdXJyZW50VXBsb2FkID0gX2V4dGVuZHMoe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwge1xuICAgICAgcmVzdWx0OiBfZXh0ZW5kcyh7fSwgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLnJlc3VsdCwgZGF0YSlcbiAgICB9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiBfZXh0ZW5kcyh7fSwgY3VycmVudFVwbG9hZHMsIChfZXh0ZW5kczUgPSB7fSwgX2V4dGVuZHM1W3VwbG9hZElEXSA9IGN1cnJlbnRVcGxvYWQsIF9leHRlbmRzNSkpXG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiB1cGxvYWQsIGVnLiBpZiBpdCBoYXMgYmVlbiBjYW5jZWxlZCBvciBjb21wbGV0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cGxvYWRJRCBUaGUgSUQgb2YgdGhlIHVwbG9hZC5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5fcmVtb3ZlVXBsb2FkID0gZnVuY3Rpb24gX3JlbW92ZVVwbG9hZCh1cGxvYWRJRCkge1xuICAgIHZhciBjdXJyZW50VXBsb2FkcyA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHMpO1xuICAgIGRlbGV0ZSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF07XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiBjdXJyZW50VXBsb2Fkc1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSdW4gYW4gdXBsb2FkLiBUaGlzIHBpY2tzIHVwIHdoZXJlIGl0IGxlZnQgb2ZmIGluIGNhc2UgdGhlIHVwbG9hZCBpcyBiZWluZyByZXN0b3JlZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5fcnVuVXBsb2FkID0gZnVuY3Rpb24gX3J1blVwbG9hZCh1cGxvYWRJRCkge1xuICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgdmFyIHVwbG9hZERhdGEgPSB0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHNbdXBsb2FkSURdO1xuICAgIHZhciBmaWxlSURzID0gdXBsb2FkRGF0YS5maWxlSURzO1xuICAgIHZhciByZXN0b3JlU3RlcCA9IHVwbG9hZERhdGEuc3RlcDtcblxuICAgIHZhciBzdGVwcyA9IFtdLmNvbmNhdCh0aGlzLnByZVByb2Nlc3NvcnMsIHRoaXMudXBsb2FkZXJzLCB0aGlzLnBvc3RQcm9jZXNzb3JzKTtcbiAgICB2YXIgbGFzdFN0ZXAgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBzdGVwcy5mb3JFYWNoKGZ1bmN0aW9uIChmbiwgc3RlcCkge1xuICAgICAgLy8gU2tpcCB0aGlzIHN0ZXAgaWYgd2UgYXJlIHJlc3RvcmluZyBhbmQgaGF2ZSBhbHJlYWR5IGNvbXBsZXRlZCB0aGlzIHN0ZXAgYmVmb3JlLlxuICAgICAgaWYgKHN0ZXAgPCByZXN0b3JlU3RlcCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxhc3RTdGVwID0gbGFzdFN0ZXAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfZXh0ZW5kczY7XG5cbiAgICAgICAgdmFyIF9nZXRTdGF0ZTUgPSBfdGhpczguZ2V0U3RhdGUoKSxcbiAgICAgICAgICAgIGN1cnJlbnRVcGxvYWRzID0gX2dldFN0YXRlNS5jdXJyZW50VXBsb2FkcztcblxuICAgICAgICB2YXIgY3VycmVudFVwbG9hZCA9IF9leHRlbmRzKHt9LCBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0sIHtcbiAgICAgICAgICBzdGVwOiBzdGVwXG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpczguc2V0U3RhdGUoe1xuICAgICAgICAgIGN1cnJlbnRVcGxvYWRzOiBfZXh0ZW5kcyh7fSwgY3VycmVudFVwbG9hZHMsIChfZXh0ZW5kczYgPSB7fSwgX2V4dGVuZHM2W3VwbG9hZElEXSA9IGN1cnJlbnRVcGxvYWQsIF9leHRlbmRzNikpXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBUT0RPIGdpdmUgdGhpcyB0aGUgYGN1cnJlbnRVcGxvYWRgIG9iamVjdCBhcyBpdHMgb25seSBwYXJhbWV0ZXIgbWF5YmU/XG4gICAgICAgIC8vIE90aGVyd2lzZSB3aGVuIG1vcmUgbWV0YWRhdGEgbWF5IGJlIGFkZGVkIHRvIHRoZSB1cGxvYWQgdGhpcyB3b3VsZCBrZWVwIGdldHRpbmcgbW9yZSBwYXJhbWV0ZXJzXG4gICAgICAgIHJldHVybiBmbihmaWxlSURzLCB1cGxvYWRJRCk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIE5vdCByZXR1cm5pbmcgdGhlIGBjYXRjaGBlZCBwcm9taXNlLCBiZWNhdXNlIHdlIHN0aWxsIHdhbnQgdG8gcmV0dXJuIGEgcmVqZWN0ZWRcbiAgICAvLyBwcm9taXNlIGZyb20gdGhpcyBtZXRob2QgaWYgdGhlIHVwbG9hZCBmYWlsZWQuXG4gICAgbGFzdFN0ZXAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgX3RoaXM4LmVtaXQoJ2Vycm9yJywgZXJyLCB1cGxvYWRJRCk7XG5cbiAgICAgIF90aGlzOC5fcmVtb3ZlVXBsb2FkKHVwbG9hZElEKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBsYXN0U3RlcC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWxlcyA9IGZpbGVJRHMubWFwKGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzOC5nZXRGaWxlKGZpbGVJRCk7XG4gICAgICB9KTtcbiAgICAgIHZhciBzdWNjZXNzZnVsID0gZmlsZXMuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBmaWxlICYmICFmaWxlLmVycm9yO1xuICAgICAgfSk7XG4gICAgICB2YXIgZmFpbGVkID0gZmlsZXMuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIHJldHVybiBmaWxlICYmIGZpbGUuZXJyb3I7XG4gICAgICB9KTtcbiAgICAgIF90aGlzOC5hZGRSZXN1bHREYXRhKHVwbG9hZElELCB7IHN1Y2Nlc3NmdWw6IHN1Y2Nlc3NmdWwsIGZhaWxlZDogZmFpbGVkLCB1cGxvYWRJRDogdXBsb2FkSUQgfSk7XG5cbiAgICAgIHZhciBfZ2V0U3RhdGU2ID0gX3RoaXM4LmdldFN0YXRlKCksXG4gICAgICAgICAgY3VycmVudFVwbG9hZHMgPSBfZ2V0U3RhdGU2LmN1cnJlbnRVcGxvYWRzO1xuXG4gICAgICBpZiAoIWN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSkge1xuICAgICAgICBfdGhpczgubG9nKCdOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcgKyB1cGxvYWRJRCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3VsdCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXS5yZXN1bHQ7XG4gICAgICBfdGhpczguZW1pdCgnY29tcGxldGUnLCByZXN1bHQpO1xuXG4gICAgICBfdGhpczguX3JlbW92ZVVwbG9hZCh1cGxvYWRJRCk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGFuIHVwbG9hZCBmb3IgYWxsIHRoZSBmaWxlcyB0aGF0IGFyZSBub3QgY3VycmVudGx5IGJlaW5nIHVwbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLnVwbG9hZCA9IGZ1bmN0aW9uIHVwbG9hZCgpIHtcbiAgICB2YXIgX3RoaXM5ID0gdGhpcztcblxuICAgIGlmICghdGhpcy5wbHVnaW5zLnVwbG9hZGVyKSB7XG4gICAgICB0aGlzLmxvZygnTm8gdXBsb2FkZXIgdHlwZSBwbHVnaW5zIGFyZSB1c2VkJywgJ3dhcm5pbmcnKTtcbiAgICB9XG5cbiAgICB2YXIgZmlsZXMgPSB0aGlzLmdldFN0YXRlKCkuZmlsZXM7XG4gICAgdmFyIG9uQmVmb3JlVXBsb2FkUmVzdWx0ID0gdGhpcy5vcHRzLm9uQmVmb3JlVXBsb2FkKGZpbGVzKTtcblxuICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vdCBzdGFydGluZyB0aGUgdXBsb2FkIGJlY2F1c2Ugb25CZWZvcmVVcGxvYWQgcmV0dXJuZWQgZmFsc2UnKSk7XG4gICAgfVxuXG4gICAgaWYgKG9uQmVmb3JlVXBsb2FkUmVzdWx0ICYmICh0eXBlb2Ygb25CZWZvcmVVcGxvYWRSZXN1bHQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG9uQmVmb3JlVXBsb2FkUmVzdWx0KSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAvLyB3YXJuaW5nIGFmdGVyIHRoZSBjaGFuZ2UgaW4gMC4yNFxuICAgICAgaWYgKG9uQmVmb3JlVXBsb2FkUmVzdWx0LnRoZW4pIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25CZWZvcmVVcGxvYWQoKSByZXR1cm5lZCBhIFByb21pc2UsIGJ1dCB0aGlzIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQuIEl0IG11c3QgYmUgc3luY2hyb25vdXMuJyk7XG4gICAgICB9XG5cbiAgICAgIGZpbGVzID0gb25CZWZvcmVVcGxvYWRSZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzOS5fY2hlY2tNaW5OdW1iZXJPZkZpbGVzKGZpbGVzKTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfZ2V0U3RhdGU3ID0gX3RoaXM5LmdldFN0YXRlKCksXG4gICAgICAgICAgY3VycmVudFVwbG9hZHMgPSBfZ2V0U3RhdGU3LmN1cnJlbnRVcGxvYWRzO1xuICAgICAgLy8gZ2V0IGEgbGlzdCBvZiBmaWxlcyB0aGF0IGFyZSBjdXJyZW50bHkgYXNzaWduZWQgdG8gdXBsb2Fkc1xuXG5cbiAgICAgIHZhciBjdXJyZW50bHlVcGxvYWRpbmdGaWxlcyA9IE9iamVjdC5rZXlzKGN1cnJlbnRVcGxvYWRzKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnIpIHtcbiAgICAgICAgcmV0dXJuIHByZXYuY29uY2F0KGN1cnJlbnRVcGxvYWRzW2N1cnJdLmZpbGVJRHMpO1xuICAgICAgfSwgW10pO1xuXG4gICAgICB2YXIgd2FpdGluZ0ZpbGVJRHMgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICAgICAgdmFyIGZpbGUgPSBfdGhpczkuZ2V0RmlsZShmaWxlSUQpO1xuICAgICAgICAvLyBpZiB0aGUgZmlsZSBoYXNuJ3Qgc3RhcnRlZCB1cGxvYWRpbmcgYW5kIGhhc24ndCBhbHJlYWR5IGJlZW4gYXNzaWduZWQgdG8gYW4gdXBsb2FkLi5cbiAgICAgICAgaWYgKCFmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQgJiYgY3VycmVudGx5VXBsb2FkaW5nRmlsZXMuaW5kZXhPZihmaWxlSUQpID09PSAtMSkge1xuICAgICAgICAgIHdhaXRpbmdGaWxlSURzLnB1c2goZmlsZS5pZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdXBsb2FkSUQgPSBfdGhpczkuX2NyZWF0ZVVwbG9hZCh3YWl0aW5nRmlsZUlEcyk7XG4gICAgICByZXR1cm4gX3RoaXM5Ll9ydW5VcGxvYWQodXBsb2FkSUQpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHZhciBtZXNzYWdlID0gKHR5cGVvZiBlcnIgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGVycikpID09PSAnb2JqZWN0JyA/IGVyci5tZXNzYWdlIDogZXJyO1xuICAgICAgdmFyIGRldGFpbHMgPSAodHlwZW9mIGVyciA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZXJyKSkgPT09ICdvYmplY3QnID8gZXJyLmRldGFpbHMgOiBudWxsO1xuICAgICAgX3RoaXM5LmxvZyhtZXNzYWdlICsgJyAnICsgZGV0YWlscyk7XG4gICAgICBfdGhpczkuaW5mbyh7IG1lc3NhZ2U6IG1lc3NhZ2UsIGRldGFpbHM6IGRldGFpbHMgfSwgJ2Vycm9yJywgNDAwMCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoKHR5cGVvZiBlcnIgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGVycikpID09PSAnb2JqZWN0JyA/IGVyciA6IG5ldyBFcnJvcihlcnIpKTtcbiAgICB9KTtcbiAgfTtcblxuICBfY3JlYXRlQ2xhc3MoVXBweSwgW3tcbiAgICBrZXk6ICdzdGF0ZScsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBVcHB5O1xufSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRzKSB7XG4gIHJldHVybiBuZXcgVXBweShvcHRzKTtcbn07XG5cbi8vIEV4cG9zZSBjbGFzcyBjb25zdHJ1Y3Rvci5cbm1vZHVsZS5leHBvcnRzLlVwcHkgPSBVcHB5OyIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFBsdWdpbiA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUvbGliL1BsdWdpbicpO1xudmFyIHRvQXJyYXkgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvdG9BcnJheScpO1xudmFyIFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdwcmVhY3QnKSxcbiAgICBoID0gX3JlcXVpcmUuaDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoX1BsdWdpbikge1xuICBfaW5oZXJpdHMoRmlsZUlucHV0LCBfUGx1Z2luKTtcblxuICBmdW5jdGlvbiBGaWxlSW5wdXQodXBweSwgb3B0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGaWxlSW5wdXQpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX1BsdWdpbi5jYWxsKHRoaXMsIHVwcHksIG9wdHMpKTtcblxuICAgIF90aGlzLmlkID0gX3RoaXMub3B0cy5pZCB8fCAnRmlsZUlucHV0JztcbiAgICBfdGhpcy50aXRsZSA9ICdGaWxlIElucHV0JztcbiAgICBfdGhpcy50eXBlID0gJ2FjcXVpcmVyJztcblxuICAgIHZhciBkZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICBjaG9vc2VGaWxlczogJ0Nob29zZSBmaWxlcydcbiAgICAgIH1cblxuICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgfTt2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB0YXJnZXQ6IG51bGwsXG4gICAgICBwcmV0dHk6IHRydWUsXG4gICAgICBpbnB1dE5hbWU6ICdmaWxlc1tdJyxcbiAgICAgIGxvY2FsZTogZGVmYXVsdExvY2FsZVxuXG4gICAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIH07X3RoaXMub3B0cyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cyk7XG5cbiAgICBfdGhpcy5sb2NhbGUgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdExvY2FsZSwgX3RoaXMub3B0cy5sb2NhbGUpO1xuICAgIF90aGlzLmxvY2FsZS5zdHJpbmdzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRMb2NhbGUuc3RyaW5ncywgX3RoaXMub3B0cy5sb2NhbGUuc3RyaW5ncyk7XG5cbiAgICAvLyBpMThuXG4gICAgX3RoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKHsgbG9jYWxlOiBfdGhpcy5sb2NhbGUgfSk7XG4gICAgX3RoaXMuaTE4biA9IF90aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQoX3RoaXMudHJhbnNsYXRvcik7XG5cbiAgICBfdGhpcy5yZW5kZXIgPSBfdGhpcy5yZW5kZXIuYmluZChfdGhpcyk7XG4gICAgX3RoaXMuaGFuZGxlSW5wdXRDaGFuZ2UgPSBfdGhpcy5oYW5kbGVJbnB1dENoYW5nZS5iaW5kKF90aGlzKTtcbiAgICBfdGhpcy5oYW5kbGVDbGljayA9IF90aGlzLmhhbmRsZUNsaWNrLmJpbmQoX3RoaXMpO1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIEZpbGVJbnB1dC5wcm90b3R5cGUuaGFuZGxlSW5wdXRDaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVJbnB1dENoYW5nZShldikge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgdGhpcy51cHB5LmxvZygnW0ZpbGVJbnB1dF0gU29tZXRoaW5nIHNlbGVjdGVkIHRocm91Z2ggaW5wdXQuLi4nKTtcblxuICAgIHZhciBmaWxlcyA9IHRvQXJyYXkoZXYudGFyZ2V0LmZpbGVzKTtcblxuICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIF90aGlzMi51cHB5LmFkZEZpbGUoe1xuICAgICAgICAgIHNvdXJjZTogX3RoaXMyLmlkLFxuICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICB0eXBlOiBmaWxlLnR5cGUsXG4gICAgICAgICAgZGF0YTogZmlsZVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBOb3RoaW5nLCByZXN0cmljdGlvbiBlcnJvcnMgaGFuZGxlZCBpbiBDb3JlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgRmlsZUlucHV0LnByb3RvdHlwZS5oYW5kbGVDbGljayA9IGZ1bmN0aW9uIGhhbmRsZUNsaWNrKGV2KSB7XG4gICAgdGhpcy5pbnB1dC5jbGljaygpO1xuICB9O1xuXG4gIEZpbGVJbnB1dC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKHN0YXRlKSB7XG4gICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAvKiBodHRwOi8vdHltcGFudXMubmV0L2NvZHJvcHMvMjAxNS8wOS8xNS9zdHlsaW5nLWN1c3RvbWl6aW5nLWZpbGUtaW5wdXRzLXNtYXJ0LXdheS8gKi9cbiAgICB2YXIgaGlkZGVuSW5wdXRTdHlsZSA9IHtcbiAgICAgIHdpZHRoOiAnMC4xcHgnLFxuICAgICAgaGVpZ2h0OiAnMC4xcHgnLFxuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgekluZGV4OiAtMVxuICAgIH07XG5cbiAgICB2YXIgcmVzdHJpY3Rpb25zID0gdGhpcy51cHB5Lm9wdHMucmVzdHJpY3Rpb25zO1xuXG4gICAgLy8gZW1wdHkgdmFsdWU9XCJcIiBvbiBmaWxlIGlucHV0LCBzbyB0aGF0IHRoZSBpbnB1dCBpcyBjbGVhcmVkIGFmdGVyIGEgZmlsZSBpcyBzZWxlY3RlZCxcbiAgICAvLyBiZWNhdXNlIFVwcHkgd2lsbCBiZSBoYW5kbGluZyB0aGUgdXBsb2FkIGFuZCBzbyB3ZSBjYW4gc2VsZWN0IHNhbWUgZmlsZVxuICAgIC8vIGFmdGVyIHJlbW92aW5nIOKAlCBvdGhlcndpc2UgYnJvd3NlciB0aGlua3MgaXTigJlzIGFscmVhZHkgc2VsZWN0ZWRcbiAgICByZXR1cm4gaChcbiAgICAgICdkaXYnLFxuICAgICAgeyAnY2xhc3MnOiAndXBweS1Sb290IHVwcHktRmlsZUlucHV0LWNvbnRhaW5lcicgfSxcbiAgICAgIGgoJ2lucHV0JywgeyAnY2xhc3MnOiAndXBweS1GaWxlSW5wdXQtaW5wdXQnLFxuICAgICAgICBzdHlsZTogdGhpcy5vcHRzLnByZXR0eSAmJiBoaWRkZW5JbnB1dFN0eWxlLFxuICAgICAgICB0eXBlOiAnZmlsZScsXG4gICAgICAgIG5hbWU6IHRoaXMub3B0cy5pbnB1dE5hbWUsXG4gICAgICAgIG9uY2hhbmdlOiB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlLFxuICAgICAgICBtdWx0aXBsZTogcmVzdHJpY3Rpb25zLm1heE51bWJlck9mRmlsZXMgIT09IDEsXG4gICAgICAgIGFjY2VwdDogcmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMsXG4gICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGlucHV0KSB7XG4gICAgICAgICAgX3RoaXMzLmlucHV0ID0gaW5wdXQ7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbHVlOiAnJyB9KSxcbiAgICAgIHRoaXMub3B0cy5wcmV0dHkgJiYgaChcbiAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgIHsgJ2NsYXNzJzogJ3VwcHktRmlsZUlucHV0LWJ0bicsIHR5cGU6ICdidXR0b24nLCBvbmNsaWNrOiB0aGlzLmhhbmRsZUNsaWNrIH0sXG4gICAgICAgIHRoaXMuaTE4bignY2hvb3NlRmlsZXMnKVxuICAgICAgKVxuICAgICk7XG4gIH07XG5cbiAgRmlsZUlucHV0LnByb3RvdHlwZS5pbnN0YWxsID0gZnVuY3Rpb24gaW5zdGFsbCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5vcHRzLnRhcmdldDtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1vdW50KHRhcmdldCwgdGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIEZpbGVJbnB1dC5wcm90b3R5cGUudW5pbnN0YWxsID0gZnVuY3Rpb24gdW5pbnN0YWxsKCkge1xuICAgIHRoaXMudW5tb3VudCgpO1xuICB9O1xuXG4gIHJldHVybiBGaWxlSW5wdXQ7XG59KFBsdWdpbik7IiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgUGx1Z2luID0gcmVxdWlyZSgnQHVwcHkvY29yZS9saWIvUGx1Z2luJyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3ByZWFjdCcpLFxuICAgIGggPSBfcmVxdWlyZS5oO1xuXG4vKipcbiAqIFByb2dyZXNzIGJhclxuICpcbiAqL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKF9QbHVnaW4pIHtcbiAgX2luaGVyaXRzKFByb2dyZXNzQmFyLCBfUGx1Z2luKTtcblxuICBmdW5jdGlvbiBQcm9ncmVzc0Jhcih1cHB5LCBvcHRzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFByb2dyZXNzQmFyKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9QbHVnaW4uY2FsbCh0aGlzLCB1cHB5LCBvcHRzKSk7XG5cbiAgICBfdGhpcy5pZCA9IF90aGlzLm9wdHMuaWQgfHwgJ1Byb2dyZXNzQmFyJztcbiAgICBfdGhpcy50aXRsZSA9ICdQcm9ncmVzcyBCYXInO1xuICAgIF90aGlzLnR5cGUgPSAncHJvZ3Jlc3NpbmRpY2F0b3InO1xuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHRhcmdldDogJ2JvZHknLFxuICAgICAgcmVwbGFjZVRhcmdldENvbnRlbnQ6IGZhbHNlLFxuICAgICAgZml4ZWQ6IGZhbHNlLFxuICAgICAgaGlkZUFmdGVyRmluaXNoOiB0cnVlXG5cbiAgICAgIC8vIG1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgfTtfdGhpcy5vcHRzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKTtcblxuICAgIF90aGlzLnJlbmRlciA9IF90aGlzLnJlbmRlci5iaW5kKF90aGlzKTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBQcm9ncmVzc0Jhci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKHN0YXRlKSB7XG4gICAgdmFyIHByb2dyZXNzID0gc3RhdGUudG90YWxQcm9ncmVzcyB8fCAwO1xuICAgIHZhciBpc0hpZGRlbiA9IHByb2dyZXNzID09PSAxMDAgJiYgdGhpcy5vcHRzLmhpZGVBZnRlckZpbmlzaDtcbiAgICByZXR1cm4gaChcbiAgICAgICdkaXYnLFxuICAgICAgeyAnY2xhc3MnOiAndXBweSB1cHB5LVByb2dyZXNzQmFyJywgc3R5bGU6IHsgcG9zaXRpb246IHRoaXMub3B0cy5maXhlZCA/ICdmaXhlZCcgOiAnaW5pdGlhbCcgfSwgJ2FyaWEtaGlkZGVuJzogaXNIaWRkZW4gfSxcbiAgICAgIGgoJ2RpdicsIHsgJ2NsYXNzJzogJ3VwcHktUHJvZ3Jlc3NCYXItaW5uZXInLCBzdHlsZTogeyB3aWR0aDogcHJvZ3Jlc3MgKyAnJScgfSB9KSxcbiAgICAgIGgoXG4gICAgICAgICdkaXYnLFxuICAgICAgICB7ICdjbGFzcyc6ICd1cHB5LVByb2dyZXNzQmFyLXBlcmNlbnRhZ2UnIH0sXG4gICAgICAgIHByb2dyZXNzXG4gICAgICApXG4gICAgKTtcbiAgfTtcblxuICBQcm9ncmVzc0Jhci5wcm90b3R5cGUuaW5zdGFsbCA9IGZ1bmN0aW9uIGluc3RhbGwoKSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMub3B0cy50YXJnZXQ7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5tb3VudCh0YXJnZXQsIHRoaXMpO1xuICAgIH1cbiAgfTtcblxuICBQcm9ncmVzc0Jhci5wcm90b3R5cGUudW5pbnN0YWxsID0gZnVuY3Rpb24gdW5pbnN0YWxsKCkge1xuICAgIHRoaXMudW5tb3VudCgpO1xuICB9O1xuXG4gIHJldHVybiBQcm9ncmVzc0Jhcjtcbn0oUGx1Z2luKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFJlcXVlc3RDbGllbnQgPSByZXF1aXJlKCcuL1JlcXVlc3RDbGllbnQnKTtcblxudmFyIF9nZXROYW1lID0gZnVuY3Rpb24gX2dldE5hbWUoaWQpIHtcbiAgcmV0dXJuIGlkLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xuICB9KS5qb2luKCcgJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChfUmVxdWVzdENsaWVudCkge1xuICBfaW5oZXJpdHMoUHJvdmlkZXIsIF9SZXF1ZXN0Q2xpZW50KTtcblxuICBmdW5jdGlvbiBQcm92aWRlcih1cHB5LCBvcHRzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFByb3ZpZGVyKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9SZXF1ZXN0Q2xpZW50LmNhbGwodGhpcywgdXBweSwgb3B0cykpO1xuXG4gICAgX3RoaXMucHJvdmlkZXIgPSBvcHRzLnByb3ZpZGVyO1xuICAgIF90aGlzLmlkID0gX3RoaXMucHJvdmlkZXI7XG4gICAgX3RoaXMuYXV0aFByb3ZpZGVyID0gb3B0cy5hdXRoUHJvdmlkZXIgfHwgX3RoaXMucHJvdmlkZXI7XG4gICAgX3RoaXMubmFtZSA9IF90aGlzLm9wdHMubmFtZSB8fCBfZ2V0TmFtZShfdGhpcy5pZCk7XG4gICAgX3RoaXMudG9rZW5LZXkgPSAndXBweS1zZXJ2ZXItJyArIF90aGlzLmlkICsgJy1hdXRoLXRva2VuJztcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICAvLyBAdG9kbyhpLm9sYXJld2FqdSkgY29uc2lkZXIgd2hldGhlciBvciBub3QgdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGV4cG9zZWRcbiAgUHJvdmlkZXIucHJvdG90eXBlLnNldEF1dGhUb2tlbiA9IGZ1bmN0aW9uIHNldEF1dGhUb2tlbih0b2tlbikge1xuICAgIC8vIEB0b2RvKGkub2xhcmV3YWp1KSBhZGQgZmFsbGJhY2sgZm9yIE9PTSBzdG9yYWdlXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy50b2tlbktleSwgdG9rZW4pO1xuICB9O1xuXG4gIFByb3ZpZGVyLnByb3RvdHlwZS5jaGVja0F1dGggPSBmdW5jdGlvbiBjaGVja0F1dGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuaWQgKyAnL2F1dGhvcml6ZWQnKS50aGVuKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICByZXR1cm4gcGF5bG9hZC5hdXRoZW50aWNhdGVkO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb3ZpZGVyLnByb3RvdHlwZS5hdXRoVXJsID0gZnVuY3Rpb24gYXV0aFVybCgpIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0bmFtZSArICcvJyArIHRoaXMuaWQgKyAnL2Nvbm5lY3QnO1xuICB9O1xuXG4gIFByb3ZpZGVyLnByb3RvdHlwZS5maWxlVXJsID0gZnVuY3Rpb24gZmlsZVVybChpZCkge1xuICAgIHJldHVybiB0aGlzLmhvc3RuYW1lICsgJy8nICsgdGhpcy5pZCArICcvZ2V0LycgKyBpZDtcbiAgfTtcblxuICBQcm92aWRlci5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uIGxpc3QoZGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuaWQgKyAnL2xpc3QvJyArIChkaXJlY3RvcnkgfHwgJycpKTtcbiAgfTtcblxuICBQcm92aWRlci5wcm90b3R5cGUubG9nb3V0ID0gZnVuY3Rpb24gbG9nb3V0KCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgdmFyIHJlZGlyZWN0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBsb2NhdGlvbi5ocmVmO1xuXG4gICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMuaWQgKyAnL2xvZ291dD9yZWRpcmVjdD0nICsgcmVkaXJlY3QpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oX3RoaXMyLnRva2VuS2V5KTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH07XG5cbiAgX2NyZWF0ZUNsYXNzKFByb3ZpZGVyLCBbe1xuICAgIGtleTogJ2RlZmF1bHRIZWFkZXJzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfZXh0ZW5kcyh7fSwgX1JlcXVlc3RDbGllbnQucHJvdG90eXBlLmRlZmF1bHRIZWFkZXJzLCB7ICd1cHB5LWF1dGgtdG9rZW4nOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnRva2VuS2V5KSB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUHJvdmlkZXI7XG59KFJlcXVlc3RDbGllbnQpOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gUmVtb3ZlIHRoZSB0cmFpbGluZyBzbGFzaCBzbyB3ZSBjYW4gYWx3YXlzIHNhZmVseSBhcHBlbmQgL3h5ei5cblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gc3RyaXBTbGFzaCh1cmwpIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC8kLywgJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUmVxdWVzdENsaWVudCh1cHB5LCBvcHRzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlcXVlc3RDbGllbnQpO1xuXG4gICAgdGhpcy51cHB5ID0gdXBweTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMub25SZWNlaXZlUmVzcG9uc2UgPSB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlLmJpbmQodGhpcyk7XG4gIH1cblxuICBSZXF1ZXN0Q2xpZW50LnByb3RvdHlwZS5vblJlY2VpdmVSZXNwb25zZSA9IGZ1bmN0aW9uIG9uUmVjZWl2ZVJlc3BvbnNlKHJlc3BvbnNlKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy51cHB5LmdldFN0YXRlKCk7XG4gICAgdmFyIHVwcHlTZXJ2ZXIgPSBzdGF0ZS51cHB5U2VydmVyIHx8IHt9O1xuICAgIHZhciBob3N0ID0gdGhpcy5vcHRzLnNlcnZlclVybDtcbiAgICB2YXIgaGVhZGVycyA9IHJlc3BvbnNlLmhlYWRlcnM7XG4gICAgLy8gU3RvcmUgdGhlIHNlbGYtaWRlbnRpZmllZCBkb21haW4gbmFtZSBmb3IgdGhlIHVwcHktc2VydmVyIHdlIGp1c3QgaGl0LlxuICAgIGlmIChoZWFkZXJzLmhhcygnaS1hbScpICYmIGhlYWRlcnMuZ2V0KCdpLWFtJykgIT09IHVwcHlTZXJ2ZXJbaG9zdF0pIHtcbiAgICAgIHZhciBfZXh0ZW5kczI7XG5cbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIHVwcHlTZXJ2ZXI6IF9leHRlbmRzKHt9LCB1cHB5U2VydmVyLCAoX2V4dGVuZHMyID0ge30sIF9leHRlbmRzMltob3N0XSA9IGhlYWRlcnMuZ2V0KCdpLWFtJyksIF9leHRlbmRzMikpXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9O1xuXG4gIFJlcXVlc3RDbGllbnQucHJvdG90eXBlLl9nZXRVcmwgPSBmdW5jdGlvbiBfZ2V0VXJsKHVybCkge1xuICAgIGlmICgvXihodHRwcz86fClcXC9cXC8vLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaG9zdG5hbWUgKyAnLycgKyB1cmw7XG4gIH07XG5cbiAgUmVxdWVzdENsaWVudC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KHBhdGgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZldGNoKHRoaXMuX2dldFVybChwYXRoKSwge1xuICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgIGhlYWRlcnM6IHRoaXMuZGVmYXVsdEhlYWRlcnNcbiAgICB9KVxuICAgIC8vIEB0b2RvIHZhbGlkYXRlIHJlc3BvbnNlIHN0YXR1cyBiZWZvcmUgY2FsbGluZyBqc29uXG4gICAgLnRoZW4odGhpcy5vblJlY2VpdmVSZXNwb25zZSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICByZXR1cm4gcmVzLmpzb24oKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBnZXQgJyArIF90aGlzLl9nZXRVcmwocGF0aCkgKyAnLiAnICsgZXJyKTtcbiAgICB9KTtcbiAgfTtcblxuICBSZXF1ZXN0Q2xpZW50LnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gcG9zdChwYXRoLCBkYXRhKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICByZXR1cm4gZmV0Y2godGhpcy5fZ2V0VXJsKHBhdGgpLCB7XG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIGhlYWRlcnM6IHRoaXMuZGVmYXVsdEhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKVxuICAgIH0pLnRoZW4odGhpcy5vblJlY2VpdmVSZXNwb25zZSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA8IDIwMCB8fCByZXMuc3RhdHVzID4gMzAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IHBvc3QgJyArIF90aGlzMi5fZ2V0VXJsKHBhdGgpICsgJy4gJyArIHJlcy5zdGF0dXNUZXh0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXMuanNvbigpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IHBvc3QgJyArIF90aGlzMi5fZ2V0VXJsKHBhdGgpICsgJy4gJyArIGVycik7XG4gICAgfSk7XG4gIH07XG5cbiAgUmVxdWVzdENsaWVudC5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gX2RlbGV0ZShwYXRoLCBkYXRhKSB7XG4gICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICByZXR1cm4gZmV0Y2godGhpcy5ob3N0bmFtZSArICcvJyArIHBhdGgsIHtcbiAgICAgIG1ldGhvZDogJ2RlbGV0ZScsXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9LFxuICAgICAgYm9keTogZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogbnVsbFxuICAgIH0pLnRoZW4odGhpcy5vblJlY2VpdmVSZXNwb25zZSlcbiAgICAvLyBAdG9kbyB2YWxpZGF0ZSByZXNwb25zZSBzdGF0dXMgYmVmb3JlIGNhbGxpbmcganNvblxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIHJldHVybiByZXMuanNvbigpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRlbGV0ZSAnICsgX3RoaXMzLl9nZXRVcmwocGF0aCkgKyAnLiAnICsgZXJyKTtcbiAgICB9KTtcbiAgfTtcblxuICBfY3JlYXRlQ2xhc3MoUmVxdWVzdENsaWVudCwgW3tcbiAgICBrZXk6ICdob3N0bmFtZScsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgX3VwcHkkZ2V0U3RhdGUgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKSxcbiAgICAgICAgICB1cHB5U2VydmVyID0gX3VwcHkkZ2V0U3RhdGUudXBweVNlcnZlcjtcblxuICAgICAgdmFyIGhvc3QgPSB0aGlzLm9wdHMuc2VydmVyVXJsO1xuICAgICAgcmV0dXJuIHN0cmlwU2xhc2godXBweVNlcnZlciAmJiB1cHB5U2VydmVyW2hvc3RdID8gdXBweVNlcnZlcltob3N0XSA6IGhvc3QpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2RlZmF1bHRIZWFkZXJzJyxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgIH07XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFJlcXVlc3RDbGllbnQ7XG59KCk7IiwiZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGVlID0gcmVxdWlyZSgnbmFtZXNwYWNlLWVtaXR0ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFVwcHlTb2NrZXQob3B0cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBweVNvY2tldCk7XG5cbiAgICB0aGlzLnF1ZXVlZCA9IFtdO1xuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KG9wdHMudGFyZ2V0KTtcbiAgICB0aGlzLmVtaXR0ZXIgPSBlZSgpO1xuXG4gICAgdGhpcy5zb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIF90aGlzLmlzT3BlbiA9IHRydWU7XG5cbiAgICAgIHdoaWxlIChfdGhpcy5xdWV1ZWQubGVuZ3RoID4gMCAmJiBfdGhpcy5pc09wZW4pIHtcbiAgICAgICAgdmFyIGZpcnN0ID0gX3RoaXMucXVldWVkWzBdO1xuICAgICAgICBfdGhpcy5zZW5kKGZpcnN0LmFjdGlvbiwgZmlyc3QucGF5bG9hZCk7XG4gICAgICAgIF90aGlzLnF1ZXVlZCA9IF90aGlzLnF1ZXVlZC5zbGljZSgxKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBfdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgdGhpcy5faGFuZGxlTWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2UuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2U7XG5cbiAgICB0aGlzLmNsb3NlID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZW1pdCA9IHRoaXMuZW1pdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub24gPSB0aGlzLm9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbmNlID0gdGhpcy5vbmNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZW5kID0gdGhpcy5zZW5kLmJpbmQodGhpcyk7XG4gIH1cblxuICBVcHB5U29ja2V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICB9O1xuXG4gIFVwcHlTb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiBzZW5kKGFjdGlvbiwgcGF5bG9hZCkge1xuICAgIC8vIGF0dGFjaCB1dWlkXG5cbiAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XG4gICAgICB0aGlzLnF1ZXVlZC5wdXNoKHsgYWN0aW9uOiBhY3Rpb24sIHBheWxvYWQ6IHBheWxvYWQgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgIHBheWxvYWQ6IHBheWxvYWRcbiAgICB9KSk7XG4gIH07XG5cbiAgVXBweVNvY2tldC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oYWN0aW9uLCBoYW5kbGVyKTtcbiAgfTtcblxuICBVcHB5U29ja2V0LnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdChhY3Rpb24sIHBheWxvYWQpO1xuICB9O1xuXG4gIFVwcHlTb2NrZXQucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuZW1pdHRlci5vbmNlKGFjdGlvbiwgaGFuZGxlcik7XG4gIH07XG5cbiAgVXBweVNvY2tldC5wcm90b3R5cGUuX2hhbmRsZU1lc3NhZ2UgPSBmdW5jdGlvbiBfaGFuZGxlTWVzc2FnZShlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuYWN0aW9uLCBtZXNzYWdlLnBheWxvYWQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFVwcHlTb2NrZXQ7XG59KCk7IiwiJ3VzZS1zdHJpY3QnO1xuLyoqXG4gKiBNYW5hZ2VzIGNvbW11bmljYXRpb25zIHdpdGggVXBweSBTZXJ2ZXJcbiAqL1xuXG52YXIgUmVxdWVzdENsaWVudCA9IHJlcXVpcmUoJy4vUmVxdWVzdENsaWVudCcpO1xudmFyIFByb3ZpZGVyID0gcmVxdWlyZSgnLi9Qcm92aWRlcicpO1xudmFyIFNvY2tldCA9IHJlcXVpcmUoJy4vU29ja2V0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZXF1ZXN0Q2xpZW50OiBSZXF1ZXN0Q2xpZW50LFxuICBQcm92aWRlcjogUHJvdmlkZXIsXG4gIFNvY2tldDogU29ja2V0XG59OyIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qKlxuICogRGVmYXVsdCBzdG9yZSB0aGF0IGtlZXBzIHN0YXRlIGluIGEgc2ltcGxlIG9iamVjdC5cbiAqL1xudmFyIERlZmF1bHRTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRGVmYXVsdFN0b3JlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEZWZhdWx0U3RvcmUpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gIH1cblxuICBEZWZhdWx0U3RvcmUucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH07XG5cbiAgRGVmYXVsdFN0b3JlLnByb3RvdHlwZS5zZXRTdGF0ZSA9IGZ1bmN0aW9uIHNldFN0YXRlKHBhdGNoKSB7XG4gICAgdmFyIHByZXZTdGF0ZSA9IF9leHRlbmRzKHt9LCB0aGlzLnN0YXRlKTtcbiAgICB2YXIgbmV4dFN0YXRlID0gX2V4dGVuZHMoe30sIHRoaXMuc3RhdGUsIHBhdGNoKTtcblxuICAgIHRoaXMuc3RhdGUgPSBuZXh0U3RhdGU7XG4gICAgdGhpcy5fcHVibGlzaChwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcGF0Y2gpO1xuICB9O1xuXG4gIERlZmF1bHRTdG9yZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuY2FsbGJhY2tzLnB1c2gobGlzdGVuZXIpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBSZW1vdmUgdGhlIGxpc3RlbmVyLlxuICAgICAgX3RoaXMuY2FsbGJhY2tzLnNwbGljZShfdGhpcy5jYWxsYmFja3MuaW5kZXhPZihsaXN0ZW5lciksIDEpO1xuICAgIH07XG4gIH07XG5cbiAgRGVmYXVsdFN0b3JlLnByb3RvdHlwZS5fcHVibGlzaCA9IGZ1bmN0aW9uIF9wdWJsaXNoKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICBsaXN0ZW5lci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBEZWZhdWx0U3RvcmU7XG59KCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdFN0b3JlKCkge1xuICByZXR1cm4gbmV3IERlZmF1bHRTdG9yZSgpO1xufTsiLCJ2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKipcbiAqIFRyYW5zbGF0ZXMgc3RyaW5ncyB3aXRoIGludGVycG9sYXRpb24gJiBwbHVyYWxpemF0aW9uIHN1cHBvcnQuXG4gKiBFeHRlbnNpYmxlIHdpdGggY3VzdG9tIGRpY3Rpb25hcmllcyBhbmQgcGx1cmFsaXphdGlvbiBmdW5jdGlvbnMuXG4gKlxuICogQm9ycm93cyBoZWF2aWx5IGZyb20gYW5kIGluc3BpcmVkIGJ5IFBvbHlnbG90IGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMsXG4gKiBiYXNpY2FsbHkgYSBzdHJpcHBlZC1kb3duIHZlcnNpb24gb2YgaXQuIERpZmZlcmVuY2VzOiBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucyBhcmUgbm90IGhhcmRjb2RlZFxuICogYW5kIGNhbiBiZSBlYXNpbHkgYWRkZWQgYW1vbmcgd2l0aCBkaWN0aW9uYXJpZXMsIG5lc3RlZCBvYmplY3RzIGFyZSB1c2VkIGZvciBwbHVyYWxpemF0aW9uXG4gKiBhcyBvcHBvc2VkIHRvIGB8fHx8YCBkZWxpbWV0ZXJcbiAqXG4gKiBVc2FnZSBleGFtcGxlOiBgdHJhbnNsYXRvci50cmFuc2xhdGUoJ2ZpbGVzX2Nob3NlbicsIHtzbWFydF9jb3VudDogM30pYFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBUcmFuc2xhdG9yKG9wdHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVHJhbnNsYXRvcik7XG5cbiAgICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBsb2NhbGU6IHtcbiAgICAgICAgc3RyaW5nczoge30sXG4gICAgICAgIHBsdXJhbGl6ZTogZnVuY3Rpb24gcGx1cmFsaXplKG4pIHtcbiAgICAgICAgICBpZiAobiA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMub3B0cyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cyk7XG4gICAgdGhpcy5sb2NhbGUgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdE9wdGlvbnMubG9jYWxlLCBvcHRzLmxvY2FsZSk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBzdHJpbmcgd2l0aCBwbGFjZWhvbGRlciB2YXJpYWJsZXMgbGlrZSBgJXtzbWFydF9jb3VudH0gZmlsZSBzZWxlY3RlZGBcbiAgICogYW5kIHJlcGxhY2VzIGl0IHdpdGggdmFsdWVzIGZyb20gb3B0aW9ucyBge3NtYXJ0X2NvdW50OiA1fWBcbiAgICpcbiAgICogQGxpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcy9ibG9iL21hc3Rlci9MSUNFTlNFXG4gICAqIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcy9ibG9iL21hc3Rlci9saWIvcG9seWdsb3QuanMjTDI5OVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlIHRoYXQgbmVlZHMgaW50ZXJwb2xhdGlvbiwgd2l0aCBwbGFjZWhvbGRlcnNcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnNcbiAgICogQHJldHVybiB7c3RyaW5nfSBpbnRlcnBvbGF0ZWRcbiAgICovXG5cblxuICBUcmFuc2xhdG9yLnByb3RvdHlwZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uIGludGVycG9sYXRlKHBocmFzZSwgb3B0aW9ucykge1xuICAgIHZhciBfU3RyaW5nJHByb3RvdHlwZSA9IFN0cmluZy5wcm90b3R5cGUsXG4gICAgICAgIHNwbGl0ID0gX1N0cmluZyRwcm90b3R5cGUuc3BsaXQsXG4gICAgICAgIHJlcGxhY2UgPSBfU3RyaW5nJHByb3RvdHlwZS5yZXBsYWNlO1xuXG4gICAgdmFyIGRvbGxhclJlZ2V4ID0gL1xcJC9nO1xuICAgIHZhciBkb2xsYXJCaWxsc1lhbGwgPSAnJCQkJCc7XG4gICAgdmFyIGludGVycG9sYXRlZCA9IFtwaHJhc2VdO1xuXG4gICAgZm9yICh2YXIgYXJnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChhcmcgIT09ICdfJyAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KGFyZykpIHtcbiAgICAgICAgLy8gRW5zdXJlIHJlcGxhY2VtZW50IHZhbHVlIGlzIGVzY2FwZWQgdG8gcHJldmVudCBzcGVjaWFsICQtcHJlZml4ZWRcbiAgICAgICAgLy8gcmVnZXggcmVwbGFjZSB0b2tlbnMuIHRoZSBcIiQkJCRcIiBpcyBuZWVkZWQgYmVjYXVzZSBlYWNoIFwiJFwiIG5lZWRzIHRvXG4gICAgICAgIC8vIGJlIGVzY2FwZWQgd2l0aCBcIiRcIiBpdHNlbGYsIGFuZCB3ZSBuZWVkIHR3byBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dC5cbiAgICAgICAgdmFyIHJlcGxhY2VtZW50ID0gb3B0aW9uc1thcmddO1xuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJlcGxhY2VtZW50ID0gcmVwbGFjZS5jYWxsKG9wdGlvbnNbYXJnXSwgZG9sbGFyUmVnZXgsIGRvbGxhckJpbGxzWWFsbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgY3JlYXRlIGEgbmV3IGBSZWdFeHBgIGVhY2ggdGltZSBpbnN0ZWFkIG9mIHVzaW5nIGEgbW9yZS1lZmZpY2llbnRcbiAgICAgICAgLy8gc3RyaW5nIHJlcGxhY2Ugc28gdGhhdCB0aGUgc2FtZSBhcmd1bWVudCBjYW4gYmUgcmVwbGFjZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgLy8gaW4gdGhlIHNhbWUgcGhyYXNlLlxuICAgICAgICBpbnRlcnBvbGF0ZWQgPSBpbnNlcnRSZXBsYWNlbWVudChpbnRlcnBvbGF0ZWQsIG5ldyBSZWdFeHAoJyVcXFxceycgKyBhcmcgKyAnXFxcXH0nLCAnZycpLCByZXBsYWNlbWVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGludGVycG9sYXRlZDtcblxuICAgIGZ1bmN0aW9uIGluc2VydFJlcGxhY2VtZW50KHNvdXJjZSwgcngsIHJlcGxhY2VtZW50KSB7XG4gICAgICB2YXIgbmV3UGFydHMgPSBbXTtcbiAgICAgIHNvdXJjZS5mb3JFYWNoKGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgICBzcGxpdC5jYWxsKGNodW5rLCByeCkuZm9yRWFjaChmdW5jdGlvbiAocmF3LCBpLCBsaXN0KSB7XG4gICAgICAgICAgaWYgKHJhdyAhPT0gJycpIHtcbiAgICAgICAgICAgIG5ld1BhcnRzLnB1c2gocmF3KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJbnRlcmxhY2Ugd2l0aCB0aGUgYHJlcGxhY2VtZW50YCB2YWx1ZVxuICAgICAgICAgIGlmIChpIDwgbGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBuZXdQYXJ0cy5wdXNoKHJlcGxhY2VtZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3UGFydHM7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBQdWJsaWMgdHJhbnNsYXRlIG1ldGhvZFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIGxhdGVyIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIHN0cmluZ1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRyYW5zbGF0ZWQgKGFuZCBpbnRlcnBvbGF0ZWQpXG4gICAqL1xuXG5cbiAgVHJhbnNsYXRvci5wcm90b3R5cGUudHJhbnNsYXRlID0gZnVuY3Rpb24gdHJhbnNsYXRlKGtleSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZUFycmF5KGtleSwgb3B0aW9ucykuam9pbignJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldCBhIHRyYW5zbGF0aW9uIGFuZCByZXR1cm4gdGhlIHRyYW5zbGF0ZWQgYW5kIGludGVycG9sYXRlZCBwYXJ0cyBhcyBhbiBhcnJheS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVyc1xuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIHRyYW5zbGF0ZWQgYW5kIGludGVycG9sYXRlZCBwYXJ0cywgaW4gb3JkZXIuXG4gICAqL1xuXG5cbiAgVHJhbnNsYXRvci5wcm90b3R5cGUudHJhbnNsYXRlQXJyYXkgPSBmdW5jdGlvbiB0cmFuc2xhdGVBcnJheShrZXksIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5zbWFydF9jb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBwbHVyYWwgPSB0aGlzLmxvY2FsZS5wbHVyYWxpemUob3B0aW9ucy5zbWFydF9jb3VudCk7XG4gICAgICByZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZSh0aGlzLm9wdHMubG9jYWxlLnN0cmluZ3Nba2V5XVtwbHVyYWxdLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZSh0aGlzLm9wdHMubG9jYWxlLnN0cmluZ3Nba2V5XSwgb3B0aW9ucyk7XG4gIH07XG5cbiAgcmV0dXJuIFRyYW5zbGF0b3I7XG59KCk7IiwidmFyIHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJyk7XG5cbmZ1bmN0aW9uIF9lbWl0U29ja2V0UHJvZ3Jlc3ModXBsb2FkZXIsIHByb2dyZXNzRGF0YSwgZmlsZSkge1xuICB2YXIgcHJvZ3Jlc3MgPSBwcm9ncmVzc0RhdGEucHJvZ3Jlc3MsXG4gICAgICBieXRlc1VwbG9hZGVkID0gcHJvZ3Jlc3NEYXRhLmJ5dGVzVXBsb2FkZWQsXG4gICAgICBieXRlc1RvdGFsID0gcHJvZ3Jlc3NEYXRhLmJ5dGVzVG90YWw7XG5cbiAgaWYgKHByb2dyZXNzKSB7XG4gICAgdXBsb2FkZXIudXBweS5sb2coJ1VwbG9hZCBwcm9ncmVzczogJyArIHByb2dyZXNzKTtcbiAgICB1cGxvYWRlci51cHB5LmVtaXQoJ3VwbG9hZC1wcm9ncmVzcycsIGZpbGUsIHtcbiAgICAgIHVwbG9hZGVyOiB1cGxvYWRlcixcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IGJ5dGVzVXBsb2FkZWQsXG4gICAgICBieXRlc1RvdGFsOiBieXRlc1RvdGFsXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZShfZW1pdFNvY2tldFByb2dyZXNzLCAzMDAsIHsgbGVhZGluZzogdHJ1ZSwgdHJhaWxpbmc6IHRydWUgfSk7IiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG52YXIgaXNET01FbGVtZW50ID0gcmVxdWlyZSgnLi9pc0RPTUVsZW1lbnQnKTtcblxuLyoqXG4gKiBGaW5kIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfHN0cmluZ30gZWxlbWVudFxuICogQHJldHVybiB7Tm9kZXxudWxsfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmRET01FbGVtZW50KGVsZW1lbnQpIHtcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpO1xuICB9XG5cbiAgaWYgKCh0eXBlb2YgZWxlbWVudCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZWxlbWVudCkpID09PSAnb2JqZWN0JyAmJiBpc0RPTUVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxufTsiLCIvKipcbiAqIFRha2VzIGEgZmlsZSBvYmplY3QgYW5kIHR1cm5zIGl0IGludG8gZmlsZUlELCBieSBjb252ZXJ0aW5nIGZpbGUubmFtZSB0byBsb3dlcmNhc2UsXG4gKiByZW1vdmluZyBleHRyYSBjaGFyYWN0ZXJzIGFuZCBhZGRpbmcgdHlwZSwgc2l6ZSBhbmQgbGFzdE1vZGlmaWVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGZpbGVcbiAqIEByZXR1cm4ge1N0cmluZ30gdGhlIGZpbGVJRFxuICpcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZW5lcmF0ZUZpbGVJRChmaWxlKSB7XG4gIC8vIGZpbHRlciBpcyBuZWVkZWQgdG8gbm90IGpvaW4gZW1wdHkgdmFsdWVzIHdpdGggYC1gXG4gIHJldHVybiBbJ3VwcHknLCBmaWxlLm5hbWUgPyBmaWxlLm5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXkEtWjAtOV0vaWcsICcnKSA6ICcnLCBmaWxlLnR5cGUsIGZpbGUuZGF0YS5zaXplLCBmaWxlLmRhdGEubGFzdE1vZGlmaWVkXS5maWx0ZXIoZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiB2YWw7XG4gIH0pLmpvaW4oJy0nKTtcbn07IiwiLyoqXG4qIFRha2VzIGEgZnVsbCBmaWxlbmFtZSBzdHJpbmcgYW5kIHJldHVybnMgYW4gb2JqZWN0IHtuYW1lLCBleHRlbnNpb259XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBmdWxsRmlsZU5hbWVcbiogQHJldHVybiB7b2JqZWN0fSB7bmFtZSwgZXh0ZW5zaW9ufVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24oZnVsbEZpbGVOYW1lKSB7XG4gIHZhciByZSA9IC8oPzpcXC4oW14uXSspKT8kLztcbiAgdmFyIGZpbGVFeHQgPSByZS5leGVjKGZ1bGxGaWxlTmFtZSlbMV07XG4gIHZhciBmaWxlTmFtZSA9IGZ1bGxGaWxlTmFtZS5yZXBsYWNlKCcuJyArIGZpbGVFeHQsICcnKTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBmaWxlTmFtZSxcbiAgICBleHRlbnNpb246IGZpbGVFeHRcbiAgfTtcbn07IiwidmFyIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uID0gcmVxdWlyZSgnLi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbicpO1xudmFyIG1pbWVUeXBlcyA9IHJlcXVpcmUoJy4vbWltZVR5cGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmlsZVR5cGUoZmlsZSkge1xuICB2YXIgZmlsZUV4dGVuc2lvbiA9IGZpbGUubmFtZSA/IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uKGZpbGUubmFtZSkuZXh0ZW5zaW9uIDogbnVsbDtcblxuICBpZiAoZmlsZS5pc1JlbW90ZSkge1xuICAgIC8vIHNvbWUgcmVtb3RlIHByb3ZpZGVycyBkbyBub3Qgc3VwcG9ydCBmaWxlIHR5cGVzXG4gICAgcmV0dXJuIGZpbGUudHlwZSA/IGZpbGUudHlwZSA6IG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXTtcbiAgfVxuXG4gIC8vIGNoZWNrIGlmIG1pbWUgdHlwZSBpcyBzZXQgaW4gdGhlIGZpbGUgb2JqZWN0XG4gIGlmIChmaWxlLnR5cGUpIHtcbiAgICByZXR1cm4gZmlsZS50eXBlO1xuICB9XG5cbiAgLy8gc2VlIGlmIHdlIGNhbiBtYXAgZXh0ZW5zaW9uIHRvIGEgbWltZSB0eXBlXG4gIGlmIChmaWxlRXh0ZW5zaW9uICYmIG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXSkge1xuICAgIHJldHVybiBtaW1lVHlwZXNbZmlsZUV4dGVuc2lvbl07XG4gIH1cblxuICAvLyBpZiBhbGwgZmFpbHMsIHdlbGwsIHJldHVybiBlbXB0eVxuICByZXR1cm4gbnVsbDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRTb2NrZXRIb3N0KHVybCkge1xuICAvLyBnZXQgdGhlIGhvc3QgZG9tYWluXG4gIHZhciByZWdleCA9IC9eKD86aHR0cHM/OlxcL1xcL3xcXC9cXC8pPyg/OlteQFxcbl0rQCk/KD86d3d3XFwuKT8oW15cXG5dKykvO1xuICB2YXIgaG9zdCA9IHJlZ2V4LmV4ZWModXJsKVsxXTtcbiAgdmFyIHNvY2tldFByb3RvY29sID0gbG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonID8gJ3dzcycgOiAnd3MnO1xuXG4gIHJldHVybiBzb2NrZXRQcm90b2NvbCArICc6Ly8nICsgaG9zdDtcbn07IiwiLyoqXG4gKiBSZXR1cm5zIGEgdGltZXN0YW1wIGluIHRoZSBmb3JtYXQgb2YgYGhvdXJzOm1pbnV0ZXM6c2Vjb25kc2BcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFRpbWVTdGFtcCgpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICB2YXIgaG91cnMgPSBwYWQoZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCkpO1xuICB2YXIgbWludXRlcyA9IHBhZChkYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpKTtcbiAgdmFyIHNlY29uZHMgPSBwYWQoZGF0ZS5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKSk7XG4gIHJldHVybiBob3VycyArICc6JyArIG1pbnV0ZXMgKyAnOicgKyBzZWNvbmRzO1xufTtcblxuLyoqXG4gKiBBZGRzIHplcm8gdG8gc3RyaW5ncyBzaG9ydGVyIHRoYW4gdHdvIGNoYXJhY3RlcnNcbiovXG5mdW5jdGlvbiBwYWQoc3RyKSB7XG4gIHJldHVybiBzdHIubGVuZ3RoICE9PSAyID8gMCArIHN0ciA6IHN0cjtcbn0iLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gb2JqZWN0IGlzIGEgRE9NIGVsZW1lbnQuIER1Y2stdHlwaW5nIGJhc2VkIG9uIGBub2RlVHlwZWAuXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0RPTUVsZW1lbnQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG9iaikpID09PSAnb2JqZWN0JyAmJiBvYmoubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xufTsiLCIvKipcbiAqIENoZWNrIGlmIGEgVVJMIHN0cmluZyBpcyBhbiBvYmplY3QgVVJMIGZyb20gYFVSTC5jcmVhdGVPYmplY3RVUkxgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNPYmplY3RVUkwodXJsKSB7XG4gIHJldHVybiB1cmwuaW5kZXhPZignYmxvYjonKSA9PT0gMDtcbn07IiwiLyoqXG4gKiBMaW1pdCB0aGUgYW1vdW50IG9mIHNpbXVsdGFuZW91c2x5IHBlbmRpbmcgUHJvbWlzZXMuXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBwYXNzZWQgYSBmdW5jdGlvbiBgZm5gLFxuICogd2lsbCBtYWtlIHN1cmUgdGhhdCBhdCBtb3N0IGBsaW1pdGAgY2FsbHMgdG8gYGZuYCBhcmUgcGVuZGluZy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbGltaXRcbiAqIEByZXR1cm4ge2Z1bmN0aW9uKCl9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGltaXRQcm9taXNlcyhsaW1pdCkge1xuICB2YXIgcGVuZGluZyA9IDA7XG4gIHZhciBxdWV1ZSA9IFtdO1xuICByZXR1cm4gZnVuY3Rpb24gKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxsID0gZnVuY3Rpb24gY2FsbCgpIHtcbiAgICAgICAgcGVuZGluZysrO1xuICAgICAgICB2YXIgcHJvbWlzZSA9IGZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICAgIHByb21pc2UudGhlbihvbmZpbmlzaCwgb25maW5pc2gpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIGlmIChwZW5kaW5nID49IGxpbWl0KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgcXVldWUucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsKCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYWxsKCk7XG4gICAgfTtcbiAgfTtcbiAgZnVuY3Rpb24gb25maW5pc2goKSB7XG4gICAgcGVuZGluZy0tO1xuICAgIHZhciBuZXh0ID0gcXVldWUuc2hpZnQoKTtcbiAgICBpZiAobmV4dCkgbmV4dCgpO1xuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnbWQnOiAndGV4dC9tYXJrZG93bicsXG4gICdtYXJrZG93bic6ICd0ZXh0L21hcmtkb3duJyxcbiAgJ21wNCc6ICd2aWRlby9tcDQnLFxuICAnbXAzJzogJ2F1ZGlvL21wMycsXG4gICdzdmcnOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICdqcGcnOiAnaW1hZ2UvanBlZycsXG4gICdwbmcnOiAnaW1hZ2UvcG5nJyxcbiAgJ2dpZic6ICdpbWFnZS9naWYnLFxuICAneWFtbCc6ICd0ZXh0L3lhbWwnLFxuICAneW1sJzogJ3RleHQveWFtbCcsXG4gICdjc3YnOiAndGV4dC9jc3YnLFxuICAnYXZpJzogJ3ZpZGVvL3gtbXN2aWRlbycsXG4gICdta3MnOiAndmlkZW8veC1tYXRyb3NrYScsXG4gICdta3YnOiAndmlkZW8veC1tYXRyb3NrYScsXG4gICdtb3YnOiAndmlkZW8vcXVpY2t0aW1lJyxcbiAgJ2RvYyc6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLFxuICAnZG9jbSc6ICdhcHBsaWNhdGlvbi92bmQubXMtd29yZC5kb2N1bWVudC5tYWNyb2VuYWJsZWQuMTInLFxuICAnZG9jeCc6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudCcsXG4gICdkb3QnOiAnYXBwbGljYXRpb24vbXN3b3JkJyxcbiAgJ2RvdG0nOiAnYXBwbGljYXRpb24vdm5kLm1zLXdvcmQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyJyxcbiAgJ2RvdHgnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwudGVtcGxhdGUnLFxuICAneGxhJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gICd4bGFtJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTInLFxuICAneGxjJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gICd4bGYnOiAnYXBwbGljYXRpb24veC14bGlmZit4bWwnLFxuICAneGxtJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gICd4bHMnOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgJ3hsc2InOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0LmJpbmFyeS5tYWNyb2VuYWJsZWQuMTInLFxuICAneGxzbSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQubWFjcm9lbmFibGVkLjEyJyxcbiAgJ3hsc3gnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnLFxuICAneGx0JzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gICd4bHRtJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTInLFxuICAneGx0eCc6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC50ZW1wbGF0ZScsXG4gICd4bHcnOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJ1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShwcm9taXNlcykge1xuICB2YXIgcmVzb2x1dGlvbnMgPSBbXTtcbiAgdmFyIHJlamVjdGlvbnMgPSBbXTtcbiAgZnVuY3Rpb24gcmVzb2x2ZWQodmFsdWUpIHtcbiAgICByZXNvbHV0aW9ucy5wdXNoKHZhbHVlKTtcbiAgfVxuICBmdW5jdGlvbiByZWplY3RlZChlcnJvcikge1xuICAgIHJlamVjdGlvbnMucHVzaChlcnJvcik7XG4gIH1cblxuICB2YXIgd2FpdCA9IFByb21pc2UuYWxsKHByb21pc2VzLm1hcChmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVzb2x2ZWQsIHJlamVjdGVkKTtcbiAgfSkpO1xuXG4gIHJldHVybiB3YWl0LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzZnVsOiByZXNvbHV0aW9ucyxcbiAgICAgIGZhaWxlZDogcmVqZWN0aW9uc1xuICAgIH07XG4gIH0pO1xufTsiLCIvKipcbiAqIENvbnZlcnRzIGxpc3QgaW50byBhcnJheVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9BcnJheShsaXN0KSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0IHx8IFtdLCAwKTtcbn07IiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgUGx1Z2luID0gcmVxdWlyZSgnQHVwcHkvY29yZS9saWIvUGx1Z2luJyk7XG52YXIgY3VpZCA9IHJlcXVpcmUoJ2N1aWQnKTtcbnZhciBUcmFuc2xhdG9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1RyYW5zbGF0b3InKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnQHVwcHkvc2VydmVyLXV0aWxzJyksXG4gICAgUHJvdmlkZXIgPSBfcmVxdWlyZS5Qcm92aWRlcixcbiAgICBTb2NrZXQgPSBfcmVxdWlyZS5Tb2NrZXQ7XG5cbnZhciBlbWl0U29ja2V0UHJvZ3Jlc3MgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZW1pdFNvY2tldFByb2dyZXNzJyk7XG52YXIgZ2V0U29ja2V0SG9zdCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRTb2NrZXRIb3N0Jyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3NldHRsZScpO1xudmFyIGxpbWl0UHJvbWlzZXMgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvbGltaXRQcm9taXNlcycpO1xuXG5mdW5jdGlvbiBidWlsZFJlc3BvbnNlRXJyb3IoeGhyLCBlcnJvcikge1xuICAvLyBObyBlcnJvciBtZXNzYWdlXG4gIGlmICghZXJyb3IpIGVycm9yID0gbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKTtcbiAgLy8gR290IGFuIGVycm9yIG1lc3NhZ2Ugc3RyaW5nXG4gIGlmICh0eXBlb2YgZXJyb3IgPT09ICdzdHJpbmcnKSBlcnJvciA9IG5ldyBFcnJvcihlcnJvcik7XG4gIC8vIEdvdCBzb21ldGhpbmcgZWxzZVxuICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgIGVycm9yID0gX2V4dGVuZHMobmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKSwgeyBkYXRhOiBlcnJvciB9KTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSB4aHI7XG4gIHJldHVybiBlcnJvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoX1BsdWdpbikge1xuICBfaW5oZXJpdHMoWEhSVXBsb2FkLCBfUGx1Z2luKTtcblxuICBmdW5jdGlvbiBYSFJVcGxvYWQodXBweSwgb3B0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBYSFJVcGxvYWQpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX1BsdWdpbi5jYWxsKHRoaXMsIHVwcHksIG9wdHMpKTtcblxuICAgIF90aGlzLnR5cGUgPSAndXBsb2FkZXInO1xuICAgIF90aGlzLmlkID0gJ1hIUlVwbG9hZCc7XG4gICAgX3RoaXMudGl0bGUgPSAnWEhSVXBsb2FkJztcblxuICAgIHZhciBkZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICB0aW1lZE91dDogJ1VwbG9hZCBzdGFsbGVkIGZvciAle3NlY29uZHN9IHNlY29uZHMsIGFib3J0aW5nLidcbiAgICAgIH1cblxuICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgfTt2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBmb3JtRGF0YTogdHJ1ZSxcbiAgICAgIGZpZWxkTmFtZTogJ2ZpbGVzW10nLFxuICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICBtZXRhRmllbGRzOiBudWxsLFxuICAgICAgcmVzcG9uc2VVcmxGaWVsZE5hbWU6ICd1cmwnLFxuICAgICAgYnVuZGxlOiBmYWxzZSxcbiAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgbG9jYWxlOiBkZWZhdWx0TG9jYWxlLFxuICAgICAgdGltZW91dDogMzAgKiAxMDAwLFxuICAgICAgbGltaXQ6IDAsXG4gICAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZWRlZiByZXNwT2JqXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gcmVzcG9uc2VUZXh0XG4gICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gc3RhdHVzXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdHVzVGV4dFxuICAgICAgICogQHByb3BlcnR5IHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn0gaGVhZGVyc1xuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXNwb25zZVRleHQgdGhlIHJlc3BvbnNlIGJvZHkgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0IHwgcmVzcE9ian0gcmVzcG9uc2UgdGhlIHJlc3BvbnNlIG9iamVjdCAoWEhSIG9yIHNpbWlsYXIpXG4gICAgICAgKi9cbiAgICAgIGdldFJlc3BvbnNlRGF0YTogZnVuY3Rpb24gZ2V0UmVzcG9uc2VEYXRhKHJlc3BvbnNlVGV4dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgdmFyIHBhcnNlZFJlc3BvbnNlID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGFyc2VkUmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VkUmVzcG9uc2U7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcG9uc2VUZXh0IHRoZSByZXNwb25zZSBib2R5IHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdCB8IHJlc3BPYmp9IHJlc3BvbnNlIHRoZSByZXNwb25zZSBvYmplY3QgKFhIUiBvciBzaW1pbGFyKVxuICAgICAgICovXG4gICAgICBnZXRSZXNwb25zZUVycm9yOiBmdW5jdGlvbiBnZXRSZXNwb25zZUVycm9yKHJlc3BvbnNlVGV4dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignVXBsb2FkIGVycm9yJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIE1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgX3RoaXMub3B0cyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cyk7XG4gICAgX3RoaXMubG9jYWxlID0gX2V4dGVuZHMoe30sIGRlZmF1bHRMb2NhbGUsIF90aGlzLm9wdHMubG9jYWxlKTtcbiAgICBfdGhpcy5sb2NhbGUuc3RyaW5ncyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0TG9jYWxlLnN0cmluZ3MsIF90aGlzLm9wdHMubG9jYWxlLnN0cmluZ3MpO1xuXG4gICAgLy8gaTE4blxuICAgIF90aGlzLnRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcih7IGxvY2FsZTogX3RoaXMubG9jYWxlIH0pO1xuICAgIF90aGlzLmkxOG4gPSBfdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZS5iaW5kKF90aGlzLnRyYW5zbGF0b3IpO1xuXG4gICAgX3RoaXMuaGFuZGxlVXBsb2FkID0gX3RoaXMuaGFuZGxlVXBsb2FkLmJpbmQoX3RoaXMpO1xuXG4gICAgLy8gU2ltdWx0YW5lb3VzIHVwbG9hZCBsaW1pdGluZyBpcyBzaGFyZWQgYWNyb3NzIGFsbCB1cGxvYWRzIHdpdGggdGhpcyBwbHVnaW4uXG4gICAgaWYgKHR5cGVvZiBfdGhpcy5vcHRzLmxpbWl0ID09PSAnbnVtYmVyJyAmJiBfdGhpcy5vcHRzLmxpbWl0ICE9PSAwKSB7XG4gICAgICBfdGhpcy5saW1pdFVwbG9hZHMgPSBsaW1pdFByb21pc2VzKF90aGlzLm9wdHMubGltaXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfdGhpcy5saW1pdFVwbG9hZHMgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoX3RoaXMub3B0cy5idW5kbGUgJiYgIV90aGlzLm9wdHMuZm9ybURhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYG9wdHMuZm9ybURhdGFgIG11c3QgYmUgdHJ1ZSB3aGVuIGBvcHRzLmJ1bmRsZWAgaXMgZW5hYmxlZC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgWEhSVXBsb2FkLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucyhmaWxlKSB7XG4gICAgdmFyIG92ZXJyaWRlcyA9IHRoaXMudXBweS5nZXRTdGF0ZSgpLnhoclVwbG9hZDtcbiAgICB2YXIgb3B0cyA9IF9leHRlbmRzKHt9LCB0aGlzLm9wdHMsIG92ZXJyaWRlcyB8fCB7fSwgZmlsZS54aHJVcGxvYWQgfHwge30pO1xuICAgIG9wdHMuaGVhZGVycyA9IHt9O1xuICAgIF9leHRlbmRzKG9wdHMuaGVhZGVycywgdGhpcy5vcHRzLmhlYWRlcnMpO1xuICAgIGlmIChvdmVycmlkZXMpIHtcbiAgICAgIF9leHRlbmRzKG9wdHMuaGVhZGVycywgb3ZlcnJpZGVzLmhlYWRlcnMpO1xuICAgIH1cbiAgICBpZiAoZmlsZS54aHJVcGxvYWQpIHtcbiAgICAgIF9leHRlbmRzKG9wdHMuaGVhZGVycywgZmlsZS54aHJVcGxvYWQuaGVhZGVycyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdHM7XG4gIH07XG5cbiAgLy8gSGVscGVyIHRvIGFib3J0IHVwbG9hZCByZXF1ZXN0cyBpZiB0aGVyZSBoYXMgbm90IGJlZW4gYW55IHByb2dyZXNzIGZvciBgdGltZW91dGAgbXMuXG4gIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSB1c2luZyBgdGltZXIgPSBjcmVhdGVQcm9ncmVzc1RpbWVvdXQoMTAwMDAsIG9uVGltZW91dClgXG4gIC8vIENhbGwgYHRpbWVyLnByb2dyZXNzKClgIHRvIHNpZ25hbCB0aGF0IHRoZXJlIGhhcyBiZWVuIHByb2dyZXNzIG9mIGFueSBraW5kLlxuICAvLyBDYWxsIGB0aW1lci5kb25lKClgIHdoZW4gdGhlIHVwbG9hZCBoYXMgY29tcGxldGVkLlxuXG5cbiAgWEhSVXBsb2FkLnByb3RvdHlwZS5jcmVhdGVQcm9ncmVzc1RpbWVvdXQgPSBmdW5jdGlvbiBjcmVhdGVQcm9ncmVzc1RpbWVvdXQodGltZW91dCwgdGltZW91dEhhbmRsZXIpIHtcbiAgICB2YXIgdXBweSA9IHRoaXMudXBweTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGlzRG9uZSA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gb25UaW1lZE91dCgpIHtcbiAgICAgIHVwcHkubG9nKCdbWEhSVXBsb2FkXSB0aW1lZCBvdXQnKTtcbiAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihzZWxmLmkxOG4oJ3RpbWVkT3V0JywgeyBzZWNvbmRzOiBNYXRoLmNlaWwodGltZW91dCAvIDEwMDApIH0pKTtcbiAgICAgIHRpbWVvdXRIYW5kbGVyKGVycm9yKTtcbiAgICB9XG5cbiAgICB2YXIgYWxpdmVUaW1lciA9IG51bGw7XG4gICAgZnVuY3Rpb24gcHJvZ3Jlc3MoKSB7XG4gICAgICAvLyBTb21lIGJyb3dzZXJzIGZpcmUgYW5vdGhlciBwcm9ncmVzcyBldmVudCB3aGVuIHRoZSB1cGxvYWQgaXNcbiAgICAgIC8vIGNhbmNlbGxlZCwgc28gd2UgaGF2ZSB0byBpZ25vcmUgcHJvZ3Jlc3MgYWZ0ZXIgdGhlIHRpbWVyIHdhc1xuICAgICAgLy8gdG9sZCB0byBzdG9wLlxuICAgICAgaWYgKGlzRG9uZSkgcmV0dXJuO1xuXG4gICAgICBpZiAodGltZW91dCA+IDApIHtcbiAgICAgICAgaWYgKGFsaXZlVGltZXIpIGNsZWFyVGltZW91dChhbGl2ZVRpbWVyKTtcbiAgICAgICAgYWxpdmVUaW1lciA9IHNldFRpbWVvdXQob25UaW1lZE91dCwgdGltZW91dCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgIHVwcHkubG9nKCdbWEhSVXBsb2FkXSB0aW1lciBkb25lJyk7XG4gICAgICBpZiAoYWxpdmVUaW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQoYWxpdmVUaW1lcik7XG4gICAgICAgIGFsaXZlVGltZXIgPSBudWxsO1xuICAgICAgfVxuICAgICAgaXNEb25lID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJvZ3Jlc3M6IHByb2dyZXNzLFxuICAgICAgZG9uZTogZG9uZVxuICAgIH07XG4gIH07XG5cbiAgWEhSVXBsb2FkLnByb3RvdHlwZS5jcmVhdGVGb3JtRGF0YVVwbG9hZCA9IGZ1bmN0aW9uIGNyZWF0ZUZvcm1EYXRhVXBsb2FkKGZpbGUsIG9wdHMpIHtcbiAgICB2YXIgZm9ybVBvc3QgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgIHZhciBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzLm1ldGFGaWVsZHMpID8gb3B0cy5tZXRhRmllbGRzXG4gICAgLy8gU2VuZCBhbG9uZyBhbGwgZmllbGRzIGJ5IGRlZmF1bHQuXG4gICAgOiBPYmplY3Qua2V5cyhmaWxlLm1ldGEpO1xuICAgIG1ldGFGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgZm9ybVBvc3QuYXBwZW5kKGl0ZW0sIGZpbGUubWV0YVtpdGVtXSk7XG4gICAgfSk7XG5cbiAgICBmb3JtUG9zdC5hcHBlbmQob3B0cy5maWVsZE5hbWUsIGZpbGUuZGF0YSk7XG5cbiAgICByZXR1cm4gZm9ybVBvc3Q7XG4gIH07XG5cbiAgWEhSVXBsb2FkLnByb3RvdHlwZS5jcmVhdGVCYXJlVXBsb2FkID0gZnVuY3Rpb24gY3JlYXRlQmFyZVVwbG9hZChmaWxlLCBvcHRzKSB7XG4gICAgcmV0dXJuIGZpbGUuZGF0YTtcbiAgfTtcblxuICBYSFJVcGxvYWQucHJvdG90eXBlLnVwbG9hZCA9IGZ1bmN0aW9uIHVwbG9hZChmaWxlLCBjdXJyZW50LCB0b3RhbCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgdmFyIG9wdHMgPSB0aGlzLmdldE9wdGlvbnMoZmlsZSk7XG5cbiAgICB0aGlzLnVwcHkubG9nKCd1cGxvYWRpbmcgJyArIGN1cnJlbnQgKyAnIG9mICcgKyB0b3RhbCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBkYXRhID0gb3B0cy5mb3JtRGF0YSA/IF90aGlzMi5jcmVhdGVGb3JtRGF0YVVwbG9hZChmaWxlLCBvcHRzKSA6IF90aGlzMi5jcmVhdGVCYXJlVXBsb2FkKGZpbGUsIG9wdHMpO1xuXG4gICAgICB2YXIgdGltZXIgPSBfdGhpczIuY3JlYXRlUHJvZ3Jlc3NUaW1lb3V0KG9wdHMudGltZW91dCwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICBfdGhpczIudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnJvcik7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgdmFyIGlkID0gY3VpZCgpO1xuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgICBfdGhpczIudXBweS5sb2coJ1tYSFJVcGxvYWRdICcgKyBpZCArICcgc3RhcnRlZCcpO1xuICAgICAgICAvLyBCZWdpbiBjaGVja2luZyBmb3IgdGltZW91dHMgd2hlbiBsb2FkaW5nIHN0YXJ0cy5cbiAgICAgICAgdGltZXIucHJvZ3Jlc3MoKTtcbiAgICAgIH0pO1xuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgIF90aGlzMi51cHB5LmxvZygnW1hIUlVwbG9hZF0gJyArIGlkICsgJyBwcm9ncmVzczogJyArIGV2LmxvYWRlZCArICcgLyAnICsgZXYudG90YWwpO1xuICAgICAgICB0aW1lci5wcm9ncmVzcygpO1xuXG4gICAgICAgIGlmIChldi5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgX3RoaXMyLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgICAgICAgdXBsb2FkZXI6IF90aGlzMixcbiAgICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGV2LmxvYWRlZCxcbiAgICAgICAgICAgIGJ5dGVzVG90YWw6IGV2LnRvdGFsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgICBfdGhpczIudXBweS5sb2coJ1tYSFJVcGxvYWRdICcgKyBpZCArICcgZmluaXNoZWQnKTtcbiAgICAgICAgdGltZXIuZG9uZSgpO1xuXG4gICAgICAgIGlmIChldi50YXJnZXQuc3RhdHVzID49IDIwMCAmJiBldi50YXJnZXQuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgdmFyIGJvZHkgPSBvcHRzLmdldFJlc3BvbnNlRGF0YSh4aHIucmVzcG9uc2VUZXh0LCB4aHIpO1xuICAgICAgICAgIHZhciB1cGxvYWRVUkwgPSBib2R5W29wdHMucmVzcG9uc2VVcmxGaWVsZE5hbWVdO1xuXG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgc3RhdHVzOiBldi50YXJnZXQuc3RhdHVzLFxuICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgIHVwbG9hZFVSTDogdXBsb2FkVVJMXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIF90aGlzMi51cHB5LnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7IHJlc3BvbnNlOiByZXNwb25zZSB9KTtcblxuICAgICAgICAgIF90aGlzMi51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgYm9keSwgdXBsb2FkVVJMKTtcblxuICAgICAgICAgIGlmICh1cGxvYWRVUkwpIHtcbiAgICAgICAgICAgIF90aGlzMi51cHB5LmxvZygnRG93bmxvYWQgJyArIGZpbGUubmFtZSArICcgZnJvbSAnICsgZmlsZS51cGxvYWRVUkwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZpbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBfYm9keSA9IG9wdHMuZ2V0UmVzcG9uc2VEYXRhKHhoci5yZXNwb25zZVRleHQsIHhocik7XG4gICAgICAgICAgdmFyIGVycm9yID0gYnVpbGRSZXNwb25zZUVycm9yKHhociwgb3B0cy5nZXRSZXNwb25zZUVycm9yKHhoci5yZXNwb25zZVRleHQsIHhocikpO1xuXG4gICAgICAgICAgdmFyIF9yZXNwb25zZSA9IHtcbiAgICAgICAgICAgIHN0YXR1czogZXYudGFyZ2V0LnN0YXR1cyxcbiAgICAgICAgICAgIGJvZHk6IF9ib2R5XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIF90aGlzMi51cHB5LnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7IHJlc3BvbnNlOiBfcmVzcG9uc2UgfSk7XG5cbiAgICAgICAgICBfdGhpczIudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnJvcik7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgX3RoaXMyLnVwcHkubG9nKCdbWEhSVXBsb2FkXSAnICsgaWQgKyAnIGVycm9yZWQnKTtcbiAgICAgICAgdGltZXIuZG9uZSgpO1xuXG4gICAgICAgIHZhciBlcnJvciA9IGJ1aWxkUmVzcG9uc2VFcnJvcih4aHIsIG9wdHMuZ2V0UmVzcG9uc2VFcnJvcih4aHIucmVzcG9uc2VUZXh0LCB4aHIpKTtcbiAgICAgICAgX3RoaXMyLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpO1xuICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgICB4aHIub3BlbihvcHRzLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBvcHRzLmVuZHBvaW50LCB0cnVlKTtcblxuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IG9wdHMud2l0aENyZWRlbnRpYWxzO1xuXG4gICAgICBPYmplY3Qua2V5cyhvcHRzLmhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24gKGhlYWRlcikge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIsIG9wdHMuaGVhZGVyc1toZWFkZXJdKTtcbiAgICAgIH0pO1xuXG4gICAgICB4aHIuc2VuZChkYXRhKTtcblxuICAgICAgX3RoaXMyLnVwcHkub24oJ2ZpbGUtcmVtb3ZlZCcsIGZ1bmN0aW9uIChyZW1vdmVkRmlsZSkge1xuICAgICAgICBpZiAocmVtb3ZlZEZpbGUuaWQgPT09IGZpbGUuaWQpIHtcbiAgICAgICAgICB0aW1lci5kb25lKCk7XG4gICAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBfdGhpczIudXBweS5vbigndXBsb2FkLWNhbmNlbCcsIGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICAgICAgaWYgKGZpbGVJRCA9PT0gZmlsZS5pZCkge1xuICAgICAgICAgIHRpbWVyLmRvbmUoKTtcbiAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIF90aGlzMi51cHB5Lm9uKCdjYW5jZWwtYWxsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aW1lci5kb25lKCk7XG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgWEhSVXBsb2FkLnByb3RvdHlwZS51cGxvYWRSZW1vdGUgPSBmdW5jdGlvbiB1cGxvYWRSZW1vdGUoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHZhciBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZmllbGRzID0ge307XG4gICAgICB2YXIgbWV0YUZpZWxkcyA9IEFycmF5LmlzQXJyYXkob3B0cy5tZXRhRmllbGRzKSA/IG9wdHMubWV0YUZpZWxkc1xuICAgICAgLy8gU2VuZCBhbG9uZyBhbGwgZmllbGRzIGJ5IGRlZmF1bHQuXG4gICAgICA6IE9iamVjdC5rZXlzKGZpbGUubWV0YSk7XG5cbiAgICAgIG1ldGFGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBmaWVsZHNbbmFtZV0gPSBmaWxlLm1ldGFbbmFtZV07XG4gICAgICB9KTtcblxuICAgICAgdmFyIHByb3ZpZGVyID0gbmV3IFByb3ZpZGVyKF90aGlzMy51cHB5LCBmaWxlLnJlbW90ZS5wcm92aWRlck9wdGlvbnMpO1xuICAgICAgcHJvdmlkZXIucG9zdChmaWxlLnJlbW90ZS51cmwsIF9leHRlbmRzKHt9LCBmaWxlLnJlbW90ZS5ib2R5LCB7XG4gICAgICAgIGVuZHBvaW50OiBvcHRzLmVuZHBvaW50LFxuICAgICAgICBzaXplOiBmaWxlLmRhdGEuc2l6ZSxcbiAgICAgICAgZmllbGRuYW1lOiBvcHRzLmZpZWxkTmFtZSxcbiAgICAgICAgbWV0YWRhdGE6IGZpZWxkcyxcbiAgICAgICAgaGVhZGVyczogb3B0cy5oZWFkZXJzXG4gICAgICB9KSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHZhciB0b2tlbiA9IHJlcy50b2tlbjtcbiAgICAgICAgdmFyIGhvc3QgPSBnZXRTb2NrZXRIb3N0KGZpbGUucmVtb3RlLnNlcnZlclVybCk7XG4gICAgICAgIHZhciBzb2NrZXQgPSBuZXcgU29ja2V0KHsgdGFyZ2V0OiBob3N0ICsgJy9hcGkvJyArIHRva2VuIH0pO1xuXG4gICAgICAgIHNvY2tldC5vbigncHJvZ3Jlc3MnLCBmdW5jdGlvbiAocHJvZ3Jlc3NEYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIGVtaXRTb2NrZXRQcm9ncmVzcyhfdGhpczMsIHByb2dyZXNzRGF0YSwgZmlsZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5vbignc3VjY2VzcycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgdmFyIHJlc3AgPSBvcHRzLmdldFJlc3BvbnNlRGF0YShkYXRhLnJlc3BvbnNlLnJlc3BvbnNlVGV4dCwgZGF0YS5yZXNwb25zZSk7XG4gICAgICAgICAgdmFyIHVwbG9hZFVSTCA9IHJlc3Bbb3B0cy5yZXNwb25zZVVybEZpZWxkTmFtZV07XG4gICAgICAgICAgX3RoaXMzLnVwcHkuZW1pdCgndXBsb2FkLXN1Y2Nlc3MnLCBmaWxlLCByZXNwLCB1cGxvYWRVUkwpO1xuICAgICAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyRGF0YSkge1xuICAgICAgICAgIHZhciByZXNwID0gZXJyRGF0YS5yZXNwb25zZTtcbiAgICAgICAgICB2YXIgZXJyb3IgPSByZXNwID8gb3B0cy5nZXRSZXNwb25zZUVycm9yKHJlc3AucmVzcG9uc2VUZXh0LCByZXNwKSA6IF9leHRlbmRzKG5ldyBFcnJvcihlcnJEYXRhLmVycm9yLm1lc3NhZ2UpLCB7IGNhdXNlOiBlcnJEYXRhLmVycm9yIH0pO1xuICAgICAgICAgIF90aGlzMy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKTtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIFhIUlVwbG9hZC5wcm90b3R5cGUudXBsb2FkQnVuZGxlID0gZnVuY3Rpb24gdXBsb2FkQnVuZGxlKGZpbGVzKSB7XG4gICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGVuZHBvaW50ID0gX3RoaXM0Lm9wdHMuZW5kcG9pbnQ7XG4gICAgICB2YXIgbWV0aG9kID0gX3RoaXM0Lm9wdHMubWV0aG9kO1xuXG4gICAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUsIGkpIHtcbiAgICAgICAgdmFyIG9wdHMgPSBfdGhpczQuZ2V0T3B0aW9ucyhmaWxlKTtcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKG9wdHMuZmllbGROYW1lLCBmaWxlLmRhdGEpO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IF90aGlzNC5vcHRzLndpdGhDcmVkZW50aWFscztcblxuICAgICAgdmFyIHRpbWVyID0gX3RoaXM0LmNyZWF0ZVByb2dyZXNzVGltZW91dChfdGhpczQub3B0cy50aW1lb3V0LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgIGVtaXRFcnJvcihlcnJvcik7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGVtaXRFcnJvciA9IGZ1bmN0aW9uIGVtaXRFcnJvcihlcnJvcikge1xuICAgICAgICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgX3RoaXM0LnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgIF90aGlzNC51cHB5LmxvZygnW1hIUlVwbG9hZF0gc3RhcnRlZCB1cGxvYWRpbmcgYnVuZGxlJyk7XG4gICAgICAgIHRpbWVyLnByb2dyZXNzKCk7XG4gICAgICB9KTtcblxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uIChldikge1xuICAgICAgICB0aW1lci5wcm9ncmVzcygpO1xuXG4gICAgICAgIGlmICghZXYubGVuZ3RoQ29tcHV0YWJsZSkgcmV0dXJuO1xuXG4gICAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgICBfdGhpczQudXBweS5lbWl0KCd1cGxvYWQtcHJvZ3Jlc3MnLCBmaWxlLCB7XG4gICAgICAgICAgICB1cGxvYWRlcjogX3RoaXM0LFxuICAgICAgICAgICAgYnl0ZXNVcGxvYWRlZDogZXYubG9hZGVkIC8gZXYudG90YWwgKiBmaWxlLnNpemUsXG4gICAgICAgICAgICBieXRlc1RvdGFsOiBmaWxlLnNpemVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgdGltZXIuZG9uZSgpO1xuXG4gICAgICAgIGlmIChldi50YXJnZXQuc3RhdHVzID49IDIwMCAmJiBldi50YXJnZXQuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgdmFyIHJlc3AgPSBfdGhpczQub3B0cy5nZXRSZXNwb25zZURhdGEoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKTtcbiAgICAgICAgICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICBfdGhpczQudXBweS5lbWl0KCd1cGxvYWQtc3VjY2VzcycsIGZpbGUsIHJlc3ApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZXJyb3IgPSBfdGhpczQub3B0cy5nZXRSZXNwb25zZUVycm9yKHhoci5yZXNwb25zZVRleHQsIHhocikgfHwgbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKTtcbiAgICAgICAgZXJyb3IucmVxdWVzdCA9IHhocjtcbiAgICAgICAgZW1pdEVycm9yKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgIHRpbWVyLmRvbmUoKTtcblxuICAgICAgICB2YXIgZXJyb3IgPSBfdGhpczQub3B0cy5nZXRSZXNwb25zZUVycm9yKHhoci5yZXNwb25zZVRleHQsIHhocikgfHwgbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKTtcbiAgICAgICAgZW1pdEVycm9yKGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgX3RoaXM0LnVwcHkub24oJ2NhbmNlbC1hbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRpbWVyLmRvbmUoKTtcbiAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICB9KTtcblxuICAgICAgeGhyLm9wZW4obWV0aG9kLnRvVXBwZXJDYXNlKCksIGVuZHBvaW50LCB0cnVlKTtcblxuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IF90aGlzNC5vcHRzLndpdGhDcmVkZW50aWFscztcblxuICAgICAgT2JqZWN0LmtleXMoX3RoaXM0Lm9wdHMuaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbiAoaGVhZGVyKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgX3RoaXM0Lm9wdHMuaGVhZGVyc1toZWFkZXJdKTtcbiAgICAgIH0pO1xuXG4gICAgICB4aHIuc2VuZChmb3JtRGF0YSk7XG5cbiAgICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgX3RoaXM0LnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIFhIUlVwbG9hZC5wcm90b3R5cGUudXBsb2FkRmlsZXMgPSBmdW5jdGlvbiB1cGxvYWRGaWxlcyhmaWxlcykge1xuICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgdmFyIGFjdGlvbnMgPSBmaWxlcy5tYXAoZnVuY3Rpb24gKGZpbGUsIGkpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gcGFyc2VJbnQoaSwgMTApICsgMTtcbiAgICAgIHZhciB0b3RhbCA9IGZpbGVzLmxlbmd0aDtcblxuICAgICAgaWYgKGZpbGUuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGZpbGUuZXJyb3IpKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoZmlsZS5pc1JlbW90ZSkge1xuICAgICAgICAvLyBXZSBlbWl0IHVwbG9hZC1zdGFydGVkIGhlcmUsIHNvIHRoYXQgaXQncyBhbHNvIGVtaXR0ZWQgZm9yIGZpbGVzXG4gICAgICAgIC8vIHRoYXQgaGF2ZSB0byB3YWl0IGR1ZSB0byB0aGUgYGxpbWl0YCBvcHRpb24uXG4gICAgICAgIF90aGlzNS51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSk7XG4gICAgICAgIHJldHVybiBfdGhpczUudXBsb2FkUmVtb3RlLmJpbmQoX3RoaXM1LCBmaWxlLCBjdXJyZW50LCB0b3RhbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpczUudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpO1xuICAgICAgICByZXR1cm4gX3RoaXM1LnVwbG9hZC5iaW5kKF90aGlzNSwgZmlsZSwgY3VycmVudCwgdG90YWwpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHByb21pc2VzID0gYWN0aW9ucy5tYXAoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgdmFyIGxpbWl0ZWRBY3Rpb24gPSBfdGhpczUubGltaXRVcGxvYWRzKGFjdGlvbik7XG4gICAgICByZXR1cm4gbGltaXRlZEFjdGlvbigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNldHRsZShwcm9taXNlcyk7XG4gIH07XG5cbiAgWEhSVXBsb2FkLnByb3RvdHlwZS5oYW5kbGVVcGxvYWQgPSBmdW5jdGlvbiBoYW5kbGVVcGxvYWQoZmlsZUlEcykge1xuICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgaWYgKGZpbGVJRHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKCdbWEhSVXBsb2FkXSBObyBmaWxlcyB0byB1cGxvYWQhJyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgdGhpcy51cHB5LmxvZygnW1hIUlVwbG9hZF0gVXBsb2FkaW5nLi4uJyk7XG4gICAgdmFyIGZpbGVzID0gZmlsZUlEcy5tYXAoZnVuY3Rpb24gKGZpbGVJRCkge1xuICAgICAgcmV0dXJuIF90aGlzNi51cHB5LmdldEZpbGUoZmlsZUlEKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdHMuYnVuZGxlKSB7XG4gICAgICByZXR1cm4gdGhpcy51cGxvYWRCdW5kbGUoZmlsZXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGVzKGZpbGVzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuICB9O1xuXG4gIFhIUlVwbG9hZC5wcm90b3R5cGUuaW5zdGFsbCA9IGZ1bmN0aW9uIGluc3RhbGwoKSB7XG4gICAgaWYgKHRoaXMub3B0cy5idW5kbGUpIHtcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNhcGFiaWxpdGllczogX2V4dGVuZHMoe30sIHRoaXMudXBweS5nZXRTdGF0ZSgpLmNhcGFiaWxpdGllcywge1xuICAgICAgICAgIGJ1bmRsZWQ6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudXBweS5hZGRVcGxvYWRlcih0aGlzLmhhbmRsZVVwbG9hZCk7XG4gIH07XG5cbiAgWEhSVXBsb2FkLnByb3RvdHlwZS51bmluc3RhbGwgPSBmdW5jdGlvbiB1bmluc3RhbGwoKSB7XG4gICAgaWYgKHRoaXMub3B0cy5idW5kbGUpIHtcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNhcGFiaWxpdGllczogX2V4dGVuZHMoe30sIHRoaXMudXBweS5nZXRTdGF0ZSgpLmNhcGFiaWxpdGllcywge1xuICAgICAgICAgIGJ1bmRsZWQ6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMudXBweS5yZW1vdmVVcGxvYWRlcih0aGlzLmhhbmRsZVVwbG9hZCk7XG4gIH07XG5cbiAgcmV0dXJuIFhIUlVwbG9hZDtcbn0oUGx1Z2luKTsiLCJjb25zdCBVcHB5ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCBGaWxlSW5wdXQgPSByZXF1aXJlKCdAdXBweS9maWxlLWlucHV0JylcbmNvbnN0IFhIUlVwbG9hZCA9IHJlcXVpcmUoJ0B1cHB5L3hoci11cGxvYWQnKVxuY29uc3QgUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCdAdXBweS9wcm9ncmVzcy1iYXInKVxuXG5jb25zdCB1cHB5ID0gbmV3IFVwcHkoeyBkZWJ1ZzogdHJ1ZSwgYXV0b1Byb2NlZWQ6IHRydWUgfSlcbnVwcHkudXNlKEZpbGVJbnB1dCwgeyB0YXJnZXQ6ICcuVXBweUZvcm0nLCByZXBsYWNlVGFyZ2V0Q29udGVudDogdHJ1ZSB9KVxudXBweS51c2UoWEhSVXBsb2FkLCB7XG4gIGVuZHBvaW50OiAnLy9hcGkyLnRyYW5zbG9hZGl0LmNvbScsXG4gIGZvcm1EYXRhOiB0cnVlLFxuICBmaWVsZE5hbWU6ICdmaWxlc1tdJ1xufSlcbnVwcHkudXNlKFByb2dyZXNzQmFyLCB7XG4gIHRhcmdldDogJ2JvZHknLFxuICBmaXhlZDogdHJ1ZSxcbiAgaGlkZUFmdGVyRmluaXNoOiBmYWxzZVxufSlcblxuY29uc29sZS5sb2coJ1VwcHkgd2l0aCBGb3JtdGFnIGFuZCBYSFJVcGxvYWQgaXMgbG9hZGVkJylcbiJdfQ==
