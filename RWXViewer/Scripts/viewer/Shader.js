define(["require", "exports"], function(require, exports) {
    var ShaderProgram = (function () {
        function ShaderProgram(gl, vertexShaderSource, pixelShaderSource) {
            this.gl = gl;
        }
        ShaderProgram.prototype.compileShader = function (shaderSource, type) {
            var gl = this.gl;
            var shader = gl.createShader(type);

            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            }

            throw new Error("Failed to compile the given shader of type: " + type);
        };
        return ShaderProgram;
    })();
    exports.ShaderProgram = ShaderProgram;
});
//# sourceMappingURL=Shader.js.map
