// Copyright 2014 Joshua R. Rodgers
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Model = require("Model");
import DrawableBuilder = require("DrawableBuilder");
import Drawable = require("Drawable");
import ShaderProgramLoader = require("ShaderProgramLoader");

export class Renderer {
    private _gl: WebGLRenderingContext;
    private _currentDrawable: Drawable.IDrawable;

    constructor(canvas: HTMLCanvasElement) {
        this.initialize(canvas);
    }

    private initialize(canvas: HTMLCanvasElement) {
        this._gl = <WebGLRenderingContext>(canvas.getContext("webgl") || canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
        var gl = this._gl;

        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        }

        ShaderProgramLoader.loadShaderProgram(gl, "vertexShader.glsl", "fragmentShader.glsl").done(program => console.log(program));
    }

    draw(): void {
        var gl = this._gl;

        if (gl) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if (this._currentDrawable) {
                this._currentDrawable.draw();
            }
        }
    }

    setCurrentModel(model: Model.IModel): void {
        var builder = new DrawableBuilder.DrawableBuilder(this._gl);
        this._currentDrawable = builder.loadModel(model);
    }
}