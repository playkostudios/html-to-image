import { uuid, toArray } from './util';
function formatCSSText(style) {
    const content = style.getPropertyValue('content');
    return `${style.cssText} content: '${content.replace(/'|"/g, '')}';`;
}
function formatCSSProperties(style) {
    return toArray(style)
        .map((name) => {
        const value = style.getPropertyValue(name);
        const priority = style.getPropertyPriority(name);
        return `${name}: ${value}${priority ? ' !important' : ''};`;
    })
        .join(' ');
}
function getPseudoElementStyle(className, pseudo, style, ownerDoc) {
    const selector = `.${className}:${pseudo}`;
    const cssText = style.cssText
        ? formatCSSText(style)
        : formatCSSProperties(style);
    return ownerDoc.createTextNode(`${selector}{${cssText}}`);
}
function clonePseudoElement(nativeNode, clonedNode, pseudo) {
    var _a;
    const ownerDoc = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument;
    if (!ownerDoc) {
        return;
    }
    const style = (_a = ownerDoc === null || ownerDoc === void 0 ? void 0 : ownerDoc.defaultView) === null || _a === void 0 ? void 0 : _a.getComputedStyle(nativeNode, pseudo);
    if (!style) {
        return;
    }
    const content = style.getPropertyValue('content');
    if (content === '' || content === 'none') {
        return;
    }
    const className = uuid();
    try {
        clonedNode.className = `${clonedNode.className} ${className}`;
    }
    catch (err) {
        return;
    }
    const styleElement = ownerDoc.createElement('style');
    styleElement.appendChild(getPseudoElementStyle(className, pseudo, style, ownerDoc));
    clonedNode.appendChild(styleElement);
}
export function clonePseudoElements(nativeNode, clonedNode) {
    clonePseudoElement(nativeNode, clonedNode, ':before');
    clonePseudoElement(nativeNode, clonedNode, ':after');
}
//# sourceMappingURL=clonePseudoElements.js.map