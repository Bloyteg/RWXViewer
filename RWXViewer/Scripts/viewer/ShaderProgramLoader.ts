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