import { uuid, toArray } from './util'

type Pseudo = ':before' | ':after'

function formatCSSText(style: CSSStyleDeclaration) {
  const content = style.getPropertyValue('content')
  return `${style.cssText} content: '${content.replace(/'|"/g, '')}';`
}

function formatCSSProperties(style: CSSStyleDeclaration) {
  return toArray<string>(style)
    .map((name) => {
      const value = style.getPropertyValue(name)
      const priority = style.getPropertyPriority(name)

      return `${name}: ${value}${priority ? ' !important' : ''};`
    })
    .join(' ')
}

function getPseudoElementStyle(
  className: string,
  pseudo: Pseudo,
  style: CSSStyleDeclaration,
  ownerDoc: HTMLDocument,
): Text {
  const selector = `.${className}:${pseudo}`
  const cssText = style.cssText
    ? formatCSSText(style)
    : formatCSSProperties(style)

  return ownerDoc.createTextNode(`${selector}{${cssText}}`)
}

function clonePseudoElement<T extends HTMLElement>(
  nativeNode: T,
  clonedNode: T,
  pseudo: Pseudo,
) {
  const ownerDoc = nativeNode?.ownerDocument

  if (!ownerDoc) {
    return
  }

  const style = ownerDoc?.defaultView?.getComputedStyle(nativeNode, pseudo)

  if (!style) {
    return
  }

  const content = style.getPropertyValue('content')
  if (content === '' || content === 'none') {
    return
  }

  const className = uuid()

  try {
    clonedNode.className = `${clonedNode.className} ${className}`
  } catch (err) {
    return
  }

  const styleElement = ownerDoc.createElement('style')
  styleElement.appendChild(
    getPseudoElementStyle(className, pseudo, style, ownerDoc),
  )
  clonedNode.appendChild(styleElement)
}

export function clonePseudoElements<T extends HTMLElement>(
  nativeNode: T,
  clonedNode: T,
) {
  clonePseudoElement(nativeNode, clonedNode, ':before')
  clonePseudoElement(nativeNode, clonedNode, ':after')
}
