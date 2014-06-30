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
        export function createOriginAxesDrawable(gl: WebGLRenderingContext): Drawable {
            return new OriginAxesDrawable(gl);
        }
    }

    class OriginAxesDrawable implements Drawable {
        private _xAxisVertexBuffer: WebGLBuffer;
        private _yAxisVertexBuffer: WebGLBuffer;
        private _zAxisVertexBuffer: WebGLBuffer;

        private _xAxisVertexCount: number;
        private _yAxisVertexCount: number;
        private _zAxisVertexCount: number;

        private _redColor = vec4.fromValues(1, 0, 0, 1);
        private _greenColor = vec4.fromValues(0, 1, 0, 1);
        private _blueColor = vec4.fromValues(0, 0, 1, 1);

        private _animation = Animation.getDefaultAnimation();

        constructor(gl: WebGLRenderingContext) {
            this.initializeNew(gl);
        }

        private initializeNew(gl: WebGLRenderingContext) {
            var xVertices = [];
            xVertices.push(0, 0, 0);
            xVertices.push(0.05, 0, 0);

            this._xAxisVertexCount = xVertices.length / 3;
            this._xAxisVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._xAxisVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(xVertices), gl.STATIC_DRAW);

            var yVertices = [];
            yVertices.push(0, 0, 0);
            yVertices.push(0, 0.05, 0);

            this._yAxisVertexCount = yVertices.length / 3;
            this._yAxisVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._yAxisVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(yVertices), gl.STATIC_DRAW);

            var zVertices = [];
            zVertices.push(0, 0, 0);
            zVertices.push(0, 0, 0.05);

            this._zAxisVertexCount = zVertices.length / 3;
            this._zAxisVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._zAxisVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(zVertices), gl.STATIC_DRAW);

        }

        get animation(): Animation {
            return this._animation;
        }

        cloneWithAnimation(animation: Animation) {
            return this;
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix: Mat4Array): void {
            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, transformMatrix);
            gl.uniform1i(shader.uniforms["u_faceCamera"], 0);

            gl.uniform4fv(shader.uniforms["u_baseColor"], this._redColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._xAxisVertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._xAxisVertexCount);

            gl.uniform4fv(shader.uniforms["u_baseColor"], this._greenColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._yAxisVertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._yAxisVertexCount);

            gl.uniform4fv(shader.uniforms["u_baseColor"], this._blueColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._zAxisVertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._zAxisVertexCount);
        }
    }
}   