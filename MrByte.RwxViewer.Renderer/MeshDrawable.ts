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

module RwxViewer {
    //TODO: Both this and IMeshMaterialGroup need to be less glorp-tastic.
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

    //TODO: Handle prelit meshes.
    export class MeshDrawable implements IDrawable {
        private _meshMaterialGroups: IMeshMaterialGroup[];
        private _modelMatrix: Mat4Array;
        private _children: IDrawable[];
        private _isBillboard: boolean;

        constructor(meshMaterialGroups: IMeshMaterialGroup[], modelMatrix: Mat4Array, children: IDrawable[], isBillboard?: boolean) {
            this._meshMaterialGroups = meshMaterialGroups;
            this._modelMatrix = modelMatrix;
            this._children = children;
            this._isBillboard = isBillboard || false;
        }

        cloneWithTransform(matrix: Mat4Array) {
            var newTransformMatrix = mat4.clone(this._modelMatrix);
            mat4.mul(newTransformMatrix, matrix, newTransformMatrix);

            return new MeshDrawable(this._meshMaterialGroups, newTransformMatrix, this._children.map(child => child instanceof MeshDrawable ? (<MeshDrawable>child).cloneWithTransform(matrix) : child));
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram): void {
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

        setTransformUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, this._modelMatrix);

            gl.uniform1i(shader.uniforms["u_isBillboard"], this._isBillboard ? 1 : 0);
        }

        setMaterialUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
            gl.uniform1f(shader.uniforms["u_ambientFactor"], meshMaterialGroup.ambient);
            gl.uniform1f(shader.uniforms["u_diffuseFactor"], meshMaterialGroup.diffuse);
            gl.uniform4fv(shader.uniforms["u_baseColor"], meshMaterialGroup.baseColor);
            gl.uniform1f(shader.uniforms["u_opacity"], meshMaterialGroup.opacity);
        }

        //TODO: Refactor this logic off into ITexture types.
        bindTexture(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
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

        //TODO: Refactor this off into ITexture types.
        bindMask(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
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

        //TODO: Refactor this off into IVertexBuffer types.
        bindVertexBuffers(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup) {
            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.positions);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.uvs);
            gl.vertexAttribPointer(shader.attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.normals);
            gl.vertexAttribPointer(shader.attributes["a_vertexNormal"], 3, gl.FLOAT, true, 0, 0);
        }
    }
}