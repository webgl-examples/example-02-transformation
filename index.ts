import { Main } from './src/shute-technologies/main';
import { RenderLoop } from './src/shute-technologies/utils/render-loop';

(function main() {
  const framerate = 30;
  const instance = new Main();

  // This create the render loop and will call the "update" function from Main.ts, 
  // and will loop 30 times per second
  RenderLoop.create((deltaTime) => instance.update(deltaTime), framerate);
})();