import Model = require("Model");
import DrawableBuilder = require("DrawableBuilder");
import Drawable = require("Drawable");

export class Renderer {
    private gl: WebGLRenderingContext;
    private currentDrawable: Drawable.IDrawable;

    constructor(canvas: HTMLCanvasElement) {
        this.initialize(canvas);
    }

    private initialize(canvas: HTMLCanvasElement) {
        this.gl = <WebGLRenderingContext>(canvas.getContext("webgl") || canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
        var gl = this.gl;

        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        }
    }

    draw(): void {
        var gl = this.gl;

        if (gl) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if (this.currentDrawable) {
            //    this.currentDrawable.draw();
            }
        }
    }

    setCurrentModel(model: Model.IModel): void {
        var builder = new DrawableBuilder.DrawableBuilder(this.gl);
        this.currentDrawable = builder.loadModel(model);
    }
}