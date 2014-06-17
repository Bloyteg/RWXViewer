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

    export interface MeshMaterialGroup {
        vertexBuffer: VertexBuffer;
        baseColor: Vec4Array;
        ambient: number;
        diffuse: number;
        drawMode: number;
        opacity: number;
        texture: Texture;
        mask: Texture;
    }

    //TODO: Handle prelit meshes.
    export class MeshDrawable implements Drawable {
        private _meshMaterialGroups: MeshMaterialGroup[];
        private _worldMatrix: Mat4Array;
        private _children: Drawable[];
        private _isBillboard: boolean;
        private _animation: Animation;
        private _jointTag: number;

        constructor(meshMaterialGroups: MeshMaterialGroup[], modelMatrix: Mat4Array, children: Drawable[], jointTag: number, isBillboard?: boolean, animation?: Animation) {
            this._meshMaterialGroups = meshMaterialGroups;
            this._worldMatrix = modelMatrix;
            this._children = children;
            this._isBillboard = isBillboard || false;
            this._animation = animation || Animation.getDefaultAnimation();
            this._jointTag = jointTag || 0;
        }

        get worldMatrix(): Mat4Array {
            return this._worldMatrix;
        }

        get animation(): Animation {
            return this._animation;
        }

        cloneWithTransform(matrix: Mat4Array) {
            var newTransformMatrix = mat4.clone(this._worldMatrix);
            mat4.mul(newTransformMatrix, matrix, newTransformMatrix);

            return new MeshDrawable(this._meshMaterialGroups, newTransformMatrix, this._children.map(child => child.cloneWithTransform(matrix)), this._jointTag, this._isBillboard, this._animation);
        }

        cloneWithAnimation(animation: Animation) {
            return new MeshDrawable(this._meshMaterialGroups, this._worldMatrix, this._children.map(child => child.cloneWithAnimation(animation)), this._jointTag, this._isBillboard, animation); 
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram, time: number): void {
            this.setTransformUniforms(gl, shader, time);

            this._meshMaterialGroups.forEach((meshMaterialGroup: MeshMaterialGroup) => {
                this.setMaterialUniforms(gl, shader, meshMaterialGroup);
                this.bindTexture(gl, shader, meshMaterialGroup, time);
                this.bindMask(gl, shader, meshMaterialGroup, time);
                this.bindVertexBuffers(gl, shader, meshMaterialGroup);

                gl.drawArrays(meshMaterialGroup.drawMode, 0, meshMaterialGroup.vertexBuffer.count);
            });

            this._children.forEach(child => child.draw(gl, shader, time));
        }

        private setTransformUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, time: number) {
            gl.uniformMatrix4fv(shader.uniforms["u_animationMatrix"], false, this._animation.getTransformForTime(this._jointTag, time));
            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, this._worldMatrix);

            gl.uniform1i(shader.uniforms["u_isBillboard"], this._isBillboard ? 1 : 0);
        }

        private setMaterialUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup) {
            gl.uniform1f(shader.uniforms["u_ambientFactor"], meshMaterialGroup.ambient);
            gl.uniform1f(shader.uniforms["u_diffuseFactor"], meshMaterialGroup.diffuse);
            gl.uniform4fv(shader.uniforms["u_baseColor"], meshMaterialGroup.baseColor);
            gl.uniform1f(shader.uniforms["u_opacity"], meshMaterialGroup.opacity);
        }

        private bindTexture(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup, time: number) {
            gl.uniform1i(shader.uniforms["u_hasTexture"], meshMaterialGroup.texture.isEmpty ? 0 : 1);
            meshMaterialGroup.texture.update(time);
            meshMaterialGroup.texture.bind(0, shader.uniforms["u_textureSampler"]);
        }

        private bindMask(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup, time: number) {
            gl.uniform1i(shader.uniforms["u_hasMask"], meshMaterialGroup.mask.isEmpty ? 0 : 1);
            meshMaterialGroup.mask.update(time);
            meshMaterialGroup.mask.bind(1, shader.uniforms["u_maskSampler"]);
        }

        bindVertexBuffers(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup) {
            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.positions);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.uvs);
            gl.vertexAttribPointer(shader.attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.normals);
            gl.vertexAttribPointer(shader.attributes["a_vertexNormal"], 3, gl.FLOAT, true, 0, 0);
        }
    }
}