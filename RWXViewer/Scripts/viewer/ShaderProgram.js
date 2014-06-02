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
define(["require", "exports"], function(require, exports) {
    

    var ShaderProgram = (function () {
        function ShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
            this._gl = gl;
            this._shaderProgram = this.initializeProgram(vertexShaderSource, fragmentShaderSource);
            this._uniforms = this.getUniforms();
            this._attributes = this.getAttributes();
        }
        ShaderProgram.prototype.initializeProgram = function (vertexShaderSource, fragmentShaderSource) {
            var gl = this._gl;
            var vertexShader = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
            var fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramParameter(shaderProgram, gl.LINK_STATUS));
            }

            return shaderProgram;
        };

        ShaderProgram.prototype.getUniforms = function () {
            var gl = this._gl;

            var totalUniforms = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_UNIFORMS);
            var uniforms = {};

            for (var uniformIndex = 0; uniformIndex < totalUniforms; ++uniformIndex) {
                var uniform = gl.getActiveUniform(this._shaderProgram, uniformIndex);
                uniforms[uniform.name] = gl.getUniformLocation(this._shaderProgram, uniform.name);
            }

            return uniforms;
        };

        ShaderProgram.prototype.getAttributes = function () {
            var gl = this._gl;
            var attributeCount = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_ATTRIBUTES);
            var attributes = {};

            for (var attributeIndex = 0; attributeIndex < attributeCount; ++attributeIndex) {
                var attribute = gl.getActiveAttrib(this._shaderProgram, attributeIndex);
                attributes[attribute.name] = attributeIndex;
                gl.enableVertexAttribArray(attributeIndex);
            }

            return attributes;
        };

        Object.defineProperty(ShaderProgram.prototype, "attributes", {
            get: function () {
                return this._attributes;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ShaderProgram.prototype, "uniforms", {
            get: function () {
                return this._uniforms;
            },
            enumerable: true,
            configurable: true
        });

        ShaderProgram.prototype.compileShader = function (shaderSource, type) {
            var gl = this._gl;
            var shader = gl.createShader(type);

            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            }

            throw new Error(gl.getShaderInfoLog(shader));
        };

        ShaderProgram.prototype.useProgram = function () {
            this._gl.useProgram(this._shaderProgram);
        };
        return ShaderProgram;
    })();
    exports.ShaderProgram = ShaderProgram;
});
//# sourceMappingURL=ShaderProgram.js.map
