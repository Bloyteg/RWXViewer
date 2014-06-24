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
        private _modelMatrix: Mat4Array = mat4.create();
        private _viewportWidth: number;
        private _viewportHeight: number;

        constructor(gl: WebGLRenderingContext) {
            this._gl = gl;
        }

        initialize(mainProgram: ShaderProgram, gridProgram: ShaderProgram) {
            var gl = this._gl;

            if (gl) {
                this._camera = makeCamera(gl.drawingBufferWidth, gl.drawingBufferHeight);
                this._spatialGridDrawable = makeGrid(gl);

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
                gl.viewport(0, 0, this._viewportWidth, this._viewportHeight);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                mat4.perspective(this._projectionMatrix, 45, this._viewportWidth / this._viewportHeight, 0.01, 1000.0);

                this._gridProgram.use(program => {
                    gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, this._projectionMatrix);
                    gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, this._camera.matrix);
                    this._spatialGridDrawable.draw(gl, program);
                });

                this._mainProgram.use(program => {
                    if (this._currentDrawable) {
                        gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, this._projectionMatrix);
                        gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, this._camera.matrix);
                        this._currentDrawable.draw(gl, program, this._modelMatrix, time);
                    }
                });
            }
        }

        setCurrentModel(model: Model): void {
            if (model) {
                this._currentDrawable = createDrawableFromModel(this._gl, model);

                var boundingBox = BoundingBox.computeBoundingBox(model);
                mat4.translate(this._modelMatrix, mat4.create(), [0, -boundingBox.minimumY, 0]);

            } else {
                this._currentDrawable = null;
            }
        }

        setCurrentAnimation(animation: ModelAnimation): void {
            if (this._currentDrawable) {
                if (animation) {
                    this._currentDrawable = this._currentDrawable.cloneWithAnimation(Animation.getSequenceAnimation(animation));
                } else {
                    this._currentDrawable = this._currentDrawable.cloneWithAnimation(Animation.getDefaultAnimation());
                }
            }
        }

        get camera(): Camera {
            return this._camera;
        }

        updateViewport(width: number, height: number) {
            this._viewportWidth = width;
            this._viewportHeight = height;

            if (this._camera) {
                this._camera.setViewportSize(width, height);
            }
        }
    }
}