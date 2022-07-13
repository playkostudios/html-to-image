var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import getCaretCoordinates from 'textarea-caret';
import { clonePseudoElements } from './clonePseudoElements';
import { createImage, toArray } from './util';
function cloneCanvasElement(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataURL = node.toDataURL();
        if (dataURL === 'data:,') {
            return Promise.resolve(node.cloneNode(false));
        }
        return createImage(dataURL);
    });
}
function cloneVideoElement(node) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.resolve(node)
            .then((nativeNode) => {
            const canvas = nativeNode.ownerDocument.createElement('canvas');
            canvas.width = nativeNode.width; // TODO right dimensions
            canvas.height = nativeNode.height;
            const context = canvas.getContext('2d');
            if (context === null)
                throw new Error('Failed to get 2D context');
            context.drawImage(nativeNode, 0, 0);
            return canvas.toDataURL();
        })
            .then((dataURL) => createImage(dataURL));
    });
}
function cloneTextInputElement(node) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const ownerDoc = node.ownerDocument;
        const clonedNode = ownerDoc.createElement('div');
        // scroll container
        const scrollContainer = ownerDoc.createElement('div');
        // console.log(node.scrollLeft, node.scrollTop);
        scrollContainer.style.display = 'block';
        scrollContainer.style.width = '100%';
        scrollContainer.style.height = '100%';
        scrollContainer.style.boxSizing = 'border-box';
        scrollContainer.style.overflow = 'hidden';
        clonedNode.appendChild(scrollContainer);
        // scroll offset
        const scrollOffset = ownerDoc.createElement('div');
        // console.log(node.scrollLeft, node.scrollTop);
        // scrollOffset.style.marginLeft = `-${node.scrollLeft}px`;
        // scrollOffset.style.marginTop = `-${node.scrollTop}px`;
        scrollOffset.style.display = 'block';
        // XXX so that caret doesn't cause a line break in the beginning if the text
        // is a long "word" with no spaces
        scrollOffset.style.whiteSpace = 'nowrap';
        scrollOffset.style.transform = `translateX(-${node.scrollLeft}px) translateY(-${node.scrollTop}px)`;
        scrollContainer.appendChild(scrollOffset);
        // fake caret
        const ownerWindow = ownerDoc.defaultView;
        let padX = 0;
        let padY = 0;
        let spanWhiteSpace = 'pre-wrap';
        const compStyle = ownerWindow === null || ownerWindow === void 0 ? void 0 : ownerWindow.getComputedStyle(node);
        if (compStyle) {
            padX = parseFloat(compStyle.paddingLeft);
            padY = parseFloat(compStyle.paddingLeft);
            if (node.tagName !== 'INPUT')
                spanWhiteSpace = compStyle.whiteSpace;
        }
        const caret = getCaretCoordinates(node, (_a = node.selectionStart) !== null && _a !== void 0 ? _a : 0);
        const fakeCaret = ownerDoc.createElement('div');
        fakeCaret.style.left = `${caret.left - padX}px`;
        fakeCaret.style.top = `${caret.top - padY}px`;
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
        // text
        const span = ownerDoc.createElement('span');
        span.textContent = node.value;
        if (node.tagName !== 'INPUT')
            span.style.whiteSpace = spanWhiteSpace;
        scrollOffset.appendChild(span);
        return Promise.resolve(clonedNode);
    });
}
function cloneSingleNode(node, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
        const ownerDoc = node === null || node === void 0 ? void 0 : node.ownerDocument;
        const nodeWindow = ownerDoc === null || ownerDoc === void 0 ? void 0 : ownerDoc.defaultView;
        if (nodeWindow) {
            if (node instanceof nodeWindow.HTMLCanvasElement) {
                return cloneCanvasElement(node);
            }
            if (node instanceof nodeWindow.HTMLVideoElement) {
                // TODO load poster as fallback
                return cloneVideoElement(node);
            }
            if (options.fakeTextInputs &&
                node === ownerDoc.activeElement &&
                (node instanceof nodeWindow.HTMLInputElement ||
                    node instanceof nodeWindow.HTMLTextAreaElement)) {
                return cloneTextInputElement(node);
            }
        }
        return Promise.resolve(node.cloneNode(false));
    });
}
const isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === 'SLOT';
function cloneChildren(nativeNode, clonedNode, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const children = isSlotElement(nativeNode) && nativeNode.assignedNodes
            ? toArray(nativeNode.assignedNodes())
            : toArray(((_a = nativeNode.shadowRoot) !== null && _a !== void 0 ? _a : nativeNode).childNodes);
        // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
        const nodeWindow = (_b = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView;
        if (children.length === 0 ||
            (nodeWindow && nativeNode instanceof nodeWindow.HTMLVideoElement)) {
            return Promise.resolve(clonedNode);
        }
        return children
            .reduce((deferred, child) => deferred
            // eslint-disable-next-line no-use-before-define
            .then(() => cloneNode(child, options))
            .then((clonedChild) => {
            // eslint-disable-next-line promise/always-return
            if (clonedChild) {
                clonedNode.appendChild(clonedChild);
            }
        }), Promise.resolve())
            .then(() => clonedNode);
    });
}
function cloneCSSStyle(nativeNode, clonedNode) {
    var _a, _b;
    const source = (_b = (_a = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0 ? void 0 : _b.getComputedStyle(nativeNode);
    const target = clonedNode.style;
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
    let cssText = '';
    for (let i = 0; i < source.length; i += 1) {
        const name = source[i];
        // target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
        cssText += `${name}:${source.getPropertyValue(name)} ${source.getPropertyPriority(name)};`;
    }
    target.cssText = cssText;
}
function cloneInputValue(nativeNode, clonedNode, options) {
    // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
    const ownerDoc = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument;
    const nodeWindow = ownerDoc === null || ownerDoc === void 0 ? void 0 : ownerDoc.defaultView;
    if (!nodeWindow) {
        return;
    }
    if (options.fakeTextInputs && ownerDoc.activeElement === nativeNode) {
        const isInput = nativeNode instanceof nodeWindow.HTMLInputElement;
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
            const clonedTextArea = clonedNode;
            clonedTextArea.innerHTML = nativeNode.value;
        }
        if (nativeNode instanceof nodeWindow.HTMLInputElement) {
            const clonedInput = clonedNode;
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
    const nodeWindow = (_a = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
    // Don't do anything for textarea and input, they are handled in a special
    // case
    if (!nodeWindow ||
        ((nativeNode instanceof nodeWindow.HTMLTextAreaElement ||
            nativeNode instanceof nodeWindow.HTMLInputElement) &&
            clonedNode instanceof nodeWindow.HTMLDivElement)) {
        return;
    }
    for (let i = 0; i < clonedNode.children.length; i += 1) {
        const child = clonedNode.children[i];
        if (!('style' in child)) {
            return;
        }
        const element = child;
        // For each of the children, get the current transform and translate it with
        // the native node's scroll position.
        const { transform } = element.style;
        const matrix = new DOMMatrix(transform);
        const { a, b, c, d } = matrix;
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
    return __awaiter(this, void 0, void 0, function* () {
        // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
        const nodeWindow = (_a = nativeNode === null || nativeNode === void 0 ? void 0 : nativeNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
        if (!nodeWindow || !(clonedNode instanceof nodeWindow.Element)) {
            return Promise.resolve(clonedNode);
        }
        return Promise.resolve()
            .then(() => cloneCSSStyle(nativeNode, clonedNode))
            .then(() => clonePseudoElements(nativeNode, clonedNode))
            .then(() => cloneInputValue(nativeNode, clonedNode, options))
            .then(() => cloneScrollPosition(nativeNode, clonedNode))
            .then(() => clonedNode);
    });
}
export function cloneNode(node, options, isRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isRoot && options.filter && !options.filter(node)) {
            return Promise.resolve(null);
        }
        return Promise.resolve(node)
            .then((clonedNode) => cloneSingleNode(clonedNode, options))
            .then((clonedNode) => cloneChildren(node, clonedNode, options))
            .then((clonedNode) => decorate(node, clonedNode, options));
    });
}
//# sourceMappingURL=cloneNode.js.map