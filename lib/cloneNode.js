"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneNode = void 0;
var textarea_caret_1 = __importDefault(require("textarea-caret"));
var clonePseudoElements_1 = require("./clonePseudoElements");
var util_1 = require("./util");
function cloneCanvasElement(node) {
    return __awaiter(this, void 0, void 0, function () {
        var dataURL;
        return __generator(this, function (_a) {
            dataURL = node.toDataURL();
            if (dataURL === 'data:,') {
                return [2 /*return*/, Promise.resolve(node.cloneNode(false))];
            }
            return [2 /*return*/, (0, util_1.createImage)(dataURL)];
        });
    });
}
function cloneVideoElement(node) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve(node)
                    .then(function (nativeNode) {
                    var canvas = nativeNode.ownerDocument.createElement('canvas');
                    canvas.width = nativeNode.width; // TODO right dimensions
                    canvas.height = nativeNode.height;
                    var context = canvas.getContext('2d');
                    if (context === null)
                        throw new Error('Failed to get 2D context');
                    context.drawImage(nativeNode, 0, 0);
                    return canvas.toDataURL();
                })
                    .then(function (dataURL) { return (0, util_1.createImage)(dataURL); })];
        });
    });
}
function cloneTextInputElement(node) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var ownerDoc, clonedNode, scrollContainer, scrollOffset, ownerWindow, padX, padY, spanWhiteSpace, compStyle, caret, fakeCaret, span;
        return __generator(this, function (_b) {
            ownerDoc = node.ownerDocument;
            clonedNode = ownerDoc.createElement('div');
            scrollContainer = ownerDoc.createElement('div');
            // console.log(node.scrollLeft, node.scrollTop);
            scrollContainer.style.display = 'block';
            scrollContainer.style.width = '100%';
            scrollContainer.style.height = '100%';
            scrollContainer.style.boxSizing = 'border-box';
            scrollContainer.style.overflow = 'hidden';
            clonedNode.appendChild(scrollContainer);
            scrollOffset = ownerDoc.createElement('div');
            // console.log(node.scrollLeft, node.scrollTop);
            // scrollOffset.style.marginLeft = `-${node.scrollLeft}px`;
            // scrollOffset.style.marginTop = `-${node.scrollTop}px`;
            scrollOffset.style.display = 'block';
            // XXX so that caret doesn't cause a line break in the beginning if the text
            // is a long "word" with no spaces
            scrollOffset.style.whiteSpace = 'nowrap';
            scrollOffset.style.transform = "translateX(-".concat(node.scrollLeft, "px) translateY(-").concat(node.scrollTop, "px)");
            scrollContainer.appendChild(scrollOffset);
            ownerWindow = ownerDoc.defaultView;
            padX = 0;
            padY = 0;
            spanWhiteSpace = 'pre-wrap';
            compStyle = ownerWindow === null || ownerWindow === void 0 ? void 0 : ownerWindow.getComputedStyle(node);
            if (compStyle) {
                padX = parseFloat(compStyle.paddingLeft);
                padY = parseFloat(compStyle.paddingLeft);
                if (node.tagName !== 'INPUT')
                    spanWhiteSpace = compStyle.whiteSpace;
            }
            caret = (0, textarea_caret_1.default)(node, (_a = node.selectionStart) !== null && _a !== void 0 ? _a : 0);
            fakeCaret = ownerDoc.createElement('div');
            fakeCaret.style.left = "".concat(caret.left - padX, "px");
            fakeCaret.style.top = "".concat(caret.top - padY, "px");
            fakeCaret.style.width = '1px';
            // fakeCaret.style.height = `${caret.height}px`;
            // HACK caret.height can be NaN if line-height isn't an absolute value. use
            // 1em instead
            fakeCaret.style.height = '1em';
            fakeCaret.style.background = 'black';
            fakeCaret.style.display = 'inline-block';
            fakeCaret.style.position = 'relative';
            // FIXME caret can appear over other elements
            scrollOffset.appendChild(fakeCaret);
            span = ownerDoc.createElement('span');
            span.textContent = node.value;
            if (node.tagName !== 'INPUT')
                span.style.whiteSpace = spanWhiteSpace;
            scrollOffset.appendChild(span);
            return [2 /*return*/, Promise.resolve(clonedNode)];
        });
    });
}
function cloneSingleNode(node, options) {
    return __awaiter(this, void 0, void 0, function () {
        var ownerDoc, nodeWindow;
        return __generator(this, function (_a) {
            ownerDoc = node === null || node === void 0 ? void 0 : node.ownerDocument;
            nodeWindow = ownerDoc === null || ownerDoc === void 0 ? void 0 : ownerDoc.defaultView;
            if (nodeWindow) {
                if (node instanceof nodeWindow.HTMLCanvasElement) {
                    return [2 /*return*/, cloneCanvasElement(node)];
                }
                if (node instanceof nodeWindow.HTMLVideoElement) {
                    // TODO load poster as fallback
                    return [2 /*return*/, cloneVideoElement(node)];
                }
                if (options.fakeTextInputs &&
                    node === ownerDoc.activeElement &&
                    (node instanceof nodeWindow.HTMLInputElement ||
                        node instanceof nodeWindow.HTMLTextAreaElement)) {
                    return [2 /*return*/, cloneTextInputElement(node)];
                }
            }
            return [2 /*return*/, Promise.resolve(node.cloneNode(false))];
        });
    });
}
var isSlotElement = function (node) {
    return node.tagName != null && node.tagName.toUpperCase() === 'SLOT';
};
function cloneChildren(nativeNode, clonedNode, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var children, nodeWindow;
        return __generator(this, function (_c) {
            children = isSlotElement(nativeNode) && nativeNode.assignedNodes
                ? (0, util_1.toArray)(nativeNode.assignedNodes())
                : (0, util_1.toArray)(((_a = nativeNode.shadowRoot) !== null && _a !== void 0 ? _a : nativeNode).childNodes);
            nodeWindow = (_b = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView;
            if (children.length === 0 ||
                (nodeWindow && nativeNode instanceof nodeWindow.HTMLVideoElement)) {
                return [2 /*return*/, Promise.resolve(clonedNode)];
            }
            return [2 /*return*/, children
                    .reduce(function (deferred, child) {
                    return deferred
                        // eslint-disable-next-line no-use-before-define
                        .then(function () { return cloneNode(child, options); })
                        .then(function (clonedChild) {
                        // eslint-disable-next-line promise/always-return
                        if (clonedChild) {
                            clonedNode.appendChild(clonedChild);
                        }
                    });
                }, Promise.resolve())
                    .then(function () { return clonedNode; })];
        });
    });
}
function cloneCSSStyle(nativeNode, clonedNode) {
    var _a, _b;
    var source = (_b = (_a = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0 ? void 0 : _b.getComputedStyle(nativeNode);
    var target = clonedNode.style;
    if (!source || !target) {
        return;
    }
    // FIXME on chrome, when a textarea is scrollable, the scrollbar isn't
    // included as part of the width, so the output actually shrinks. seems like
    // getComputedStyle uses clientWidth instead of offsetWidth? maybe its because
    // of the box sizing model? should we force the box-sizing to be border-box
    // and somehow measure it correctly when the box-sizing of the native node is
    // not border-box?
    // FIXME on chrome, textarea gets a bit more space below it despite having no
    // margin. this is because it has inline-block display by default and an extra
    // space is added, creating the apparent margin. this is an issue because a
    // fake caret changes the element to be a div, which no longer has the
    // apparent margin, creating a "pop" and a desync between the real element
    // positions and the cloned ones. adding an artificial text node with a single
    // space after the element does nothing
    // FIXME the performance of this is still dreadful. is there anything else
    // that can be done to salvage this? for continuous captures, how about
    // reusing the previous frame's computed css styles if the element has no
    // changes?
    var cssText = '';
    for (var i = 0; i < source.length; i += 1) {
        var name_1 = source[i];
        // target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
        cssText += "".concat(name_1, ":").concat(source.getPropertyValue(name_1), " ").concat(source.getPropertyPriority(name_1), ";");
    }
    target.cssText = cssText;
}
function cloneInputValue(nativeNode, clonedNode, options) {
    // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
    var ownerDoc = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument;
    var nodeWindow = ownerDoc === null || ownerDoc === void 0 ? void 0 : ownerDoc.defaultView;
    if (!nodeWindow) {
        return;
    }
    if (options.fakeTextInputs && ownerDoc.activeElement === nativeNode) {
        var isInput = nativeNode instanceof nodeWindow.HTMLInputElement;
        if (isInput || nativeNode instanceof nodeWindow.HTMLTextAreaElement) {
            clonedNode.style.overflow = 'hidden';
            clonedNode.style.verticalAlign = 'top';
            if (isInput) {
                clonedNode.style.whiteSpace = 'nowrap';
            }
        }
    }
    else {
        if (nativeNode instanceof nodeWindow.HTMLTextAreaElement) {
            var clonedTextArea = clonedNode;
            clonedTextArea.innerHTML = nativeNode.value;
        }
        if (nativeNode instanceof nodeWindow.HTMLInputElement) {
            var clonedInput = clonedNode;
            clonedInput.setAttribute('value', nativeNode.value);
        }
    }
}
function cloneScrollPosition(nativeNode, clonedNode) {
    var _a;
    // If element is not scrolled, we don't need to move the children.
    if (nativeNode.scrollTop === 0 && nativeNode.scrollLeft === 0) {
        return;
    }
    // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
    var nodeWindow = (_a = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
    // Don't do anything for textarea and input, they are handled in a special
    // case
    if (!nodeWindow ||
        ((nativeNode instanceof nodeWindow.HTMLTextAreaElement ||
            nativeNode instanceof nodeWindow.HTMLInputElement) &&
            clonedNode instanceof nodeWindow.HTMLDivElement)) {
        return;
    }
    for (var i = 0; i < clonedNode.children.length; i += 1) {
        var child = clonedNode.children[i];
        if (!('style' in child)) {
            return;
        }
        var element = child;
        // For each of the children, get the current transform and translate it with
        // the native node's scroll position.
        var transform = element.style.transform;
        var matrix = new DOMMatrix(transform);
        var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d;
        // reset rotation/skew so it wont change the translate direction.
        matrix.a = 1;
        matrix.b = 0;
        matrix.c = 0;
        matrix.d = 1;
        matrix.translateSelf(-nativeNode.scrollLeft, -nativeNode.scrollTop);
        // restore rotation and skew
        matrix.a = a;
        matrix.b = b;
        matrix.c = c;
        matrix.d = d;
        element.style.transform = matrix.toString();
    }
}
function decorate(nativeNode, clonedNode, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var nodeWindow;
        return __generator(this, function (_b) {
            nodeWindow = (_a = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
            if (!nodeWindow || !(clonedNode instanceof nodeWindow.Element)) {
                return [2 /*return*/, Promise.resolve(clonedNode)];
            }
            return [2 /*return*/, Promise.resolve()
                    .then(function () { return cloneCSSStyle(nativeNode, clonedNode); })
                    .then(function () { return (0, clonePseudoElements_1.clonePseudoElements)(nativeNode, clonedNode); })
                    .then(function () { return cloneInputValue(nativeNode, clonedNode, options); })
                    .then(function () { return cloneScrollPosition(nativeNode, clonedNode); })
                    .then(function () { return clonedNode; })];
        });
    });
}
function cloneNode(node, options, isRoot) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!isRoot && options.filter && !options.filter(node)) {
                return [2 /*return*/, Promise.resolve(null)];
            }
            return [2 /*return*/, Promise.resolve(node)
                    .then(function (clonedNode) { return cloneSingleNode(clonedNode, options); })
                    .then(function (clonedNode) { return cloneChildren(node, clonedNode, options); })
                    .then(function (clonedNode) { return decorate(node, clonedNode, options); })];
        });
    });
}
exports.cloneNode = cloneNode;
//# sourceMappingURL=cloneNode.js.map