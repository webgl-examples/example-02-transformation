import { Callback } from "./types";

export class RenderLoop {
  private readonly _gameLoopInterval: NodeJS.Timeout;
  private readonly _functionLoop: Callback<number>;
  private readonly _framerate: number;

  private _lastTime: number;

  private constructor(functionLoop: Callback<number>, framerate: number) {
    this._framerate = framerate;
    this._functionLoop = functionLoop;
    this._lastTime = new Date().getTime();
    this._gameLoopInterval = setInterval(() => this.internalLoop(), 1000 / this._framerate);
  }

  private internalLoop(): void {
    const currentTime = new Date().getTime();
    const deltaTime = (currentTime - this._lastTime) / 1000;
    this._lastTime = currentTime;
    
    this._functionLoop(deltaTime);
  }

  static create(functionLoop: Callback<number>, framerate = 30): RenderLoop {
    return new RenderLoop(functionLoop, framerate);
  }
}
