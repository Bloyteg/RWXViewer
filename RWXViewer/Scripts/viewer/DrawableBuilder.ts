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

interface IPrototypeCache {
    [name: string]: Drawable.MeshDrawable
}

export class DrawableBuilder {
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    loadModel(model: Model.IModel): Drawable.IDrawable {
        var prototypes: IPrototypeCache = this.buildPrototypeCache(model);

        return this.buildMeshDrawableFromClump(model, model.Clump, prototypes);
    }

    private buildPrototypeCache(model: Model.IModel): IPrototypeCache {
        return model.Prototypes.reduce((prototypeCache: IPrototypeCache, prototype: Model.IPrototype) => {
            prototypeCache[prototype.Name] = this.buildMeshDrawableFromPrototype(model, prototype, prototypeCache);
            return prototypeCache;
        }, <IPrototypeCache>{});
    }

    private buildMeshDrawableFromPrototype(model: Model.IModel, prototype: Model.IPrototype, prototypeCache: IPrototypeCache): Drawable.MeshDrawable {
        return this.buildMeshDrawableFromMeshGeometry(model, prototype, prototypeCache, mat4.create());
    }

    private buildMeshDrawableFromClump(model: Model.IModel, clump: Model.IClump, prototypeCache: IPrototypeCache, parentMatrix = mat4.create()): Drawable.MeshDrawable {
        var matrix = mat4.clone(clump.Transform.Matrix);
        mat4.multiply(matrix, parentMatrix, matrix);

        return this.buildMeshDrawableFromMeshGeometry(model, clump, prototypeCache, matrix);
    }

    private buildMeshDrawableFromMeshGeometry(model: Model.IModel, geometry: Model.IMeshGeometry, prototypeCache: IPrototypeCache, matrix: Mat4Array): Drawable.MeshDrawable {
        var children: Drawable.MeshDrawable[] = [];
        children = children.concat(geometry.Children.map(child => this.buildMeshDrawableFromClump(model, child, prototypeCache, matrix)));
        //TODO: Handle the case where this is a prototypeinstancegeometry.
        children = children.concat(geometry.PrototypeInstances.map(prototypeInstance => prototypeCache[prototypeInstance.Name].cloneWithTransform(mat4.clone(prototypeInstance.Transform.Matrix))));
        children = children.concat(geometry.Primitives.map(primitive => this.buildMeshDrawableFromPrimitive(model, primitive, matrix)));

        return new Drawable.MeshDrawable(this.buildMeshMaterialGroups(model, geometry), matrix, children);
    }
    private buildMeshDrawableFromPrimitive(model: Model.IModel, primitive: Model.IPrimitiveGeometry, parentMatrix: Mat4Array): Drawable.MeshDrawable {
        var matrix = mat4.clone(primitive.Transform.Matrix);
        mat4.multiply(matrix, parentMatrix, matrix);

        return new Drawable.MeshDrawable(this.buildMeshMaterialGroups(model, primitive), matrix, []);
    }

    private buildMeshMaterialGroups(model: Model.IModel, geometry: Model.IGeometry): Drawable.IMeshMaterialGroup[] {
        var facesByMaterial: Model.IFace[][] = [];

        geometry.Faces.forEach((face: Model.IFace) => {
            if (face.MaterialId in facesByMaterial) {
                facesByMaterial[face.MaterialId].push(face);
            } else {
                facesByMaterial[face.MaterialId] = [face];
            }
        });

        return facesByMaterial.map((faces: Model.IFace[], materialId) => {
            var material = model.Materials[materialId];

            return {
                vertexBuffer: this.buildVertexBuffer(geometry.Vertices, faces, material),
                baseColor: vec4.fromValues(material.Color.R, material.Color.G, material.Color.B, 1.0),
                ambient: material.Ambient,
                diffuse: material.Diffuse,
                drawMode: material.GeometrySampling === Model.GeometrySampling.Wireframe ? this._gl.LINES : this._gl.TRIANGLES
            };
        });
    }

    private buildVertexBuffer(vertices: Model.IVertex[], faces: Model.IFace[], material: Model.IMaterial): Drawable.IVertexBuffer {
        var buffers = material.GeometrySampling === Model.GeometrySampling.Wireframe
            ? this.buildLineBuffers(vertices, faces)
            : this.buildTriangleBuffers(vertices, faces, material);

        var gl = this._gl;
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers.positions), gl.STATIC_DRAW);

        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers.uvs), gl.STATIC_DRAW);

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers.normals), gl.STATIC_DRAW);

        return {
            positions: positionBuffer,
            uvs: uvBuffer,
            normals: normalBuffer,
            count: buffers.positions.length / 3
        };
    }

    private buildLineBuffers(vertices: Model.IVertex[], faces: Model.IFace[]) {
        var positions: number[] = [];
        var uvs: number[] = [];
        var normals: number[] = [];

        faces.forEach(face => {
            var length = face.Indices.length;
            for (var index = 0; index < length; ++index) {
                var indices = [face.Indices[index], face.Indices[(index + 1) % length]];

                indices.forEach(vertexIndex => {
                    var vertex = vertices[vertexIndex];

                    positions.push(vertex.Position.X, vertex.Position.Y, vertex.Position.Z);
                    uvs.push((<any>(vertex.Uv) || {}).U || 0, (<any>(vertex.Uv) || {}).V || 0);
                    normals.push(vertex.Normal.X, vertex.Normal.Y, vertex.Normal.Z);
                });
            }
        });

        return {
            positions: new Float32Array(positions),
            uvs: new Float32Array(uvs),
            normals: new Float32Array(normals)
        };
    }

    private buildTriangleBuffers(vertices: Model.IVertex[], faces: Model.IFace[], material: Model.IMaterial) {
        var positions: number[] = [];
        var uvs: number[] = [];
        var normals: number[] = [];

        faces.forEach(face => {
            face.Triangles.forEach(triangle => {
                triangle.Indices.forEach(index => {
                    var vertex = vertices[index];
                    var normal = material.LightSampling == Model.LightSampling.Vertex ? vertex.Normal : triangle.Normal;

                    positions.push(vertex.Position.X, vertex.Position.Y, vertex.Position.Z);
                    uvs.push((<any>(vertex.Uv) || {}).U || 0, (<any>(vertex.Uv) || {}).V || 0);
                    normals.push(normal.X, normal.Y, normal.Z);
                });
            });
        });

        return {
            positions: new Float32Array(positions),
            uvs: new Float32Array(uvs),
            normals: new Float32Array(normals)
        };
    }
} 