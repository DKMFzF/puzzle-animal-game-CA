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
  private timerInterval: number | null = null
  private isGameStarted: boolean = false // Флаг для отслеживания начала игры

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
  }

  start() {
    this.score = Object.keys(this.animalsWithImages).length
    this.isGameStarted = false // Игра еще не начата

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
    this.isGameStarted = false // Сбрасываем флаг при рестарте

    // Останавливаем интервал при рестарте
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

    // Останавливаем интервал при завершении игры
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    if (this.timerElement) {
      const elapsedTime = this.stopwatch.getElapsedTime() / 1000
      this.timerElement.textContent = `Время: ${elapsedTime.toFixed(2)} сек`
    }

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
      this.timerElement.textContent = `Time: ${elapsedTime.toFixed(2)} second`
    }
  }

  update(eventType: EAnimalEvents, data?: any): void {
    if (eventType === EAnimalEvents.DRAG_START && !this.isGameStarted) this.startTimer()
    if (eventType === EAnimalEvents.DRAG_END && data?.success) this.onChangeScore()
  }
}
