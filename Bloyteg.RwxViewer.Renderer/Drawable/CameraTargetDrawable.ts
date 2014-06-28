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
        export function createCameraTargetDrawable(gl: WebGLRenderingContext) {
            return new CameraTargetDrawable(gl);
        }
    }

    export class CameraTargetDrawable implements Drawable {
        private _firstOuterCircleVertexBuffer: WebGLBuffer;
        private _secondOuterCircleVertexBuffer: WebGLBuffer;
        private _crossHairVertexBuffer: WebGLBuffer;
        private _innerCircleVertexBuffer: WebGLBuffer;

        private _firstOuterCircleVertexCount: number;
        private _secondOuterCircleVertexCount: number;
        private _crossHairVertexCount: number;
        private _innerCircleVertexCount: number;


        private _redColor = vec4.fromValues(1, 0, 0, 1);
        private _whiteColor = vec4.fromValues(1, 1, 1, 1);
        private _blackColor = vec4.fromValues(0, 0, 0, 1);
        private _orangeColor = vec4.fromValues(1, 0.549, 0, 1);

        private _animation = Animation.getDefaultAnimation();

        constructor(gl: WebGLRenderingContext) {
            this.initializeNew(gl);
        }

        private initializeNew(gl: WebGLRenderingContext) {
            var firstOuterCircleVertices: number[] = [];
            var secondOuterCircleVertices: number[] = [];

            var sides = 16;
            var stepSize = (2 * Math.PI) / sides;
            var radius = 0.01;

            for (var side = 0, currentStep = 0; side < sides; ++side, currentStep += stepSize) {
                var vertices = side % 2 == 0 ? firstOuterCircleVertices : secondOuterCircleVertices;

                vertices.push(Math.cos(currentStep) * radius, Math.sin(currentStep) * radius, 0);
                vertices.push(Math.cos(currentStep + stepSize) * radius, Math.sin(currentStep + stepSize) * radius, 0);
            }

            this._firstOuterCircleVertexCount = firstOuterCircleVertices.length / 3;
            this._firstOuterCircleVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._firstOuterCircleVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(firstOuterCircleVertices), gl.STATIC_DRAW);

            this._secondOuterCircleVertexCount = secondOuterCircleVertices.length / 3;
            this._secondOuterCircleVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._secondOuterCircleVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(secondOuterCircleVertices), gl.STATIC_DRAW);

            var crossHairVertices: number[] = [];

            crossHairVertices.push(-radius * 1.5, 0, 0);
            crossHairVertices.push(radius * 1.5, 0, 0);
            crossHairVertices.push(0, -radius * 1.5, 0.0);
            crossHairVertices.push(0, radius * 1.5, 0.0);

            this._crossHairVertexCount = crossHairVertices.length / 3;
            this._crossHairVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._crossHairVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(crossHairVertices), gl.STATIC_DRAW);

            var innerCircleVertices: number[] = [];

            radius = 0.0025;

            for (side = 0, currentStep = 0; side < sides; ++side, currentStep += stepSize) {
                innerCircleVertices.push(0, 0, 0);
                innerCircleVertices.push(Math.cos(currentStep) * radius, Math.sin(currentStep) * radius, 0);
                innerCircleVertices.push(Math.cos(currentStep + stepSize) * radius, Math.sin(currentStep + stepSize) * radius, 0);
            }

            this._innerCircleVertexCount = innerCircleVertices.length / 3;
            this._innerCircleVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._innerCircleVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(innerCircleVertices), gl.STATIC_DRAW);
        }

        get animation(): Animation {
            return this._animation;
        }

        cloneWithAnimation(animation: Animation) {
            return this;
        }

        draw(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix: Mat4Array): void {
            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, transformMatrix);
            gl.uniform1i(shader.uniforms["u_faceCamera"], 1);

            gl.uniform4fv(shader.uniforms["u_baseColor"], this._redColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._firstOuterCircleVertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._firstOuterCircleVertexCount);

            gl.uniform4fv(shader.uniforms["u_baseColor"], this._whiteColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._secondOuterCircleVertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._secondOuterCircleVertexCount);

            gl.uniform4fv(shader.uniforms["u_baseColor"], this._blackColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._crossHairVertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._crossHairVertexCount);

            gl.uniform4fv(shader.uniforms["u_baseColor"], this._orangeColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._innerCircleVertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, this._innerCircleVertexCount);
        }
    }
}  