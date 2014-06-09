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
import ShaderProgram = require("ShaderProgram");
import Camera = require("Camera");

export class Renderer {
    private _canvas: HTMLCanvasElement;
    private _gl: WebGLRenderingContext;
    private _currentDrawable: Drawable.IDrawable;
    private _spatialGridDrawable: Drawable.IDrawable;
    private _spatialGridShaderProgram: ShaderProgram.ShaderProgram;
    private _shaderProgram: ShaderProgram.ShaderProgram;
    private _camera: Camera.Camera;
    private _projectionMatrix: Mat4Array = mat4.create();

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    initialize() {
        var canvas = this._canvas;
        var glOptions: any = { preserveDrawingBuffer: true };
        this._gl = <WebGLRenderingContext>(canvas.getContext("webgl", glOptions) || canvas.getContext("experimental-webgl", glOptions));
        var gl = this._gl;

        if (gl) {
            this._camera = new Camera.Camera(gl.drawingBufferWidth, gl.drawingBufferHeight);
            this._spatialGridDrawable = new Drawable.SpatialGridDrawable(gl);

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clearColor(0.75, 0.75, 0.75, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            //gl.enable(gl.BLEND);
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        }

        var deferred = $.Deferred<void>();

        var shaderProgram = ShaderProgramLoader.loadShaderProgram(gl, "vertexShader.glsl", "fragmentShader.glsl");
        var spatialGridShaderProgram = ShaderProgramLoader.loadShaderProgram(gl, "SpatialGridVertexShader.glsl", "SpatialGridFragmentShader.glsl");

        $.when(shaderProgram, spatialGridShaderProgram).done((program, spatialGridProgram) => {
            this._shaderProgram = program;
            this._spatialGridShaderProgram = spatialGridProgram;
            deferred.resolve();
        }).fail(() => deferred.fail());

        return deferred.promise(this);
    }

    draw(): void {
        var gl = this._gl;

        if (gl) {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.CULL_FACE);
            mat4.perspective(this._projectionMatrix, 45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100.0);

            //TODO: Handle vertex attribute enable/disable more cleanly.
            this._spatialGridShaderProgram.use(program => {
                gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, this._projectionMatrix);
                gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, this._camera.matrix);
                this._spatialGridDrawable.draw(gl, program);
            });

            this._shaderProgram.use(program => {
                if (this._currentDrawable) {
                    gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, this._projectionMatrix);
                    gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, this._camera.matrix);
                    this._currentDrawable.draw(gl, program);
                }
            });
        }
    }

    setCurrentModel(model: Model.IModel, textures: Model.IImageCollection): void {
        if (model) {
            this._currentDrawable = DrawableBuilder.createDrawableFromModel(this._gl, model, textures);
        } else {
            this._currentDrawable = null;
        }
    }

    get camera(): Camera.Camera {
        return this._camera;
    }
}
