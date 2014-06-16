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
    export function makeGrid(gl: WebGLRenderingContext) {
        return new GridDrawable(gl);
    }

    export class GridDrawable implements Drawable {
        private _vertexBuffer: WebGLBuffer;
        private _vertexCount: number;
        private _worldMatrix: Mat4Array;

        constructor(gl: WebGLRenderingContext)
        constructor(worldMatrix: Mat4Array, vertexBuffer: WebGLBuffer, vertexCount: number)
        constructor(input: any, vertexBuffer?, vertexCount?) {
            if (input instanceof Float32Array) {
                this._vertexBuffer = vertexBuffer;
                this._vertexCount = vertexCount;
                this._worldMatrix = <Mat4Array>input;
            } else {
                this.initializeNew(<WebGLRenderingContext>input);
            }
        }

        private initializeNew(gl: WebGLRenderingContext) {
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

        get worldMatrix(): Mat4Array {
            return this._worldMatrix;
        }

        cloneWithTransform(matrix: Mat4Array) {
            return new GridDrawable(mat4.multiply(mat4.create(), matrix, this.worldMatrix), this._vertexBuffer, this._vertexCount);
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram): void {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._vertexCount);
        }
    }
}