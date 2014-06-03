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
define(["require", "exports", "Model", "Drawable"], function(require, exports, Model, Drawable) {
    var DrawableBuilder = (function () {
        function DrawableBuilder(gl) {
            this._gl = gl;
        }
        DrawableBuilder.prototype.loadModel = function (model) {
            var prototypes = this.buildPrototypeCache(model);

            return this.buildMeshDrawableFromClump(model, model.Clump, prototypes);
        };

        DrawableBuilder.prototype.buildPrototypeCache = function (model) {
            var _this = this;
            return model.Prototypes.reduce(function (prototypeCache, prototype) {
                prototypeCache[prototype.Name] = _this.buildMeshDrawableFromPrototype(model, prototype, prototypeCache);
                return prototypeCache;
            }, {});
        };

        DrawableBuilder.prototype.buildMeshDrawableFromPrototype = function (model, prototype, prototypeCache) {
            return this.buildMeshDrawableFromMeshGeometry(model, prototype, prototypeCache, mat4.create());
        };

        DrawableBuilder.prototype.buildMeshDrawableFromClump = function (model, clump, prototypeCache, parentMatrix) {
            if (typeof parentMatrix === "undefined") { parentMatrix = mat4.create(); }
            var matrix = mat4.clone(clump.Transform.Matrix);
            mat4.multiply(matrix, parentMatrix, matrix);

            return this.buildMeshDrawableFromMeshGeometry(model, clump, prototypeCache, matrix);
        };

        DrawableBuilder.prototype.buildMeshDrawableFromMeshGeometry = function (model, geometry, prototypeCache, matrix) {
            var _this = this;
            var children = [];
            children = children.concat(geometry.Children.map(function (child) {
                return _this.buildMeshDrawableFromClump(model, child, prototypeCache, matrix);
            }));

            //TODO: Handle the case where this is a prototypeinstancegeometry.
            children = children.concat(geometry.PrototypeInstances.map(function (prototypeInstance) {
                return prototypeCache[prototypeInstance.Name].cloneWithTransform(mat4.clone(prototypeInstance.Transform.Matrix));
            }));
            children = children.concat(geometry.Primitives.map(function (primitive) {
                return _this.buildMeshDrawableFromPrimitive(model, primitive, matrix);
            }));

            return new Drawable.MeshDrawable(this.buildMeshMaterialGroups(model, geometry), matrix, children);
        };
        DrawableBuilder.prototype.buildMeshDrawableFromPrimitive = function (model, primitive, parentMatrix) {
            var matrix = mat4.clone(primitive.Transform.Matrix);
            mat4.multiply(matrix, parentMatrix, matrix);

            return new Drawable.MeshDrawable(this.buildMeshMaterialGroups(model, primitive), matrix, []);
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
                var material = model.Materials[materialId];

                return {
                    vertexBuffer: _this.buildVertexBuffer(geometry.Vertices, triangleGroup, material),
                    baseColor: vec4.fromValues(material.Color.R, material.Color.G, material.Color.B, 1.0),
                    ambient: material.Ambient,
                    diffuse: material.Diffuse
                };
            });
        };

        DrawableBuilder.prototype.buildVertexBuffer = function (vertices, triangles, material) {
            var positions = [];
            var uvs = [];
            var normals = [];

            triangles.forEach(function (triangle) {
                triangle.Indices.forEach(function (index) {
                    var vertex = vertices[index];

                    positions.push(vertex.Position.X);
                    positions.push(vertex.Position.Y);
                    positions.push(vertex.Position.Z);

                    uvs.push(((vertex.Uv) || {}).U || 0);
                    uvs.push(((vertex.Uv) || {}).V || 0);

                    if (material.LightSampling === 1 /* Vertex */) {
                        normals.push(vertex.Normal.X);
                        normals.push(vertex.Normal.Y);
                        normals.push(vertex.Normal.Z);
                    } else {
                        normals.push(triangle.Normal.X);
                        normals.push(triangle.Normal.Y);
                        normals.push(triangle.Normal.Z);
                    }
                });
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
                count: positions.length / 3
            };
        };
        return DrawableBuilder;
    })();
    exports.DrawableBuilder = DrawableBuilder;
});
//# sourceMappingURL=DrawableBuilder.js.map
