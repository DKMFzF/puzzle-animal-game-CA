export default class CanvasSizeService {
  private readonly width: number
  private readonly height: number
  private readonly scale: number

  constructor(
    containerWidth: number,
    containerHeight: number,
    backgroundWidth: number,
    backgroundHeight: number,
  ) {
    const imageAspect = backgroundWidth / backgroundHeight
    const containerAspect = containerWidth / containerHeight

    let newWidth = 0,
      newHeight = 0
    if (imageAspect > containerAspect) {
      newWidth = containerWidth
      newHeight = newWidth / imageAspect
    } else {
      newHeight = containerHeight
      newWidth = newHeight * imageAspect
    }

    this.width = newWidth
    this.height = newHeight

    this.scale = newWidth / backgroundWidth
  }

  getWidth(): number {
    return this.width
  }
  getHeight(): number {
    return this.height
  }
  getScale(): number {
    return this.scale
  }
}
