import { ShaderHelper } from './utils/shader-helper';
import { SimpleShader } from './shaders-source/simple-shader';
import { mat4, vec3 } from 'gl-matrix';

export class Main {

  private static readonly AppWidth = 640;
  private static readonly AppHeight = 480;

  private _GL: WebGLRenderingContext;

  // shader program info object
  private _shaderProgramInfo: {};
  // WebGL buffers
  private _webglBuffer: WebGLBuffer;
  // Transformations Matrix
  private _projectionMatrix: mat4;

  private _x: number;
  private _y: number;
  private _z: number;
  private _scaleX: number;
  private _scaleY: number;
  private _scaleZ: number;
  private _rotationZ: number;

  constructor() {
    this.initializeWebGLContext();
    this.loadShader(this._GL);
    this.initializeWebGLBuffers(this._GL);

    // Newly created function for creation of trnasformation Matrix
    this.createTransformationMatrix();
  }

  private initializeWebGLContext(): void {
    // Get the Canvas Element
    const canvas = document.querySelector("#webgl-canvas") as HTMLCanvasElement;

    // Initialize the GL Context
    this._GL = canvas.getContext('webgl');

    if (this._GL === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }
  }

  private loadShader(GL: WebGLRenderingContext): void {
    // initialize the Shader Program in GPU using the sources in: SimpleShader.ts
    const shaderProgram = ShaderHelper.initShaderProgram(
      GL, 
      SimpleShader.vertexShaderSource, 
      SimpleShader.fragmentShaderSource
    );

    // Now we need to look up the locations that WebGL assied to our inputs (the attributes and uniforms)
    this._shaderProgramInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: GL.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        projectionMatrix: GL.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: GL.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      },
    };
  }

  // This is the buffer where we store the vertices we want to show on screen
  private initializeWebGLBuffers(GL: WebGLRenderingContext): void {
    // Create a buffer for the square's positions.
    this._webglBuffer = GL.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    GL.bindBuffer(GL.ARRAY_BUFFER, this._webglBuffer);

    // Now create an array of positions for the square (vertices).
    const positions = [
      -1.0,  1.0,
      1.0,  1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    GL.bufferData(GL.ARRAY_BUFFER,
      new Float32Array(positions),
      GL.STATIC_DRAW);
  }

  private createTransformationMatrix(): void {
    this._x = 0;
    this._y = 0;
    this._z = -8;
    this._scaleX = 1;
    this._scaleY = 1;
    this._scaleZ = 1;
    this._rotationZ = 0;

    // This will create an identity Matrix
    this._projectionMatrix = mat4.create();
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = Main.AppWidth / Main.AppHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(this._projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  }

  private drawScene(GL: WebGLRenderingContext, programInfo, buffers: WebGLBuffer, worldMatrix: mat4): void {
    GL.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    GL.clearDepth(1.0);                 // Clear everything
    GL.enable(GL.DEPTH_TEST);           // Enable depth testing
    GL.depthFunc(GL.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    const numComponents = 2;  // pull out 2 values per iteration
    const type = GL.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    GL.bindBuffer(GL.ARRAY_BUFFER, buffers);
    GL.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    GL.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    
    // Tell WebGL to use our program when drawing
    GL.useProgram(programInfo.program);
  
    // Set the shader uniforms
    GL.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        this._projectionMatrix);
    GL.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        worldMatrix);
  
    const vertexCount = 4;
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, vertexCount);
  }

  update(dt: number): void {
    // update values
    this._rotationZ += 0.1;
    this._x += 0.03;
    this._y += 0.01;
    this._z -= 0.03;
    this._scaleX += 0.025;
    this._scaleY -= 0.001;

    // variables
    const worldMatrix = mat4.create();
    const rotationMatrix = mat4.create();

    // For: Scaling
    mat4.fromScaling(worldMatrix, vec3.fromValues(this._scaleX, this._scaleY, this._scaleZ));

    // For: Rotate in z-axis
    mat4.fromZRotation(rotationMatrix, this._rotationZ);
    mat4.multiply(worldMatrix, worldMatrix, rotationMatrix);

    // For: Translation in X, Y and Z
    // We can see this reference of how to interact with the matrix for working with the translation
    // reference: https://docs.huihoo.com/flex/4/flash/geom/Matrix3D.html
    worldMatrix[12] = this._x; // x-axis
    worldMatrix[13] = this._y; // y-axis
    worldMatrix[14] = this._z; // z-axis

    // now we are passing the worldMatrix variable so can apply the transformation in the Shader
    this.drawScene(this._GL, this._shaderProgramInfo, this._webglBuffer, worldMatrix);
  }
}
