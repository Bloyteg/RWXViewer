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
    export interface BoundingBox {
        minimumX: number;
        minimumY: number;
        minimumZ: number;
        maximumX: number;
        maximumY: number;
        maximumZ: number;
    }

    export module BoundingBox {
        export function computeBoundingBox(model: Model): BoundingBox {
            var minimumX = 0,
                minimumY = 0,
                minimumZ = 0,
                maximumX = 0,
                maximumY = 0,
                maximumZ = 0;

            var prototypes = model.Prototypes.reduce((aggregate, current) => {
                aggregate[current.Name] = current;
                return aggregate;
            }, {});

            function findBoundsForClump(clump: Clump, transformMatrix: Mat4Array) {
                var clumpMatrix = mat4.clone(clump.Transform.Matrix);
                mat4.mul(clumpMatrix, transformMatrix, clumpMatrix);

                findBoundsForMeshGeometry(clump, clumpMatrix);
            }

            function findBoundsForMeshGeometry(geometry: MeshGeometry, transformMatrix: Mat4Array) {
                findBoundsForGeometry(geometry, transformMatrix);
                geometry.Children.forEach(child => findBoundsForClump(child, transformMatrix));
                geometry.PrototypeInstances.forEach(instance => findBoundsForPrototypeInstance(instance, transformMatrix));
                geometry.Primitives.forEach(primitive => findBoundsForPrimitive(primitive, transformMatrix));
            }

            function findBoundsForGeometry(geometry: Geometry, transformMatrix: Mat4Array) {
                geometry.Vertices.forEach(vertex => {
                    var position = [vertex.Position.X, vertex.Position.Y, vertex.Position.Z];
                    vec3.transformMat4(position, position, transformMatrix);

                    minimumX = Math.min(minimumX, position[0]);
                    minimumY = Math.min(minimumY, position[1]);
                    minimumZ = Math.min(minimumZ, position[2]);
                    maximumX = Math.max(maximumX, position[0]);
                    maximumY = Math.max(maximumY, position[1]);
                    maximumZ = Math.max(maximumZ, position[2]);
                });
            }

            function findBoundsForPrototypeInstance(instance: PrototypeInstance, transformMatrix: Mat4Array) {
                var prototypeMatrix = mat4.clone(instance.Transform.Matrix);
                mat4.mul(prototypeMatrix, transformMatrix, prototypeMatrix);

                findBoundsForMeshGeometry(prototypes[instance.Name], prototypeMatrix);
            }

            function findBoundsForPrimitive(primitive: PrimitiveGeometry, transformMatrix: Mat4Array) {
                var primitiveMatrix = mat4.clone(primitive.Transform.Matrix);
                mat4.mul(primitiveMatrix, transformMatrix, primitiveMatrix);

                findBoundsForGeometry(primitive, primitiveMatrix);
            }

            findBoundsForClump(model.Clump, mat4.create());

            return {
                minimumX: minimumX,
                minimumY: minimumY,
                minimumZ: minimumZ,
                maximumX: maximumX,
                maximumY: maximumY,
                maximumZ: maximumZ
            };
        }
    }
}