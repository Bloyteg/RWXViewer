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
    export class Renderer {
        private _gl: WebGLRenderingContext;
        private _currentDrawable: Drawable;
        private _spatialGridDrawable: Drawable;
        private _gridProgram: ShaderProgram;
        private _mainProgram: ShaderProgram;
        private _camera: Camera;
        private _projectionMatrix: Mat4Array = mat4.create();

        constructor(gl: WebGLRenderingContext) {
            this._gl = gl;
        }

        initialize(mainProgram: ShaderProgram, gridProgram: ShaderProgram) {
            var gl = this._gl;

            if (gl) {
                this._camera = makeCamera(gl.drawingBufferWidth, gl.drawingBufferHeight);
                this._spatialGridDrawable = makeGrid(gl);

                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.clearColor(0.75, 0.75, 0.75, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }

            this._mainProgram = mainProgram;
            this._gridProgram = gridProgram;
        }

        draw(time: number): void {
            var gl = this._gl;

            if (gl) {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                mat4.perspective(this._projectionMatrix, 45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100.0);

                this._gridProgram.use(program => {
                    gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, this._projectionMatrix);
                    gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, this._camera.matrix);
                    this._spatialGridDrawable.draw(gl, program, time);
                });

                this._mainProgram.use(program => {
                    if (this._currentDrawable) {
                        gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, this._projectionMatrix);
                        gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, this._camera.matrix);
                        this._currentDrawable.draw(gl, program, time);
                    }
                });
            }
        }

        setCurrentModel(model: Model): void {
            if (model) {
                this._currentDrawable = createDrawableFromModel(this._gl, model);
            } else {
                this._currentDrawable = null;
            }
        }

        get camera(): Camera {
            return this._camera;
        }
    }
}