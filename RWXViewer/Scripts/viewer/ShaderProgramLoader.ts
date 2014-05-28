import ShaderProgram = require("ShaderProgram");

export function loadShaderProgram(gl: WebGLRenderingContext, vertexShader: string, fragmentShader: string, handler: (program: ShaderProgram.ShaderProgram) => void) {
    var shaderLocation = "/Content/Shaders/";

    $.when($.get(shaderLocation + vertexShader), $.get(shaderLocation + fragmentShader))
     .done((vertexShaderData, fragmentShaderData) => {
        handler(new ShaderProgram.ShaderProgram(gl, vertexShaderData[0], fragmentShaderData[0]));
    });
}