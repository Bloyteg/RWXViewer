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
define(["require", "exports", "DrawableBuilder", "ShaderProgramLoader", "Camera"], function(require, exports, DrawableBuilder, ShaderProgramLoader, Camera) {
    var Renderer = (function () {
        function Renderer(canvas) {
            this._canvas = canvas;
            this._camera = new Camera.Camera();
        }
        Renderer.prototype.initialize = function () {
            var _this = this;
            var canvas = this._canvas;
            this._gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
            var gl = this._gl;

            if (gl) {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
            }

            var deferred = $.Deferred();

            //TODO: Improve this so that it loads multiple shaders and stores them in a string -> ShaderProgram index.
            ShaderProgramLoader.loadShaderProgram(gl, "vertexShader.glsl", "fragmentShader.glsl").done(function (program) {
                _this._shaderPrograms = [program];
                deferred.resolve();
            }).fail(function (_) {
                return deferred.fail();
            });

            return deferred.promise(this);
        };

        Renderer.prototype.draw = function () {
            var gl = this._gl;

            if (gl) {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                this._shaderPrograms[0].useProgram();

                var pMatrix = mat4.create();
                mat4.perspective(pMatrix, 45, 960 / 540, 0.1, 100.0);

                gl.uniformMatrix4fv(this._shaderPrograms[0].uniforms["uPMatrix"], false, pMatrix);
                gl.uniformMatrix4fv(this._shaderPrograms[0].uniforms["uCMatrix"], false, this._camera.cameraMatrix);

                if (this._currentDrawable) {
                    this._currentDrawable.draw(gl, this._shaderPrograms);
                }
            }
        };

        Renderer.prototype.setCurrentModel = function (model) {
            var builder = new DrawableBuilder.DrawableBuilder(this._gl);
            this._currentDrawable = builder.loadModel(model);
        };

        Renderer.prototype.setMouseDeltas = function (deltaX, deltaY) {
            this._camera.rotateCamera(deltaX, deltaY);
        };
        return Renderer;
    })();
    exports.Renderer = Renderer;
});
//# sourceMappingURL=Renderer.js.map
