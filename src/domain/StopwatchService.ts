export default class Stopwatch {
  private startTime: number | null = null
  private endTime: number | null = null

  start() {
    this.startTime = Date.now()
    this.endTime = null
  }

  stop() {
    if (this.startTime === null) {
      throw new Error('Stopwatch has not been started.')
    }
    this.endTime = Date.now()
  }

  getElapsedTime(): number {
    if (this.startTime === null) {
      throw new Error('Stopwatch has not been started.')
    }
    const endTime = this.endTime || Date.now()
    return endTime - this.startTime
  }

  reset() {
    this.startTime = null
    this.endTime = null
  }
}
