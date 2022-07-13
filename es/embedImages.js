var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getBlobFromURL } from './getBlobFromURL';
import { embedResources } from './embedResources';
import { getMimeType, isDataUrl, makeDataUrl, toArray } from './util';
function embedBackground(clonedNode, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const background = (_a = clonedNode.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue('background');
        if (!background) {
            return Promise.resolve(clonedNode);
        }
        return Promise.resolve(background)
            .then((cssString) => embedResources(cssString, null, options))
            .then((cssString) => {
            clonedNode.style.setProperty('background', cssString, clonedNode.style.getPropertyPriority('background'));
            return clonedNode;
        });
    });
}
function embedImageNode(clonedNode, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
        const nodeWindow = (_a = clonedNode === null || clonedNode === void 0 ? void 0 : clonedNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
        if (!nodeWindow ||
            (!(clonedNode instanceof nodeWindow.HTMLImageElement &&
                !isDataUrl(clonedNode.src)) &&
                !(clonedNode instanceof nodeWindow.SVGImageElement &&
                    !isDataUrl(clonedNode.href.baseVal)))) {
            return Promise.resolve(clonedNode);
        }
        const src = clonedNode instanceof nodeWindow.HTMLImageElement
            ? clonedNode.src
            : clonedNode.href.baseVal;
        return Promise.resolve(src)
            .then((url) => {
            return getBlobFromURL(url, options);
        })
            .then((data) => {
            return makeDataUrl(data.blob, getMimeType(src) || data.contentType);
        })
            .then((dataURL) => {
            return new Promise((resolve, reject) => {
                clonedNode.onload = resolve;
                clonedNode.onerror = reject;
                if (clonedNode instanceof nodeWindow.HTMLImageElement) {
                    clonedNode.srcset = '';
                    clonedNode.src = dataURL;
                }
                else {
                    clonedNode.href.baseVal = dataURL;
                }
            });
        })
            .then(() => clonedNode, () => clonedNode);
    });
}
function embedChildren(clonedNode, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const children = toArray(clonedNode.childNodes);
        // eslint-disable-next-line no-use-before-define
        const deferreds = children.map((child) => embedImages(child, options));
        return Promise.all(deferreds).then(() => clonedNode);
    });
}
export function embedImages(clonedNode, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
        const nodeWindow = (_a = clonedNode === null || clonedNode === void 0 ? void 0 : clonedNode.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView;
        if (!nodeWindow || !(clonedNode instanceof nodeWindow.Element)) {
            return Promise.resolve(clonedNode);
        }
        return Promise.resolve(clonedNode)
            .then((node) => embedBackground(node, options))
            .then((node) => embedImageNode(node, options))
            .then((node) => embedChildren(node, options));
    });
}
//# sourceMappingURL=embedImages.js.map