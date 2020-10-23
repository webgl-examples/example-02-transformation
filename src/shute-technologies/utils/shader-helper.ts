export class ShaderHelper {

  static initShaderProgram(GL: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
    const vertexShader = ShaderHelper.loadShader(GL, GL.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = ShaderHelper.loadShader(GL, GL.FRAGMENT_SHADER, fragmentShaderSource);
  
    // Create the shader program
    const shaderProgram = GL.createProgram();
    GL.attachShader(shaderProgram, vertexShader);
    GL.attachShader(shaderProgram, fragmentShader);
    GL.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!GL.getProgramParameter(shaderProgram, GL.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + GL.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }

  private static loadShader(GL: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = GL.createShader(type);
  
    // Send the source to the shader object
    GL.shaderSource(shader, source);
  
    // Compile the shader program
    GL.compileShader(shader);
  
    // See if it compiled successfully
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + GL.getShaderInfoLog(shader));
      GL.deleteShader(shader);
      return null;
    }
  
    return shader;
  }
}
