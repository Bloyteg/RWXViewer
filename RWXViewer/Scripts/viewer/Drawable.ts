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
import ShaderProgram = require("ShaderProgram");

export interface IDrawable {
    draw(gl: WebGLRenderingContext, shaders: ShaderProgram.ShaderProgram[]): void;
}

export interface IVertexBuffer {
    vertexPositions: WebGLBuffer;
    vertexUVs: WebGLBuffer;
    vertexNormals: WebGLBuffer;

    vertexCount: number;
}

export interface IIndexBuffer {
    indexBuffer: WebGLBuffer;
    indexCount: number;
}

export interface IMeshMaterialGroup {
    vertexBuffer: IVertexBuffer;
    indexBuffer: IIndexBuffer;
}

export class MeshDrawable implements IDrawable {
    private _meshMaterialGroups: IMeshMaterialGroup[];
    private _modelMatrix: Mat4Array;
    private _children: IDrawable[];

    constructor(meshMaterialGroups: IMeshMaterialGroup[], modelMatrix: Mat4Array, children: IDrawable[]) {
        this._meshMaterialGroups = meshMaterialGroups;
        this._modelMatrix = modelMatrix;
        this._children = children;
    }

    draw(gl: WebGLRenderingContext, shaders: ShaderProgram.ShaderProgram[]): void {
        //TODO: Handle any material specific parameters such as prelit, wireframe, texture bindings, etc.

        this._meshMaterialGroups.forEach(meshMaterialGroup => {
            gl.uniformMatrix4fv(shaders[0].uniforms["u_modelMatrix"], false, this._modelMatrix);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.vertexPositions);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(shaders[0].attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.vertexUVs);
            gl.vertexAttribPointer(shaders[0].attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.vertexNormals);
            gl.vertexAttribPointer(shaders[0].attributes["a_vertexNormal"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshMaterialGroup.indexBuffer.indexBuffer);
            gl.drawElements(gl.TRIANGLES, meshMaterialGroup.indexBuffer.indexCount, gl.UNSIGNED_SHORT, 0);
        });

        this._children.forEach(child => child.draw(gl, shaders));
    }
}