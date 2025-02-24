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
    // Увеличиваем размер canvas на 10% (можно изменить коэффициент)
    const paddingFactor = 1.10 // 10% увеличение
    const paddedWidth = containerWidth * paddingFactor
    const paddedHeight = containerHeight * paddingFactor

    const imageAspect = backgroundWidth / backgroundHeight
    const containerAspect = paddedWidth / paddedHeight

    let newWidth = 0,
      newHeight = 0
    if (imageAspect > containerAspect) {
      newWidth = paddedWidth
      newHeight = newWidth / imageAspect
    } else {
      newHeight = paddedHeight
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