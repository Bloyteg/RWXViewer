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
define(["require", "exports", "DrawableBuilder"], function(require, exports, DrawableBuilder) {
    var Renderer = (function () {
        function Renderer(canvas, shaderScripts) {
            this.initialize(canvas);
            this.initializeShaders(shaderScripts);
        }
        Renderer.prototype.initialize = function (canvas) {
            this.gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
            var gl = this.gl;

            if (gl) {
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
            }
        };

        Renderer.prototype.initializeShaders = function (shaderScripts) {
            var compiledShaders = {};
            var gl = this.gl;

            shaderScripts.forEach(function (shaderScript) {
                var shaderName = shaderScript.id;
                var shaderContents = shaderScript.innerText;
                var shaderType = shaderScript.type;
                var shader;

                if (shaderType === "x-shader/x-fragment") {
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                } else if (shaderType === "x-shader/x-vertex") {
                    shader = gl.createShader(gl.VERTEX_SHADER);
                } else {
                    return;
                }

                gl.shaderSource(shader, shaderContents);
                gl.compileShader(shader);

                if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    compiledShaders[shaderName] = shader;
                }
            });

            this.shaders = compiledShaders;
        };

        Renderer.prototype.draw = function () {
            var gl = this.gl;

            if (gl) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                if (this.currentDrawable) {
                    //    this.currentDrawable.draw();
                }
            }
        };

        Renderer.prototype.setCurrentModel = function (model) {
            var builder = new DrawableBuilder.DrawableBuilder(this.gl);
            this.currentDrawable = builder.loadModel(model);
        };
        return Renderer;
    })();
    exports.Renderer = Renderer;
});
//# sourceMappingURL=Renderer.js.map
