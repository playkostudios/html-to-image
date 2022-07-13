import getCaretCoordinates from 'textarea-caret'
import { Options } from './options'
import { clonePseudoElements } from './clonePseudoElements'
import { createImage, toArray } from './util'

async function cloneCanvasElement(node: HTMLCanvasElement) {
  const dataURL = node.toDataURL()
  if (dataURL === 'data:,') {
    return Promise.resolve(node.cloneNode(false) as HTMLCanvasElement)
  }

  return createImage(dataURL)
}

async function cloneVideoElement(node: HTMLVideoElement) {
  return Promise.resolve(node)
    .then((nativeNode) => {
      const canvas = nativeNode.ownerDocument.createElement('canvas')
      canvas.width = nativeNode.width // TODO right dimensions
      canvas.height = nativeNode.height
      const context = canvas.getContext('2d')
      if (context === null) throw new Error('Failed to get 2D context')
      context.drawImage(nativeNode, 0, 0)
      return canvas.toDataURL()
    })
    .then((dataURL) => createImage(dataURL))
}

async function cloneTextInputElement(
  node: HTMLInputElement | HTMLTextAreaElement,
) {
  const ownerDoc = node.ownerDocument
  const clonedNode = ownerDoc.createElement('div')

  // scroll container
  const scrollContainer = ownerDoc.createElement('div')
  // console.log(node.scrollLeft, node.scrollTop);
  scrollContainer.style.display = 'block'
  scrollContainer.style.width = '100%'
  scrollContainer.style.height = '100%'
  scrollContainer.style.boxSizing = 'border-box'
  scrollContainer.style.overflow = 'hidden'
  clonedNode.appendChild(scrollContainer)

  // scroll offset
  const scrollOffset = ownerDoc.createElement('div')
  // console.log(node.scrollLeft, node.scrollTop);
  // scrollOffset.style.marginLeft = `-${node.scrollLeft}px`;
  // scrollOffset.style.marginTop = `-${node.scrollTop}px`;
  scrollOffset.style.display = 'block'
  // XXX so that caret doesn't cause a line break in the beginning if the text
  // is a long "word" with no spaces
  scrollOffset.style.whiteSpace = 'nowrap'
  scrollOffset.style.transform = `translateX(-${node.scrollLeft}px) translateY(-${node.scrollTop}px)`
  scrollContainer.appendChild(scrollOffset)

  // fake caret
  const ownerWindow = ownerDoc.defaultView
  let padX = 0
  let padY = 0
  let spanWhiteSpace = 'pre-wrap'

  const compStyle = ownerWindow?.getComputedStyle(node)
  if (compStyle) {
    padX = parseFloat(compStyle.paddingLeft)
    padY = parseFloat(compStyle.paddingLeft)

    if (node.tagName !== 'INPUT') spanWhiteSpace = compStyle.whiteSpace
  }

  const caret = getCaretCoordinates(node, node.selectionStart ?? 0)
  const fakeCaret = ownerDoc.createElement('div')
  fakeCaret.style.left = `${caret.left - padX}px`
  fakeCaret.style.top = `${caret.top - padY}px`
  fakeCaret.style.width = '1px'
  // fakeCaret.style.height = `${caret.height}px`;
  // HACK caret.height can be NaN if line-height isn't an absolute value. use
  // 1em instead
  fakeCaret.style.height = '1em'
  fakeCaret.style.background = 'black'
  fakeCaret.style.display = 'inline-block'
  fakeCaret.style.position = 'relative'
  // FIXME caret can appear over other elements
  scrollOffset.appendChild(fakeCaret)

  // text
  const span = ownerDoc.createElement('span')
  span.textContent = node.value

  if (node.tagName !== 'INPUT') span.style.whiteSpace = spanWhiteSpace

  scrollOffset.appendChild(span)

  return Promise.resolve(clonedNode)
}

async function cloneSingleNode<T extends HTMLElement>(
  node: T,
  options: Options,
): Promise<HTMLElement> {
  // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
  const ownerDoc = node?.ownerDocument
  const nodeWindow = ownerDoc?.defaultView

  if (nodeWindow) {
    if (node instanceof nodeWindow.HTMLCanvasElement) {
      return cloneCanvasElement(node)
    }
    if (node instanceof nodeWindow.HTMLVideoElement) {
      // TODO load poster as fallback
      return cloneVideoElement(node)
    }
    if (
      options.fakeTextInputs &&
      node === ownerDoc.activeElement &&
      (node instanceof nodeWindow.HTMLInputElement ||
        node instanceof nodeWindow.HTMLTextAreaElement)
    ) {
      return cloneTextInputElement(node)
    }
  }

  return Promise.resolve(node.cloneNode(false) as T)
}

const isSlotElement = (node: HTMLElement): node is HTMLSlotElement =>
  node.tagName != null && node.tagName.toUpperCase() === 'SLOT'

