import ShaderProgram = require("ShaderProgram");

export function loadShaderProgram(gl: WebGLRenderingContext, vertexShader: string, fragmentShader: string) {
    var shaderLocation = "/Content/Shaders/";
    var deferred = $.Deferred<ShaderProgram.ShaderProgram>();

    $.when($.get(shaderLocation + vertexShader),
           $.get(shaderLocation + fragmentShader))
         .done((vertexShaderData, fragmentShaderData) => deferred.resolve(new ShaderProgram.ShaderProgram(gl, vertexShaderData[0], fragmentShaderData[0])))
         .fail(() => deferred.fail());

    return deferred.promise();
}