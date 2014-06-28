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
    export module Drawable {
        export function createBoundingBoxDrawble(gl: WebGLRenderingContext, boundingBox: BoundingBox) {
            return new BoundingBoxDrawable(gl, boundingBox);
        }
    }

    export class BoundingBoxDrawable implements Drawable {
        private _vertexBuffer: WebGLBuffer;
        private _vertexCount: number;
        private _animation = Animation.getDefaultAnimation();
        private _color = vec4.fromValues(1, 1, 0, 1);

        constructor(gl: WebGLRenderingContext, boundingBox: BoundingBox) {
            this.initializeNew(gl, boundingBox);
        }

        private initializeNew(gl: WebGLRenderingContext, boundingBox: BoundingBox) {
            var vertices: number[] = [];

            vertices.push(boundingBox.minimumX, boundingBox.minimumY, boundingBox.minimumZ);
            vertices.push(boundingBox.maximumX, boundingBox.minimumY, boundingBox.minimumZ);

            vertices.push(boundingBox.minimumX, boundingBox.minimumY, boundingBox.maximumZ);
            vertices.push(boundingBox.maximumX, boundingBox.minimumY, boundingBox.maximumZ);

            vertices.push(boundingBox.minimumX, boundingBox.maximumY, boundingBox.minimumZ);
            vertices.push(boundingBox.maximumX, boundingBox.maximumY, boundingBox.minimumZ);

            vertices.push(boundingBox.minimumX, boundingBox.maximumY, boundingBox.maximumZ);
            vertices.push(boundingBox.maximumX, boundingBox.maximumY, boundingBox.maximumZ);

            vertices.push(boundingBox.minimumX, boundingBox.minimumY, boundingBox.minimumZ);
            vertices.push(boundingBox.minimumX, boundingBox.minimumY, boundingBox.maximumZ);

            vertices.push(boundingBox.maximumX, boundingBox.minimumY, boundingBox.minimumZ);
            vertices.push(boundingBox.maximumX, boundingBox.minimumY, boundingBox.maximumZ);

            vertices.push(boundingBox.minimumX, boundingBox.maximumY, boundingBox.minimumZ);
            vertices.push(boundingBox.minimumX, boundingBox.maximumY, boundingBox.maximumZ);

            vertices.push(boundingBox.maximumX, boundingBox.maximumY, boundingBox.minimumZ);
            vertices.push(boundingBox.maximumX, boundingBox.maximumY, boundingBox.maximumZ);

            vertices.push(boundingBox.minimumX, boundingBox.minimumY, boundingBox.minimumZ);
            vertices.push(boundingBox.minimumX, boundingBox.maximumY, boundingBox.minimumZ);

            vertices.push(boundingBox.maximumX, boundingBox.minimumY, boundingBox.minimumZ);
            vertices.push(boundingBox.maximumX, boundingBox.maximumY, boundingBox.minimumZ);

            vertices.push(boundingBox.minimumX, boundingBox.minimumY, boundingBox.maximumZ);
            vertices.push(boundingBox.minimumX, boundingBox.maximumY, boundingBox.maximumZ);

            vertices.push(boundingBox.maximumX, boundingBox.minimumY, boundingBox.maximumZ);
            vertices.push(boundingBox.maximumX, boundingBox.maximumY, boundingBox.maximumZ);

            this._vertexCount = vertices.length / 3;
            this._vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        }

        get animation(): Animation {
            return this._animation;
        }

        cloneWithAnimation(animation: Animation) {
            return this;
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix: Mat4Array): void {
            gl.uniform4fv(shader.uniforms["u_baseColor"], this._color);
            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, transformMatrix);
            gl.uniform1i(shader.uniforms["u_faceCamera"], 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._vertexCount);
        }
    }
} 