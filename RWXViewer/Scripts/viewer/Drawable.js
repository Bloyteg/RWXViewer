﻿// Copyright 2014 Joshua R. Rodgers
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
        function MeshDrawable(gl, vertexBuffer, indexBuffers) {
            this.gl = gl;
            this.vertexBuffer = vertexBuffer;
            this.indexBuffers = indexBuffers;
            this.children = new Array();
        }
        MeshDrawable.prototype.draw = function () {
            var gl = this.gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexPositions);

            //TODO: Set position attributes.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexUVs);

            //TODO: Set UV attributes.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexNormals);

            //TODO: Set normal attributes.
            this.indexBuffers.forEach(function (indexBuffer) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.indexBuffer);

                //TODO: Set matrices
                gl.drawElements(gl.TRIANGLES, indexBuffer.indexCount, gl.UNSIGNED_SHORT, 0);
            });

            this.children.forEach(function (child) {
                return child.draw();
            });
        };
        return MeshDrawable;
    })();
    exports.MeshDrawable = MeshDrawable;
});
//# sourceMappingURL=Drawable.js.map