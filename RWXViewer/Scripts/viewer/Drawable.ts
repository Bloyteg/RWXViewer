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
    draw(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram): void;
}

export interface IVertexBuffer {
    positions: WebGLBuffer;
    uvs: WebGLBuffer;
    normals: WebGLBuffer;
    count: number;
}

export interface IMeshMaterialGroup {
    vertexBuffer: IVertexBuffer;
    baseColor: Vec4Array;
    ambient: number;
    diffuse: number;
    drawMode: number;
    opacity: number;
    texture: WebGLTexture;
    mask: WebGLTexture;
}

export class SpatialGridDrawable implements IDrawable {
    private _vertexBuffer: WebGLBuffer;
    private _vertexCount: number;

    constructor(gl: WebGLRenderingContext) {
        var vertices: number[] = [];

        //Generate grid lines along the X-axis.
        for (var x = -1; x <= 1; x += 0.1) {
            vertices.push(x, 0, -1);
            vertices.push(x, 0, 1);
        }

        //Generate grid lines along the Z-axis. 
        for (var z = -1; z <= 1; z += 0.1) {
            vertices.push(-1, 0, z);
            vertices.push(1, 0, z);
        }

        this._vertexCount = vertices.length / 3;
        this._vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    draw(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, this._vertexCount);
    }
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

    cloneWithTransform(matrix: Mat4Array) {
        var newTransformMatrix = mat4.clone(this._modelMatrix);
        mat4.mul(newTransformMatrix, matrix, newTransformMatrix);

        return new MeshDrawable(this._meshMaterialGroups, newTransformMatrix, this._children.map(child => child instanceof MeshDrawable ? (<MeshDrawable>child).cloneWithTransform(matrix) : child));
    }

    draw(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram): void {
        //TODO: Handle any material specific parameters such as prelit, texture bindings, etc.

        this._meshMaterialGroups.forEach((meshMaterialGroup: IMeshMaterialGroup) => {
            this.setTransformUniforms(gl, shader, meshMaterialGroup);
            this.setMaterialUniforms(gl, shader, meshMaterialGroup);
            this.bindTexture(gl, shader, meshMaterialGroup);
            this.bindMask(gl, shader, meshMaterialGroup);
            this.bindVertexBuffers(gl, shader, meshMaterialGroup);

            gl.drawArrays(meshMaterialGroup.drawMode, 0, meshMaterialGroup.vertexBuffer.count);
        });

        this._children.forEach(child => child.draw(gl, shader));
    }

    setTransformUniforms(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
        gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, this._modelMatrix);
    }

    setMaterialUniforms(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
        gl.uniform1f(shader.uniforms["u_ambientFactor"], meshMaterialGroup.ambient);
        gl.uniform1f(shader.uniforms["u_diffuseFactor"], meshMaterialGroup.diffuse);
        gl.uniform4fv(shader.uniforms["u_baseColor"], meshMaterialGroup.baseColor);
        gl.uniform1f(shader.uniforms["u_opacity"], meshMaterialGroup.opacity);
    }

    bindTexture(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
        if (meshMaterialGroup.texture !== null) {
            gl.uniform1i(shader.uniforms["u_hasTexture"], 1);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, meshMaterialGroup.texture);
            gl.uniform1i(shader.uniforms["u_textureSampler"], 0);
        } else {
            gl.uniform1i(shader.uniforms["u_hasTexture"], 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.uniform1i(shader.uniforms["u_textureSampler"], 0);
        }
    }

    bindMask(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
        if (meshMaterialGroup.mask !== null) {
            gl.uniform1i(shader.uniforms["u_hasMask"], 1);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, meshMaterialGroup.mask);
            gl.uniform1i(shader.uniforms["u_maskSampler"], 1);
        } else {
            gl.uniform1i(shader.uniforms["u_hasMask"], 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.uniform1i(shader.uniforms["u_maskSampler"], 1);
        }
    }

    bindVertexBuffers(gl: WebGLRenderingContext, shader: ShaderProgram.ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
        gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.positions);
        gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.uvs);
        gl.vertexAttribPointer(shader.attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.normals);
        gl.vertexAttribPointer(shader.attributes["a_vertexNormal"], 3, gl.FLOAT, true, 0, 0);
    }
}