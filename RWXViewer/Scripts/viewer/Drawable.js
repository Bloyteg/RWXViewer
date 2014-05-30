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
define(["require", "exports"], function(require, exports) {
    var MeshDrawable = (function () {
        function MeshDrawable(vertexBuffer, indexBuffers) {
            this._vertexBuffer = vertexBuffer;
            this._indexBuffers = indexBuffers;
            this.children = new Array();
        }
        MeshDrawable.prototype.draw = function (gl, shaders) {
            shaders[0].useProgram();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer.vertexPositions);
            gl.vertexAttribPointer(shaders[0].attributes["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);

            //gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer.vertexUVs);
            ////TODO: Set UV attributes.
            //gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer.vertexNormals);
            ////TODO: Set normal attributes.
            var mvMatrix = mat4.create();
            var pMatrix = mat4.create();

            mat4.perspective(pMatrix, 45, 960 / 540, 0.1, 100.0);
            mat4.identity(mvMatrix);
            mat4.translate(mvMatrix, mvMatrix, [0, 0, -15]);
            mat4.scale(mvMatrix, mvMatrix, [5, 5, 5]);

            this._indexBuffers.forEach(function (indexBuffer) {
                //TODO: Set matrices.
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.indexBuffer);

                gl.uniformMatrix4fv(shaders[0].uniforms["uMVMatrix"], false, mvMatrix);
                gl.uniformMatrix4fv(shaders[0].uniforms["uPMatrix"], false, pMatrix);

                gl.drawElements(gl.TRIANGLES, indexBuffer.indexCount, gl.UNSIGNED_SHORT, 0);
            });

            this.children.forEach(function (child) {
                return child.draw(gl, shaders);
            });
        };
        return MeshDrawable;
    })();
    exports.MeshDrawable = MeshDrawable;
});
//# sourceMappingURL=Drawable.js.map
