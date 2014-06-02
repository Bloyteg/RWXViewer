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
define(["require", "exports", "Drawable"], function(require, exports, Drawable) {
    var DrawableBuilder = (function () {
        function DrawableBuilder(gl) {
            this._gl = gl;
        }
        DrawableBuilder.prototype.loadModel = function (model) {
            return this.buildMeshDrawableFromClump(model, model.Clump);
        };

        DrawableBuilder.prototype.buildMeshDrawableFromClump = function (model, clump, parentMatrix) {
            var _this = this;
            if (typeof parentMatrix === "undefined") { parentMatrix = mat4.create(); }
            var matrix = mat4.clone(clump.Transform.Matrix);
            mat4.multiply(matrix, parentMatrix, matrix);

            var children = clump.Children.map(function (child) {
                return _this.buildMeshDrawableFromClump(model, child, matrix);
            });

            return new Drawable.MeshDrawable(this.buildMeshMaterialGroups(model, clump), matrix, children);
        };

        DrawableBuilder.prototype.buildMeshMaterialGroups = function (model, geometry) {
            var _this = this;
            var trianglesByMaterial = Array();

            geometry.Faces.forEach(function (face) {
                face.Triangles.forEach(function (triangle) {
                    if (face.MaterialId in trianglesByMaterial) {
                        trianglesByMaterial[face.MaterialId].push(triangle);
                    } else {
                        trianglesByMaterial[face.MaterialId] = [triangle];
                    }
                });
            });

            return trianglesByMaterial.map(function (triangleGroup, materialId) {
                var indices = triangleGroup.reduce(function (array, triangle) {
                    return array.concat(triangle.Indices);
                }, []);
                var material = model.Materials[materialId];
                return {
                    vertexBuffer: _this.buildVertexBuffer(geometry.Vertices, indices),
                    baseColor: vec4.fromValues(material.Color.R, material.Color.G, material.Color.B, 1.0)
                };
            });
        };

        DrawableBuilder.prototype.buildVertexBuffer = function (vertices, indices) {
            var positions = [];
            var uvs = [];
            var normals = [];

            indices.forEach(function (index) {
                var vertex = vertices[index];

                positions.push(vertex.Position.X);
                positions.push(vertex.Position.Y);
                positions.push(vertex.Position.Z);

                uvs.push(((vertex.Uv) || {}).U || 0);
                uvs.push(((vertex.Uv) || {}).V || 0);

                normals.push(vertex.Normal.X);
                normals.push(vertex.Normal.Y);
                normals.push(vertex.Normal.Z);
            });

            var gl = this._gl;
            var positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            var uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

            var normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

            return {
                positions: positionBuffer,
                uvs: uvBuffer,
                normals: normalBuffer,
                count: indices.length
            };
        };
        return DrawableBuilder;
    })();
    exports.DrawableBuilder = DrawableBuilder;
});
//# sourceMappingURL=DrawableBuilder.js.map
