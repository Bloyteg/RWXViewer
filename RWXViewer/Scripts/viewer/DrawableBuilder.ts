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

import Model = require("Model")
import Drawable = require("Drawable");

export class DrawableBuilder {
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    loadModel(model: Model.IModel): Drawable.IDrawable {
        return this.buildMeshDrawableFromClump(model, model.Clump);
    }

    private buildMeshDrawableFromClump(model: Model.IModel, clump: Model.IClump, parentMatrix = mat4.create()): Drawable.MeshDrawable {
        var matrix = mat4.clone(clump.Transform.Matrix);
        mat4.multiply(matrix, parentMatrix, matrix);

        var children = clump.Children.map(child => this.buildMeshDrawableFromClump(model, child, matrix));

        return new Drawable.MeshDrawable(this.buildMeshMaterialGroups(model, clump), matrix, children);
    }

    private buildMeshMaterialGroups(model: Model.IModel, geometry: Model.IGeometry): Drawable.IMeshMaterialGroup[] {
        var trianglesByMaterial: Model.ITriangle[][] = Array();

        geometry.Faces.forEach((face: Model.IFace) => {
            face.Triangles.forEach((triangle: Model.ITriangle) => {
                if (face.MaterialId in trianglesByMaterial) {
                    trianglesByMaterial[face.MaterialId].push(triangle);
                } else {
                    trianglesByMaterial[face.MaterialId] = [triangle];
                }
            });
        });

        return trianglesByMaterial.map((triangleGroup: Model.ITriangle[], materialId) => {
            var material = model.Materials[materialId];

            return {
                vertexBuffer: this.buildVertexBuffer(geometry.Vertices, triangleGroup, material),
                baseColor: vec4.fromValues(material.Color.R, material.Color.G, material.Color.B, 1.0),
                ambient: material.Ambient,
                diffuse: material.Diffuse
            };
        });
    }

    private buildVertexBuffer(vertices: Model.IVertex[], triangles: Model.ITriangle[], material: Model.IMaterial): Drawable.IVertexBuffer {
        var positions: number[] = [];
        var uvs: number[] = [];
        var normals: number[] = [];

        triangles.forEach(triangle => {
            triangle.Indices.forEach(index => {
                var vertex = vertices[index];

                positions.push(vertex.Position.X);
                positions.push(vertex.Position.Y);
                positions.push(vertex.Position.Z);

                uvs.push((<any>(vertex.Uv) || {}).U || 0);
                uvs.push((<any>(vertex.Uv) || {}).V || 0);

                if (material.LightSampling === Model.LightSampling.Vertex) {
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
    }
} 