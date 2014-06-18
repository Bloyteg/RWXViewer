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
    export interface VertexBuffer {
        positions: WebGLBuffer;
        uvs: WebGLBuffer;
        normals: WebGLBuffer;
        count: number;
    }

    export interface DrawableMaterial {
        baseColor: Vec4Array;
        ambient: number;
        diffuse: number;
        drawMode: number;
        opacity: number;
        texture: Texture;
        mask: Texture;
    }

    export interface SubMesh {
        vertexBuffer: VertexBuffer;
        material: DrawableMaterial;
    }

    //TODO: Handle prelit meshes.
    export class MeshDrawable implements Drawable {
        private _subMeshes: SubMesh[];
        private _children: Drawable[];
        private _isBillboard: boolean;
        private _animation: Animation;
        private _jointTag: number;
        private _modelMatrix: Mat4Array;
        private _transformMatrix: Mat4Array;

        constructor(subMeshes: SubMesh[], children: Drawable[], modelMatrix: Mat4Array, jointTag: number, isBillboard?: boolean, animation?: Animation) {
            this._subMeshes = subMeshes;
            this._children = children;
            this._isBillboard = isBillboard || false;
            this._animation = animation || Animation.getDefaultAnimation();
            this._jointTag = jointTag || 0;
            this._modelMatrix = modelMatrix;
            this._transformMatrix = mat4.create();
        }

        get animation(): Animation {
            return this._animation;
        }

        cloneWithAnimation(animation: Animation) {
            return new MeshDrawable(this._subMeshes, this._children.map(child => child.cloneWithAnimation(animation)), this._modelMatrix, this._jointTag, this._isBillboard, animation); 
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix: Mat4Array, time: number): void {
            this.setTransformUniforms(gl, shader, transformMatrix, time);

            this._subMeshes.forEach((subMesh: SubMesh) => {
                this.setMaterialUniforms(gl, shader, subMesh.material);
                this.bindTexture(gl, shader, subMesh.material, time);
                this.bindMask(gl, shader, subMesh.material, time);
                this.bindVertexBuffers(gl, shader, subMesh.vertexBuffer);

                gl.drawArrays(subMesh.material.drawMode, 0, subMesh.vertexBuffer.count);
            });

            this._children.forEach(child => child.draw(gl, shader, this._transformMatrix, time));
        }

        private setTransformUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix: Mat4Array, time: number) {
            mat4.multiply(this._transformMatrix, this._modelMatrix, this._animation.getTransformForTime(this._jointTag, time));
            mat4.multiply(this._transformMatrix, transformMatrix, this._transformMatrix);

            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, this._transformMatrix);
            gl.uniform1i(shader.uniforms["u_isBillboard"], this._isBillboard ? 1 : 0);
        }

        private setMaterialUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, material: DrawableMaterial) {
            gl.uniform1f(shader.uniforms["u_ambientFactor"], material.ambient);
            gl.uniform1f(shader.uniforms["u_diffuseFactor"], material.diffuse);
            gl.uniform4fv(shader.uniforms["u_baseColor"], material.baseColor);
            gl.uniform1f(shader.uniforms["u_opacity"], material.opacity);
        }

        private bindTexture(gl: WebGLRenderingContext, shader: ShaderProgram, material: DrawableMaterial, time: number) {
            gl.uniform1i(shader.uniforms["u_hasTexture"], material.texture.isEmpty ? 0 : 1);
            material.texture.update(time);
            material.texture.bind(0, shader.uniforms["u_textureSampler"]);
        }

        private bindMask(gl: WebGLRenderingContext, shader: ShaderProgram, material: DrawableMaterial, time: number) {
            gl.uniform1i(shader.uniforms["u_hasMask"], material.mask.isEmpty ? 0 : 1);
            material.mask.update(time);
            material.mask.bind(1, shader.uniforms["u_maskSampler"]);
        }

        bindVertexBuffers(gl: WebGLRenderingContext, shader: ShaderProgram, vertexBuffer: VertexBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.positions);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.uvs);
            gl.vertexAttribPointer(shader.attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.normals);
            gl.vertexAttribPointer(shader.attributes["a_vertexNormal"], 3, gl.FLOAT, true, 0, 0);
        }
    }
}