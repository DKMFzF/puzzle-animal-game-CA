import { dataAnimals, dataBackground, soundsData } from '../infrastructure/config.ts';
import ImageLoaderService from '../domain/ImageLoaderService.ts';
import GameBuilder from './GameBuilder.ts';
import AudioService from '../domain/AudioService.ts';
import ConfettiService from '../domain/ConfettiService.ts';

export default class App {
  private audioService: AudioService;
  private gameBuilder: GameBuilder;
  private confettiService: ConfettiService;

  constructor() {
    this.audioService = new AudioService('/sound/');
    this.gameBuilder = new GameBuilder(new ImageLoaderService(), this.audioService, dataAnimals);
    this.confettiService = new ConfettiService();
  }

  async initialize() {
    const game = await this.gameBuilder
      .loadSounds(soundsData)
      .loadBackground(dataBackground)
      .loadImageAnimals()
      .build();

    game.start();

    this.setupEventListeners(game);
  }

  private setupEventListeners(game: any) {
    document.querySelector('#restart')?.addEventListener('click', () => {
      game.restart();
    });

    const button = document.querySelector('#mute') as HTMLButtonElement;
    button.addEventListener('click', (e: MouseEvent) => {
      const isMute = this.audioService.toggleSound();
      const button = e.target as HTMLButtonElement;
      button.textContent = `Sound ${isMute ? '❌' : '🔉'}`;
    });

    game.onEndGame(() => {
      setTimeout(() => this.confettiService.start(3), 0);
    });
  }
}
