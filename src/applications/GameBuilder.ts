import Game from './Game.ts'
import ImageLoaderService from '../domain/ImageLoaderService.ts'
import { AnimalPromiseImages } from '../infrastructure/types/image.ts'
import { AnimalsData, AnimalsWithImages, ImageData, SoundsData } from '../infrastructure/types/data.ts'
import KonvaFactory from '../adapters/KonvaFactory.ts'
import CanvasSizeService from '../domain/CanvasSizeService.ts'
import AudioService from '../domain/AudioService.ts'

export default class GameBuilder {
  private backgroundImage: Promise<HTMLImageElement> | null = null
  private animalImages: AnimalPromiseImages = {}

  constructor(
    private readonly imageLoaderService: ImageLoaderService,
    private readonly audioService: AudioService,
    private readonly dataAnimals: AnimalsData,
  ) {}

  loadSounds(soundData: SoundsData) {
    for (const trackName in soundData) {
      this.audioService.load(trackName, soundData[trackName])
    }

    return this
  }

  loadBackground(dataBackground: ImageData): GameBuilder {
    this.backgroundImage = this.imageLoaderService.load(
      dataBackground.src,
      dataBackground.width,
      dataBackground.height,
    )

    return this
  }

  loadImageAnimals(): GameBuilder {
    for (const animalName in this.dataAnimals) {
      const animal = this.dataAnimals[animalName]
      this.animalImages[animalName] = {
        origin: this.imageLoaderService.load(animal.src, animal.width, animal.height),
        glow: this.imageLoaderService.load(animal.glow, animal.width, animal.height),
        drop: this.imageLoaderService.load(animal.drop.src, animal.width, animal.height),
      }
    }

    return this
  }

  async build(): Promise<Game> {
    const backgroundImage =
      this.backgroundImage !== null ? await this.backgroundImage : new Image()
  
    const animalsWithImages: AnimalsWithImages = {}
    for (const animalName in this.animalImages) {
      const animalImage = this.animalImages[animalName]
      const [origin, glow, drop] = await Promise.all([
        animalImage.origin,
        animalImage.glow,
        animalImage.drop,
      ])
  
      animalsWithImages[animalName] = {
        ...this.dataAnimals[animalName],
        images: {
          origin,
          glow,
          drop,
        },
      }
    }
  
    const container = document.getElementById('app')
    const containerWidth = container?.clientWidth || window.innerWidth
    const containerHeight = container?.clientHeight || window.innerHeight
  
    const canvasSizeService = new CanvasSizeService(
      containerWidth,
      containerHeight,
      backgroundImage.width,
      backgroundImage.height,
    )
    const konvaFactory = new KonvaFactory(canvasSizeService, backgroundImage)
  
    return new Game(konvaFactory, this.audioService, animalsWithImages)
  }
}
