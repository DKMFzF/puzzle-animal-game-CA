import KonvaFactory from '../adapters/KonvaFactory.ts'
import { AnimalsWithImages } from '../infrastructure/types/data.ts'
import AnimalManager from './AnimalManager.ts'
import AnimalEventObserver, { EAnimalEvents } from '../infrastructure/types/AnimalEventObserver.ts'
import AudioService from '../domain/AudioService.ts'
import { Layer } from 'konva/lib/Layer'
import Stopwatch from '../domain/StopwatchService.ts'

export default class Game implements AnimalEventObserver {
  private score = 0
  private readonly animalDropLayer: Layer
  private readonly animalLayer: Layer
  private endGameCallback = (): void => {}
  private stopwatch: Stopwatch
  private timerElement: HTMLElement | null
  private lastTryElement: HTMLElement | null
  private timerInterval: number | null = null
  private isGameStarted: boolean = false

  constructor(
    private readonly konvaFactory: KonvaFactory,
    private readonly audioService: AudioService,
    private readonly animalsWithImages: AnimalsWithImages,
  ) {
    const stage = this.konvaFactory.createStage()
    const backgroundLayer = this.konvaFactory.createLayer()
    this.animalDropLayer = this.konvaFactory.createLayer()
    this.animalLayer = this.konvaFactory.createLayer()

    stage.add(backgroundLayer)
    stage.add(this.animalDropLayer)
    stage.add(this.animalLayer)

    backgroundLayer.add(this.konvaFactory.createBackgroundImage())

    this.stopwatch = new Stopwatch()
    this.timerElement = document.getElementById('timer')
    this.lastTryElement = document.getElementById('last-try') // Элемент для отображения последнего времени

    // Загружаем последнее время из localStorage при инициализации
    this.loadLastTryTime()
  }

  start() {
    this.score = Object.keys(this.animalsWithImages).length
    this.isGameStarted = false

    for (let animalName in this.animalsWithImages) {
      const animalData = this.animalsWithImages[animalName]
      const konvaAnimal = this.konvaFactory.createImage(animalData)
      const konvaAnimalDrop = this.konvaFactory.createDropImage(animalData)

      const animalManager = new AnimalManager(
        konvaAnimal,
        konvaAnimalDrop,
        animalData.images.origin,
        animalData.images.glow,
      )
      animalManager.subscribe(this)
      animalManager.subscribe(this.audioService)

      this.animalDropLayer.add(konvaAnimalDrop)
      this.animalLayer.add(konvaAnimal)
    }
  }

  restart() {
    this.animalDropLayer.destroyChildren()
    this.animalLayer.destroyChildren()
    this.stopwatch.reset()
    this.isGameStarted = false

    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    this.start()
  }

  onEndGame(fn: () => void) {
    this.endGameCallback = fn
  }

  onChangeScore() {
    if (--this.score !== 0) {
      return
    }

    this.stopwatch.stop()

    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    const elapsedTime = this.stopwatch.getElapsedTime() / 1000

    if (this.timerElement) {
      this.timerElement.textContent = `Time: ${elapsedTime.toFixed(2)} s`
    }

    // Сохраняем время в localStorage
    this.saveLastTryTime(elapsedTime)

    this.audioService.playWin()
    this.endGameCallback()
  }

  private startTimer() {
    if (!this.isGameStarted) {
      this.isGameStarted = true
      this.stopwatch.start()
      this.timerInterval = setInterval(() => this.updateTimer(), 1000)
    }
  }

  private updateTimer() {
    if (this.timerElement) {
      const elapsedTime = this.stopwatch.getElapsedTime() / 1000
      this.timerElement.textContent = `Time: ${elapsedTime.toFixed(2)} s`
    }
  }

  private saveLastTryTime(time: number) {
    localStorage.setItem('lastTryTime', time.toFixed(2)) // Сохраняем время в localStorage
    this.updateLastTryDisplay() // Обновляем отображение последнего времени
  }

  private loadLastTryTime() {
    const lastTryTime = localStorage.getItem('lastTryTime')
    if (lastTryTime && this.lastTryElement) {
      this.lastTryElement.textContent = `Last Try: ${lastTryTime} s`
    }
  }

  private updateLastTryDisplay() {
    const lastTryTime = localStorage.getItem('lastTryTime')
    if (lastTryTime && this.lastTryElement) {
      this.lastTryElement.textContent = `Last Try: ${lastTryTime} s`
    }
  }

  update(eventType: EAnimalEvents, data?: any): void {
    if (eventType === EAnimalEvents.DRAG_START && !this.isGameStarted) this.startTimer()
    if (eventType === EAnimalEvents.DRAG_END && data?.success) this.onChangeScore()
  }
}
