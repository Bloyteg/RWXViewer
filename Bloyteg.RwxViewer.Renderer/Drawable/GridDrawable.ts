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
        export function createGridDrawable(gl: WebGLRenderingContext): Drawable {
            return new GridDrawable(gl);
        }
    }

    class GridDrawable implements Drawable {
        private _vertexBuffer: WebGLBuffer;
        private _vertexCount: number;
        private _animation = Animation.getDefaultAnimation();

        constructor(gl: WebGLRenderingContext) {
            this.initializeNew(gl);
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

        get animation(): Animation {
            return this._animation;
        }

        cloneWithAnimation(animation: Animation) {
            return this;
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram): void {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._vertexCount);
        }
    }
}