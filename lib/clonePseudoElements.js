"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clonePseudoElements = void 0;
var util_1 = require("./util");
function formatCSSText(style) {
    var content = style.getPropertyValue('content');
    return "".concat(style.cssText, " content: '").concat(content.replace(/'|"/g, ''), "';");
}
function formatCSSProperties(style) {
    return (0, util_1.toArray)(style)
        .map(function (name) {
        var value = style.getPropertyValue(name);
        var priority = style.getPropertyPriority(name);
        return "".concat(name, ": ").concat(value).concat(priority ? ' !important' : '', ";");
    })
        .join(' ');
}
function getPseudoElementStyle(className, pseudo, style, ownerDoc) {
    var selector = ".".concat(className, ":").concat(pseudo);
    var cssText = style.cssText
        ? formatCSSText(style)
        : formatCSSProperties(style);
    return ownerDoc.createTextNode("".concat(selector, "{").concat(cssText, "}"));
}
function clonePseudoElement(nativeNode, clonedNode, pseudo) {
    var _a;
    var ownerDoc = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument;
    if (!ownerDoc) {
        return;
    }
    var style = (_a = ownerDoc === null || ownerDoc === void 0 ? void 0 : ownerDoc.defaultView) === null || _a === void 0 ? void 0 : _a.getComputedStyle(nativeNode, pseudo);
    if (!style) {
        return;
    }
    var content = style.getPropertyValue('content');
    if (content === '' || content === 'none') {
        return;
    }
    var className = (0, util_1.uuid)();
    try {
        clonedNode.className = "".concat(clonedNode.className, " ").concat(className);
    }
    catch (err) {
        return;
    }
    var styleElement = ownerDoc.createElement('style');
    styleElement.appendChild(getPseudoElementStyle(className, pseudo, style, ownerDoc));
    clonedNode.appendChild(styleElement);
}
function clonePseudoElements(nativeNode, clonedNode) {
    clonePseudoElement(nativeNode, clonedNode, ':before');
    clonePseudoElement(nativeNode, clonedNode, ':after');
}
exports.clonePseudoElements = clonePseudoElements;
//# sourceMappingURL=clonePseudoElements.js.map