async function cloneChildren<T extends HTMLElement>(
  nativeNode: T,
  clonedNode: T,
  options: Options,
): Promise<T> {
  const children =
    isSlotElement(nativeNode) && nativeNode.assignedNodes
      ? toArray<T>(nativeNode.assignedNodes())
      : toArray<T>((nativeNode.shadowRoot ?? nativeNode).childNodes)

  // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
  const nodeWindow = nativeNode?.ownerDocument?.defaultView

  if (
    children.length === 0 ||
    (nodeWindow && nativeNode instanceof nodeWindow.HTMLVideoElement)
  ) {
    return Promise.resolve(clonedNode)
  }

  return children
    .reduce(
      (deferred, child) =>
        deferred
          // eslint-disable-next-line no-use-before-define
          .then(() => cloneNode(child, options))
          .then((clonedChild: HTMLElement | null) => {
            // eslint-disable-next-line promise/always-return
            if (clonedChild) {
              clonedNode.appendChild(clonedChild)
            }
          }),
      Promise.resolve(),
    )
    .then(() => clonedNode)
}

function cloneCSSStyle<T extends HTMLElement>(nativeNode: T, clonedNode: T) {
  const source =
    nativeNode?.ownerDocument?.defaultView?.getComputedStyle(nativeNode)
  const target = clonedNode.style

  if (!source || !target) {
    return
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
  let cssText = ''
  for (let i = 0; i < source.length; i += 1) {
    const name = source[i]
    // target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
    cssText += `${name}:${source.getPropertyValue(
      name,
    )} ${source.getPropertyPriority(name)};`
  }

  target.cssText = cssText
}

function cloneInputValue<T extends HTMLElement>(
  nativeNode: T,
  clonedNode: T,
  options: Options,
) {
  // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
  const ownerDoc = nativeNode?.ownerDocument
  const nodeWindow = ownerDoc?.defaultView

  if (!nodeWindow) {
    return
  }

  if (options.fakeTextInputs && ownerDoc.activeElement === nativeNode) {
    const isInput = nativeNode instanceof nodeWindow.HTMLInputElement
    if (isInput || nativeNode instanceof nodeWindow.HTMLTextAreaElement) {
      clonedNode.style.overflow = 'hidden'
      clonedNode.style.verticalAlign = 'top'

      if (isInput) {
        clonedNode.style.whiteSpace = 'nowrap'
      }
    }
  } else {
    if (nativeNode instanceof nodeWindow.HTMLTextAreaElement) {
      const clonedTextArea = clonedNode as unknown as HTMLTextAreaElement
      clonedTextArea.innerHTML = nativeNode.value
    }

    if (nativeNode instanceof nodeWindow.HTMLInputElement) {
      const clonedInput = clonedNode as unknown as HTMLInputElement
      clonedInput.setAttribute('value', nativeNode.value)
    }
  }
}

function cloneScrollPosition<T extends HTMLElement>(
  nativeNode: T,
  clonedNode: T,
) {
  // If element is not scrolled, we don't need to move the children.
  if (nativeNode.scrollTop === 0 && nativeNode.scrollLeft === 0) {
    return
  }

  // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
  const nodeWindow = nativeNode?.ownerDocument?.defaultView

  // Don't do anything for textarea and input, they are handled in a special
  // case
  if (
    !nodeWindow ||
    ((nativeNode instanceof nodeWindow.HTMLTextAreaElement ||
      nativeNode instanceof nodeWindow.HTMLInputElement) &&
      clonedNode instanceof nodeWindow.HTMLDivElement)
  ) {
    return
  }

  for (let i = 0; i < clonedNode.children.length; i += 1) {
    const child = clonedNode.children[i]
    if (!('style' in child)) {
      return
    }

    const element = child as HTMLElement

    // For each of the children, get the current transform and translate it with
    // the native node's scroll position.
    const { transform } = element.style
    const matrix = new DOMMatrix(transform)

    const { a, b, c, d } = matrix
    // reset rotation/skew so it wont change the translate direction.
    matrix.a = 1
    matrix.b = 0
    matrix.c = 0
    matrix.d = 1
    matrix.translateSelf(-nativeNode.scrollLeft, -nativeNode.scrollTop)
    // restore rotation and skew
    matrix.a = a
    matrix.b = b
    matrix.c = c
    matrix.d = d
    element.style.transform = matrix.toString()
  }
}

async function decorate<T extends HTMLElement>(
  nativeNode: T,
  clonedNode: T,
  options: Options,
): Promise<T> {
  // XXX https://groups.google.com/g/mozilla.dev.platform/c/bfwNKKiAxcw
  const nodeWindow = nativeNode?.ownerDocument?.defaultView

  if (!nodeWindow || !(clonedNode instanceof nodeWindow.Element)) {
    return Promise.resolve(clonedNode)
  }

  return Promise.resolve()
    .then(() => cloneCSSStyle(nativeNode, clonedNode))
    .then(() => clonePseudoElements(nativeNode, clonedNode))
    .then(() => cloneInputValue(nativeNode, clonedNode, options))
    .then(() => cloneScrollPosition(nativeNode, clonedNode))
    .then(() => clonedNode)
}

export async function cloneNode<T extends HTMLElement>(
  node: T,
  options: Options,
  isRoot?: boolean,
): Promise<T | null> {
  if (!isRoot && options.filter && !options.filter(node)) {
    return Promise.resolve(null)
  }

  return Promise.resolve(node)
    .then((clonedNode) => cloneSingleNode(clonedNode, options) as Promise<T>)
    .then((clonedNode) => cloneChildren(node, clonedNode, options))
    .then((clonedNode) => decorate(node, clonedNode, options))
}
