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
        function MeshDrawable(meshMaterialGroups, modelMatrix, children) {
            this._meshMaterialGroups = meshMaterialGroups;
            this._modelMatrix = modelMatrix;
            this._children = children;
        }
        MeshDrawable.prototype.draw = function (gl, shaders) {
            //TODO: Handle any material specific parameters such as prelit, wireframe, texture bindings, etc.
            var _this = this;
            this._meshMaterialGroups.forEach(function (meshMaterialGroup) {
                gl.uniformMatrix4fv(shaders[0].uniforms["u_modelMatrix"], false, _this._modelMatrix);

                gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.vertexPositions);
                gl.enableVertexAttribArray(0);
                gl.vertexAttribPointer(shaders[0].attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.vertexUVs);
                gl.vertexAttribPointer(shaders[0].attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.vertexNormals);
                gl.vertexAttribPointer(shaders[0].attributes["a_vertexNormal"], 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshMaterialGroup.indexBuffer.indexBuffer);
                gl.drawElements(gl.TRIANGLES, meshMaterialGroup.indexBuffer.indexCount, gl.UNSIGNED_SHORT, 0);
            });

            this._children.forEach(function (child) {
                return child.draw(gl, shaders);
            });
        };
        return MeshDrawable;
    })();
    exports.MeshDrawable = MeshDrawable;
});
//# sourceMappingURL=Drawable.js.map
