define(["require", "exports", "ShaderProgram"], function(require, exports, ShaderProgram) {
    function loadShaderProgram(gl, vertexShader, fragmentShader, handler) {
        var shaderLocation = "/Content/Shaders/";

        $.when($.get(shaderLocation + vertexShader), $.get(shaderLocation + fragmentShader)).done(function (vertexShaderData, fragmentShaderData) {
            handler(new ShaderProgram.ShaderProgram(gl, vertexShaderData[0], fragmentShaderData[0]));
        });
    }
    exports.loadShaderProgram = loadShaderProgram;
});
//# sourceMappingURL=ShaderProgramLoader.js.map
