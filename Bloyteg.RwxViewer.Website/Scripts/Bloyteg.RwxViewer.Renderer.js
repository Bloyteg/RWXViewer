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
var RwxViewer;
(function (RwxViewer) {
    var AnimatedTexture = (function () {
        function AnimatedTexture(gl, imageSource, textureFactory) {
            this._gl = gl;
            this._imageSource = imageSource;

            this._canvas = document.createElement("canvas");
            this._canvas.width = imageSource.width;
            this._canvas.height = imageSource.width;

            this._currentFrame = 0;
            this._totalFrames = this._imageSource.height / this._imageSource.width;

            this._textureFactory = textureFactory;
            this._texture = textureFactory.getTexture(this.getNextFrame());

            this._lastUpdate = null;
        }
        AnimatedTexture.prototype.getNextFrame = function () {
            var canvas = this._canvas;

            var offsetY = canvas.width * (this._currentFrame % this._totalFrames);
            var dimension = canvas.width;

            var context = canvas.getContext("2d");
            context.clearRect(0, 0, dimension, dimension);
            context.drawImage(this._imageSource, 0, offsetY, dimension, dimension, 0, 0, dimension, dimension);

            return canvas;
        };

        AnimatedTexture.prototype.bind = function (slot, sampler) {
            var slotName = "TEXTURE" + slot;
            var gl = this._gl;

            gl.activeTexture(gl[slotName]);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.uniform1i(sampler, slot);
        };

        AnimatedTexture.prototype.update = function (update) {
            if (this._lastUpdate === null || (update - this._lastUpdate) >= 160) {
                this._textureFactory.updateTexture(this._texture, this.getNextFrame());
                this._currentFrame++;
                this._lastUpdate = update;
            }
        };

        Object.defineProperty(AnimatedTexture.prototype, "isEmpty", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        return AnimatedTexture;
    })();
    RwxViewer.AnimatedTexture = AnimatedTexture;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    (function (Animation) {
        function getDefaultAnimation() {
            return new NoAnimation();
        }
        Animation.getDefaultAnimation = getDefaultAnimation;

        function getSequenceAnimation(animation) {
            return new SequenceAnimation(animation, Date.now());
        }
        Animation.getSequenceAnimation = getSequenceAnimation;
    })(RwxViewer.Animation || (RwxViewer.Animation = {}));
    var Animation = RwxViewer.Animation;

    var NoAnimation = (function () {
        function NoAnimation() {
            this._transform = mat4.create();
        }
        NoAnimation.prototype.getTransformForTime = function (joint, time) {
            return this._transform;
        };
        return NoAnimation;
    })();
    RwxViewer.NoAnimation = NoAnimation;

    var jointTags = {
        "pelvis": 1,
        "back": 2,
        "neck": 3,
        "head": 4,
        "rtsternum": 5,
        "rtshoulder": 6,
        "rtelbow": 7,
        "rtwrist": 8,
        "rtfingers": 9,
        "lfsternum": 10,
        "lfshoulder": 11,
        "lfelbow": 12,
        "lfwrist": 13,
        "lffingers": 14,
        "rthip": 15,
        "rtknee": 16,
        "rtankle": 17,
        "rttoes": 18,
        "lfhip": 19,
        "lfknee": 20,
        "lfankle": 21,
        "lftoes": 22,
        "neck2": 23,
        "tail": 24,
        "tail2": 25,
        "tail3": 26,
        "tail4": 27,
        "obj1": 28,
        "obj2": 29,
        "obj3": 30,
        "hair": 31,
        "hair2": 32,
        "hair3": 33,
        "hair4": 34,
        "rtbreast": 35,
        "lfbreast": 36,
        "rteye": 37,
        "lfeye": 38,
        "lips": 39,
        "nose": 40,
        "rtear": 41,
        "lfear": 42
    };

    var SequenceAnimation = (function () {
        function SequenceAnimation(animation, startTime) {
            this._startTime = startTime;
            this._framesPerMS = animation.FramesPerSecond / 1000;
            this._totalFrames = Math.floor(animation.FrameCount / this._framesPerMS);

            this._transform = mat4.create();
            this._quaternion = quat.identity(quat.create());
            this._identity = mat4.create();

            this._keyframesByJoint = this.buildKeyframesByJoint(animation);
        }
        SequenceAnimation.prototype.buildKeyframesByJoint = function (animation) {
            var _this = this;
            var result = {};

            animation.Joints.forEach(function (joint) {
                var tag = _this.getJointTagFromName(joint.Name);

                result[tag] = joint.Keyframes.map(function (frame) {
                    var rotation = quat.fromValues(frame.Rotation.X, frame.Rotation.Y, -frame.Rotation.Z, frame.Rotation.W);
                    quat.invert(rotation, rotation);

                    return {
                        keyframe: Math.floor(frame.Keyframe / _this._framesPerMS),
                        rotation: rotation,
                        translation: vec3.fromValues(frame.Translation.X, frame.Translation.Y, frame.Translation.Z)
                    };
                });
            });

            return result;
        };

        SequenceAnimation.prototype.getJointTagFromName = function (name) {
            return jointTags[name] || null;
        };

        SequenceAnimation.prototype.getTransformForTime = function (joint, time) {
            var _this = this;
            var frame = Math.floor((time - this._startTime) % this._totalFrames);

            if (!(joint in this._keyframesByJoint)) {
                return this._identity;
            }

            //TODO: This is a naive approach.  Add memoization or pre-baking of keyframes in the future.
            var keyframes = this._keyframesByJoint[joint];
            var length = keyframes.length - 1;

            var interpolateTransform = function (firstFrameIndex, secondFrameIndex) {
                var interpFactor = (frame - keyframes[firstFrameIndex].keyframe) / Math.abs(keyframes[secondFrameIndex].keyframe - keyframes[firstFrameIndex].keyframe);

                quat.slerp(_this._quaternion, keyframes[firstFrameIndex].rotation, keyframes[secondFrameIndex].rotation, interpFactor);
                return mat4.fromQuat(_this._transform, _this._quaternion);
            };

            for (var index = 0; index < length; ++index) {
                var nextIndex = index + 1;

                if (keyframes[index].keyframe <= frame && keyframes[nextIndex].keyframe >= frame) {
                    return interpolateTransform(index, index + 1);
                } else if (nextIndex === length && keyframes[nextIndex].keyframe <= frame) {
                    return interpolateTransform(index + 1, 0);
                }
            }

            return this._identity;
        };
        return SequenceAnimation;
    })();
    RwxViewer.SequenceAnimation = SequenceAnimation;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    (function (BoundingBox) {
        function computeBoundingBox(model) {
            var minimumX = 0, minimumY = 0, minimumZ = 0, maximumX = 0, maximumY = 0, maximumZ = 0;

            var prototypes = model.Prototypes.reduce(function (aggregate, current) {
                aggregate[current.Name] = current;
                return aggregate;
            }, {});

            function findBoundsForClump(clump, transformMatrix) {
                var clumpMatrix = mat4.clone(clump.Transform.Matrix);
                mat4.mul(clumpMatrix, transformMatrix, clumpMatrix);

                findBoundsForMeshGeometry(clump, clumpMatrix);
            }

            function findBoundsForMeshGeometry(geometry, transformMatrix) {
                findBoundsForGeometry(geometry, transformMatrix);
                geometry.Children.forEach(function (child) {
                    return findBoundsForClump(child, transformMatrix);
                });
                geometry.PrototypeInstances.forEach(function (instance) {
                    return findBoundsForPrototypeInstance(instance, transformMatrix);
                });
                geometry.Primitives.forEach(function (primitive) {
                    return findBoundsForPrimitive(primitive, transformMatrix);
                });
            }

            function findBoundsForGeometry(geometry, transformMatrix) {
                geometry.Vertices.forEach(function (vertex) {
                    var position = [vertex.Position.X, vertex.Position.Y, vertex.Position.Z];
                    vec3.transformMat4(position, position, transformMatrix);

                    minimumX = Math.min(minimumX, position[0]);
                    minimumY = Math.min(minimumY, position[1]);
                    minimumZ = Math.min(minimumZ, position[2]);
                    maximumX = Math.min(maximumX, position[0]);
                    maximumY = Math.min(maximumY, position[1]);
                    maximumZ = Math.min(maximumZ, position[2]);
                });
            }

            function findBoundsForPrototypeInstance(instance, transformMatrix) {
                var prototypeMatrix = mat4.clone(instance.Transform.Matrix);
                mat4.mul(prototypeMatrix, transformMatrix, prototypeMatrix);

                findBoundsForMeshGeometry(prototypes[instance.Name], prototypeMatrix);
            }

            function findBoundsForPrimitive(primitive, transformMatrix) {
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
        BoundingBox.computeBoundingBox = computeBoundingBox;
    })(RwxViewer.BoundingBox || (RwxViewer.BoundingBox = {}));
    var BoundingBox = RwxViewer.BoundingBox;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var ZOOM_FACTOR = 0.95;
    var DEFAULT_RADIUS_SCALE = 1.0;
    var DEFAULT_CAMERA_DISTANCE = 1;
    var ROTATION_SPEED = 0.5;
    var FOV = 45;
    var RADS_PER_DEGREE = Math.PI / 180;
    var PHI_EPS = 0.000001;

    function makeCamera(width, height) {
        return new OrbitCamera(width, height);
    }
    RwxViewer.makeCamera = makeCamera;

    var OrbitCamera = (function () {
        function OrbitCamera(viewportWidth, viewportHeight) {
            this.reset();
            this.setViewportSize(viewportWidth, viewportHeight);
            this.update();
        }
        OrbitCamera.prototype.setViewportSize = function (width, height) {
            this._viewportWidth = width;
            this._viewportHeight = height;
        };

        OrbitCamera.prototype.reset = function () {
            this._cameraMatrix = mat4.create();
            this._cameraMatrixInverse = mat4.create();

            this._offset = vec3.create();
            this._position = vec3.fromValues(0.0, 0.707 * DEFAULT_CAMERA_DISTANCE, 0.707 * DEFAULT_CAMERA_DISTANCE);
            this._target = vec3.create();
            this._pan = vec3.create();
            this._panOffset = vec3.create();
            this._up = vec3.fromValues(0, 1, 0);

            this._upQuaternion = quat.fromValues(1, 0, 0, 0);
            this._upQuarternionInverse = quat.create();
            quat.invert(this._upQuarternionInverse, this._upQuaternion);

            this._thetaDelta = 0;
            this._phiDelta = 0;
            this._scale = DEFAULT_RADIUS_SCALE;

            this.update();
        };

        OrbitCamera.prototype.rotate = function (deltaX, deltaY) {
            this._thetaDelta -= 2 * Math.PI * deltaX / this._viewportWidth * ROTATION_SPEED;
            this._phiDelta -= 2 * Math.PI * deltaY / this._viewportHeight * ROTATION_SPEED;

            this.update();
        };

        OrbitCamera.prototype.zoomIn = function (zoomFactor) {
            this._scale *= (zoomFactor || ZOOM_FACTOR);

            this.update();
        };

        OrbitCamera.prototype.zoomOut = function (zoomFactor) {
            this._scale /= (zoomFactor || ZOOM_FACTOR);

            this.update();
        };

        OrbitCamera.prototype.pan = function (deltaX, deltaY) {
            mat4.invert(this._cameraMatrixInverse, this._cameraMatrix);
            vec3.sub(this._offset, this._position, this._target);
            var distance = vec3.length(this._offset);

            distance *= Math.tan((FOV / 2) * RADS_PER_DEGREE);

            var xDistance = 2 * deltaX * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[0], this._cameraMatrixInverse[1], this._cameraMatrixInverse[2]);
            vec3.scale(this._panOffset, this._panOffset, xDistance);
            vec3.add(this._pan, this._pan, this._panOffset);

            var yDistance = 2 * deltaY * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[4], this._cameraMatrixInverse[5], this._cameraMatrixInverse[6]);
            vec3.scale(this._panOffset, this._panOffset, yDistance);
            vec3.add(this._pan, this._pan, this._panOffset);

            this.update();
        };

        OrbitCamera.prototype.update = function () {
            vec3.sub(this._offset, this._position, this._target);
            vec3.transformQuat(this._offset, this._offset, this._upQuaternion);

            var offsetX = this._offset[0];
            var offsetY = this._offset[1];
            var offsetZ = this._offset[2];

            var theta = Math.atan2(offsetX, offsetZ);
            var phi = Math.atan2(Math.sqrt(offsetX * offsetX + offsetZ * offsetZ), offsetY);

            theta += this._thetaDelta;
            phi += this._phiDelta;

            phi = Math.max(PHI_EPS, Math.min(Math.PI - PHI_EPS, phi));

            var radius = vec3.length(this._offset) * this._scale;

            this._offset[0] = radius * Math.sin(phi) * Math.sin(theta);
            this._offset[1] = radius * Math.cos(phi);
            this._offset[2] = radius * Math.sin(phi) * Math.cos(theta);

            vec3.transformQuat(this._offset, this._offset, this._upQuarternionInverse);

            vec3.add(this._target, this._target, this._pan);
            vec3.add(this._position, this._target, this._offset);

            this._scale = DEFAULT_RADIUS_SCALE;
            this._thetaDelta = 0;
            this._phiDelta = 0;
            vec3.set(this._pan, 0, 0, 0);

            mat4.lookAt(this._cameraMatrix, this._position, this._target, this._up);
        };

        Object.defineProperty(OrbitCamera.prototype, "matrix", {
            get: function () {
                return this._cameraMatrix;
            },
            enumerable: true,
            configurable: true
        });
        return OrbitCamera;
    })();
})(RwxViewer || (RwxViewer = {}));
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
//TODO: Restore billboard mesh handling.  Still not 100% sure how to do this.
var RwxViewer;
(function (RwxViewer) {
    var MeshDrawableBuilder = (function () {
        function MeshDrawableBuilder(gl, model) {
            var _this = this;
            this._gl = gl;
            this._model = model;
            this._identityMatrix = mat4.create();

            this._prototypeMap = {};
            model.Prototypes.forEach(function (prototype) {
                return _this._prototypeMap[prototype.Name] = prototype;
            });
        }
        MeshDrawableBuilder.prototype.build = function () {
            return this.buildMeshDrawableFromClump(this._model.Clump, mat4.create());
        };

        MeshDrawableBuilder.prototype.buildMeshDrawableFromClump = function (clump, transformMatrix) {
            var meshData = this.buildGeometryMeshData(clump, this._identityMatrix);
            var matrix = mat4.clone(clump.Transform.Matrix);

            mat4.multiply(matrix, transformMatrix, matrix);

            return new RwxViewer.MeshDrawable(meshData.subMeshes, meshData.meshChildren, matrix, clump.Tag, this._model.AxisAlignment !== 0 /* None */);
        };

        MeshDrawableBuilder.prototype.buildGeometryMeshData = function (geometry, transformMatrix) {
            var _this = this;
            var subMeshes = this.buildSubMeshes(geometry, transformMatrix);
            var meshChildren = geometry.Children.map(function (child) {
                return _this.buildMeshDrawableFromClump(child, transformMatrix);
            });

            geometry.PrototypeInstances.forEach(function (instance) {
                var meshData = _this.buildPrototypeMeshData(instance, transformMatrix);
                subMeshes = subMeshes.concat(meshData.subMeshes);
                meshChildren = meshChildren.concat(meshData.meshChildren);
            });

            subMeshes = subMeshes.concat(this.buildPrimitiveSubMeshes(geometry.Primitives, transformMatrix));

            return {
                subMeshes: subMeshes,
                meshChildren: meshChildren
            };
        };

        MeshDrawableBuilder.prototype.buildPrototypeMeshData = function (prototypeInstance, transformMatrix) {
            var prototype = this._prototypeMap[prototypeInstance.Name];
            var prototypeMatrix = mat4.create();
            mat4.mul(prototypeMatrix, transformMatrix, mat4.clone(prototypeInstance.Transform.Matrix));

            return this.buildGeometryMeshData(prototype, prototypeMatrix);
        };

        MeshDrawableBuilder.prototype.buildPrimitiveSubMeshes = function (primitives, transformMatrix) {
            var _this = this;
            var subMeshes = [];

            primitives.forEach(function (primitive) {
                var primitiveMatrix = mat4.create();
                mat4.mul(primitiveMatrix, transformMatrix, mat4.clone(primitive.Transform.Matrix));

                subMeshes = subMeshes.concat(_this.buildSubMeshes(primitive, primitiveMatrix));
            });

            return subMeshes;
        };

        MeshDrawableBuilder.prototype.buildSubMeshes = function (geometry, transformMatrix) {
            var _this = this;
            var facesByMaterial = [];

            geometry.Faces.forEach(function (face) {
                if (face.MaterialId in facesByMaterial) {
                    facesByMaterial[face.MaterialId].push(face);
                } else {
                    facesByMaterial[face.MaterialId] = [face];
                }
            });

            return facesByMaterial.map(function (faces, materialId) {
                var sourceMaterial = _this._model.Materials[materialId];
                var resultMaterial = {
                    baseColor: vec4.fromValues(sourceMaterial.Color.R, sourceMaterial.Color.G, sourceMaterial.Color.B, 1.0),
                    opacity: sourceMaterial.Opacity,
                    ambient: sourceMaterial.Ambient,
                    diffuse: sourceMaterial.Diffuse,
                    texture: RwxViewer.TextureCache.getTexture(_this._gl, sourceMaterial.Texture, 1 /* MipMap */),
                    mask: RwxViewer.TextureCache.getTexture(_this._gl, sourceMaterial.Mask, 0 /* None */),
                    drawMode: sourceMaterial.GeometrySampling === 1 /* Wireframe */ ? _this._gl.LINES : _this._gl.TRIANGLES
                };

                return {
                    vertexBuffer: _this.buildVertexBuffer(transformMatrix, geometry.Vertices, faces, sourceMaterial),
                    material: resultMaterial
                };
            });
        };

        MeshDrawableBuilder.prototype.buildVertexBuffer = function (transformMatrix, vertices, faces, material) {
            var buffers = material.GeometrySampling === 1 /* Wireframe */ ? this.buildLineBuffers(transformMatrix, vertices, faces) : this.buildTriangleBuffers(transformMatrix, vertices, faces, material);

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
        };

        MeshDrawableBuilder.prototype.buildLineBuffers = function (transformMatrix, vertices, faces) {
            var _this = this;
            var positions = [];
            var uvs = [];
            var normals = [];

            faces.forEach(function (face) {
                var length = face.Indices.length;
                for (var index = 0; index < length; ++index) {
                    var indices = [face.Indices[index], face.Indices[(index + 1) % length]];

                    indices.forEach(function (vertexIndex) {
                        var vertex = vertices[vertexIndex];

                        Array.prototype.push.apply(positions, _this.computeVertexPosition(transformMatrix, vertex));
                        uvs.push(((vertex.UV) || {}).U || 0, ((vertex.UV) || {}).V || 0);
                        normals.push(vertex.Normal.X, vertex.Normal.Y, vertex.Normal.Z);
                    });
                }
            });

            return {
                positions: new Float32Array(positions),
                uvs: new Float32Array(uvs),
                normals: new Float32Array(normals)
            };
        };

        MeshDrawableBuilder.prototype.buildTriangleBuffers = function (transformMatrix, vertices, faces, material) {
            var _this = this;
            var positions = [];
            var uvs = [];
            var normals = [];

            var normalMatrix = mat3.create();
            mat3.normalFromMat4(normalMatrix, transformMatrix);

            faces.forEach(function (face) {
                face.Triangles.forEach(function (triangle) {
                    triangle.Indices.forEach(function (index) {
                        var vertex = vertices[index];
                        var normal = material.LightSampling == 1 /* Vertex */ ? vertex.Normal : triangle.Normal;

                        Array.prototype.push.apply(positions, _this.computeVertexPosition(transformMatrix, vertex));
                        uvs.push(((vertex.UV) || {}).U || 0, ((vertex.UV) || {}).V || 0);

                        Array.prototype.push.apply(normals, _this.computeNormal(normalMatrix, normal));
                    });
                });
            });

            return {
                positions: new Float32Array(positions),
                uvs: new Float32Array(uvs),
                normals: new Float32Array(normals)
            };
        };

        MeshDrawableBuilder.prototype.computeNormal = function (normalMatrix, normal) {
            var normalVector = [normal.X, normal.Y, normal.Z];
            return vec3.transformMat3(normalVector, normalVector, normalMatrix);
        };

        MeshDrawableBuilder.prototype.computeVertexPosition = function (transformMatrix, vertex) {
            var vertexVector = [vertex.Position.X, vertex.Position.Y, vertex.Position.Z];
            return vec3.transformMat4(vertexVector, vertexVector, transformMatrix);
        };
        return MeshDrawableBuilder;
    })();

    function createDrawableFromModel(gl, model) {
        return new MeshDrawableBuilder(gl, model).build();
    }
    RwxViewer.createDrawableFromModel = createDrawableFromModel;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var EmptyTexture = (function () {
        function EmptyTexture(gl) {
            this._gl = gl;
        }
        EmptyTexture.prototype.bind = function (slot, sampler) {
            var slotName = "TEXTURE" + slot;
            var gl = this._gl;

            gl.activeTexture(gl[slotName]);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.uniform1i(sampler, slot);
        };

        EmptyTexture.prototype.update = function (frameCount) {
            //No op on a static texture.
        };

        Object.defineProperty(EmptyTexture.prototype, "isEmpty", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        return EmptyTexture;
    })();
    RwxViewer.EmptyTexture = EmptyTexture;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    function makeGrid(gl) {
        return new GridDrawable(gl);
    }
    RwxViewer.makeGrid = makeGrid;

    var GridDrawable = (function () {
        function GridDrawable(gl) {
            this._animation = RwxViewer.Animation.getDefaultAnimation();
            this.initializeNew(gl);
        }
        GridDrawable.prototype.initializeNew = function (gl) {
            var vertices = [];

            for (var x = -1; x <= 1; x += 0.1) {
                vertices.push(x, 0, -1);
                vertices.push(x, 0, 1);
            }

            for (var z = -1; z <= 1; z += 0.1) {
                vertices.push(-1, 0, z);
                vertices.push(1, 0, z);
            }

            this._vertexCount = vertices.length / 3;
            this._vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        };

        Object.defineProperty(GridDrawable.prototype, "animation", {
            get: function () {
                return this._animation;
            },
            enumerable: true,
            configurable: true
        });

        GridDrawable.prototype.cloneWithAnimation = function (animation) {
            return this;
        };

        GridDrawable.prototype.draw = function (gl, shader) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._vertexCount);
        };
        return GridDrawable;
    })();
    RwxViewer.GridDrawable = GridDrawable;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    //TODO: Handle prelit meshes.
    var MeshDrawable = (function () {
        function MeshDrawable(subMeshes, children, modelMatrix, jointTag, isBillboard, animation) {
            this._subMeshes = subMeshes;
            this._children = children;
            this._isBillboard = isBillboard || false;
            this._animation = animation || RwxViewer.Animation.getDefaultAnimation();
            this._jointTag = jointTag || 0;
            this._modelMatrix = modelMatrix;
            this._transformMatrix = mat4.create();
            this._normalMatrix = mat3.create();
        }
        Object.defineProperty(MeshDrawable.prototype, "animation", {
            get: function () {
                return this._animation;
            },
            enumerable: true,
            configurable: true
        });

        MeshDrawable.prototype.cloneWithAnimation = function (animation) {
            return new MeshDrawable(this._subMeshes, this._children.map(function (child) {
                return child.cloneWithAnimation(animation);
            }), this._modelMatrix, this._jointTag, this._isBillboard, animation);
        };

        MeshDrawable.prototype.draw = function (gl, shader, transformMatrix, time) {
            var _this = this;
            this.setTransformUniforms(gl, shader, transformMatrix, time);

            this._subMeshes.forEach(function (subMesh) {
                _this.setMaterialUniforms(gl, shader, subMesh.material);
                _this.bindTexture(gl, shader, subMesh.material, time);
                _this.bindMask(gl, shader, subMesh.material, time);
                _this.bindVertexBuffers(gl, shader, subMesh.vertexBuffer);

                gl.drawArrays(subMesh.material.drawMode, 0, subMesh.vertexBuffer.count);
            });

            this._children.forEach(function (child) {
                return child.draw(gl, shader, _this._transformMatrix, time);
            });
        };

        MeshDrawable.prototype.setTransformUniforms = function (gl, shader, transformMatrix, time) {
            mat4.multiply(this._transformMatrix, this._modelMatrix, this._animation.getTransformForTime(this._jointTag, time));
            mat4.multiply(this._transformMatrix, transformMatrix, this._transformMatrix);
            mat3.normalFromMat4(this._normalMatrix, this._transformMatrix);

            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, this._transformMatrix);
            gl.uniformMatrix3fv(shader.uniforms["u_normalMatrix"], false, this._normalMatrix);
            gl.uniform1i(shader.uniforms["u_isBillboard"], this._isBillboard ? 1 : 0);
        };

        MeshDrawable.prototype.setMaterialUniforms = function (gl, shader, material) {
            gl.uniform1f(shader.uniforms["u_ambientFactor"], material.ambient);
            gl.uniform1f(shader.uniforms["u_diffuseFactor"], material.diffuse);
            gl.uniform4fv(shader.uniforms["u_baseColor"], material.baseColor);
            gl.uniform1f(shader.uniforms["u_opacity"], material.opacity);
        };

        MeshDrawable.prototype.bindTexture = function (gl, shader, material, time) {
            gl.uniform1i(shader.uniforms["u_hasTexture"], material.texture.isEmpty ? 0 : 1);
            material.texture.update(time);
            material.texture.bind(0, shader.uniforms["u_textureSampler"]);
        };

        MeshDrawable.prototype.bindMask = function (gl, shader, material, time) {
            gl.uniform1i(shader.uniforms["u_hasMask"], material.mask.isEmpty ? 0 : 1);
            material.mask.update(time);
            material.mask.bind(1, shader.uniforms["u_maskSampler"]);
        };

        MeshDrawable.prototype.bindVertexBuffers = function (gl, shader, vertexBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.positions);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.uvs);
            gl.vertexAttribPointer(shader.attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.normals);
            gl.vertexAttribPointer(shader.attributes["a_vertexNormal"], 3, gl.FLOAT, true, 0, 0);
        };
        return MeshDrawable;
    })();
    RwxViewer.MeshDrawable = MeshDrawable;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    (function (AxisAlignment) {
        AxisAlignment[AxisAlignment["None"] = 0] = "None";
        AxisAlignment[AxisAlignment["ZOrientX"] = 1] = "ZOrientX";
        AxisAlignment[AxisAlignment["ZOrientY"] = 2] = "ZOrientY";
        AxisAlignment[AxisAlignment["Xyz"] = 3] = "Xyz";
    })(RwxViewer.AxisAlignment || (RwxViewer.AxisAlignment = {}));
    var AxisAlignment = RwxViewer.AxisAlignment;

    (function (GeometrySampling) {
        GeometrySampling[GeometrySampling["Solid"] = 0] = "Solid";
        GeometrySampling[GeometrySampling["Wireframe"] = 1] = "Wireframe";
        GeometrySampling[GeometrySampling["Pointcloud"] = 2] = "Pointcloud";
    })(RwxViewer.GeometrySampling || (RwxViewer.GeometrySampling = {}));
    var GeometrySampling = RwxViewer.GeometrySampling;

    (function (LightSampling) {
        LightSampling[LightSampling["Facet"] = 0] = "Facet";
        LightSampling[LightSampling["Vertex"] = 1] = "Vertex";
    })(RwxViewer.LightSampling || (RwxViewer.LightSampling = {}));
    var LightSampling = RwxViewer.LightSampling;

    (function (TextureMode) {
        TextureMode[TextureMode["Null"] = 0] = "Null";
        TextureMode[TextureMode["Lit"] = 1] = "Lit";
        TextureMode[TextureMode["Foreshorten"] = 2] = "Foreshorten";
        TextureMode[TextureMode["Filter"] = 4] = "Filter";
    })(RwxViewer.TextureMode || (RwxViewer.TextureMode = {}));
    var TextureMode = RwxViewer.TextureMode;

    (function (TextureAddressMode) {
        TextureAddressMode[TextureAddressMode["Wrap"] = 0] = "Wrap";
        TextureAddressMode[TextureAddressMode["Mirror"] = 1] = "Mirror";
        TextureAddressMode[TextureAddressMode["Clamp"] = 2] = "Clamp";
    })(RwxViewer.TextureAddressMode || (RwxViewer.TextureAddressMode = {}));
    var TextureAddressMode = RwxViewer.TextureAddressMode;

    (function (MaterialMode) {
        MaterialMode[MaterialMode["Null"] = 0] = "Null";
        MaterialMode[MaterialMode["Double"] = 1] = "Double";
    })(RwxViewer.MaterialMode || (RwxViewer.MaterialMode = {}));
    var MaterialMode = RwxViewer.MaterialMode;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var Renderer = (function () {
        function Renderer(gl) {
            this._projectionMatrix = mat4.create();
            this._modelMatrix = mat4.create();
            this._gl = gl;
        }
        Renderer.prototype.initialize = function (mainProgram, gridProgram) {
            var gl = this._gl;

            if (gl) {
                this._camera = RwxViewer.makeCamera(gl.drawingBufferWidth, gl.drawingBufferHeight);
                this._spatialGridDrawable = RwxViewer.makeGrid(gl);

                gl.clearColor(0.75, 0.75, 0.75, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }

            this._mainProgram = mainProgram;
            this._gridProgram = gridProgram;
        };

        Renderer.prototype.draw = function (time) {
            var _this = this;
            var gl = this._gl;

            if (gl) {
                gl.viewport(0, 0, this._viewportWidth, this._viewportHeight);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                mat4.perspective(this._projectionMatrix, 45, this._viewportWidth / this._viewportHeight, 0.01, 1000.0);

                this._gridProgram.use(function (program) {
                    gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, _this._projectionMatrix);
                    gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, _this._camera.matrix);
                    _this._spatialGridDrawable.draw(gl, program);
                });

                this._mainProgram.use(function (program) {
                    if (_this._currentDrawable) {
                        gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, _this._projectionMatrix);
                        gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, _this._camera.matrix);
                        _this._currentDrawable.draw(gl, program, _this._modelMatrix, time);
                    }
                });
            }
        };

        Renderer.prototype.setCurrentModel = function (model) {
            if (model) {
                this._currentDrawable = RwxViewer.createDrawableFromModel(this._gl, model);

                var boundingBox = RwxViewer.BoundingBox.computeBoundingBox(model);
                mat4.translate(this._modelMatrix, mat4.create(), [0, -boundingBox.minimumY, 0]);
            } else {
                this._currentDrawable = null;
            }
        };

        Renderer.prototype.setCurrentAnimation = function (animation) {
            if (this._currentDrawable) {
                if (animation) {
                    this._currentDrawable = this._currentDrawable.cloneWithAnimation(RwxViewer.Animation.getSequenceAnimation(animation));
                } else {
                    this._currentDrawable = this._currentDrawable.cloneWithAnimation(RwxViewer.Animation.getDefaultAnimation());
                }
            }
        };

        Object.defineProperty(Renderer.prototype, "camera", {
            get: function () {
                return this._camera;
            },
            enumerable: true,
            configurable: true
        });

        Renderer.prototype.updateViewport = function (width, height) {
            this._viewportWidth = width;
            this._viewportHeight = height;

            if (this._camera) {
                this._camera.setViewportSize(width, height);
            }
        };
        return Renderer;
    })();
    RwxViewer.Renderer = Renderer;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var ShaderProgram = (function () {
        function ShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
            this._gl = gl;
            this._shaderProgram = this.initializeProgram(vertexShaderSource, fragmentShaderSource);
            this._uniforms = this.getUniforms();
            this._attributes = this.getAttributes();
        }
        ShaderProgram.prototype.initializeProgram = function (vertexShaderSource, fragmentShaderSource) {
            var gl = this._gl;
            var vertexShader = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
            var fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramParameter(shaderProgram, gl.LINK_STATUS));
            }

            return shaderProgram;
        };

        ShaderProgram.prototype.getUniforms = function () {
            var gl = this._gl;

            var totalUniforms = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_UNIFORMS);
            var uniforms = {};

            for (var uniformIndex = 0; uniformIndex < totalUniforms; ++uniformIndex) {
                var uniform = gl.getActiveUniform(this._shaderProgram, uniformIndex);
                uniforms[uniform.name] = gl.getUniformLocation(this._shaderProgram, uniform.name);
            }

            return uniforms;
        };

        ShaderProgram.prototype.getAttributes = function () {
            var gl = this._gl;
            var attributeCount = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_ATTRIBUTES);
            var attributes = {};
            this._attributeCount = attributeCount;

            for (var attributeIndex = 0; attributeIndex < attributeCount; ++attributeIndex) {
                var attribute = gl.getActiveAttrib(this._shaderProgram, attributeIndex);
                attributes[attribute.name] = attributeIndex;
            }

            return attributes;
        };

        Object.defineProperty(ShaderProgram.prototype, "attributes", {
            get: function () {
                return this._attributes;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ShaderProgram.prototype, "uniforms", {
            get: function () {
                return this._uniforms;
            },
            enumerable: true,
            configurable: true
        });

        ShaderProgram.prototype.compileShader = function (shaderSource, type) {
            var gl = this._gl;
            var shader = gl.createShader(type);

            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            }

            throw new Error(gl.getShaderInfoLog(shader));
        };

        ShaderProgram.prototype.use = function (handler) {
            this._gl.useProgram(this._shaderProgram);

            for (var counter = 0; counter < this._attributeCount; ++counter) {
                this._gl.enableVertexAttribArray(counter);
            }

            handler(this);

            for (counter = 0; counter < this._attributeCount; ++counter) {
                this._gl.disableVertexAttribArray(counter);
            }
        };
        return ShaderProgram;
    })();
    RwxViewer.ShaderProgram = ShaderProgram;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var StaticTexture = (function () {
        function StaticTexture(gl, imageSource, textureFactory) {
            this._gl = gl;
            this._texture = textureFactory.getTexture(this.getImageSource(imageSource));
        }
        StaticTexture.prototype.getImageSource = function (imageSource) {
            var widthIsPowerOfTwo = (imageSource.width & (imageSource.width - 1)) === 0;
            var heightIsPowerOfTwo = (imageSource.height & (imageSource.height - 1)) === 0;

            if (widthIsPowerOfTwo && heightIsPowerOfTwo) {
                return imageSource;
            }

            return this.getScaledImage(imageSource);
        };

        StaticTexture.prototype.getScaledImage = function (imageSource) {
            var smallestDimension = imageSource.width <= imageSource.height ? imageSource.width : imageSource.height;
            var roundedDimension = Math.pow(2, Math.floor(Math.log(smallestDimension) / Math.log(2)));
            var canvas = document.createElement("canvas");

            canvas.width = roundedDimension;
            canvas.height = roundedDimension;
            canvas.getContext("2d").drawImage(imageSource, 0, 0, roundedDimension, roundedDimension);
            return canvas;
        };

        StaticTexture.prototype.bind = function (slot, sampler) {
            var slotName = "TEXTURE" + slot;
            var gl = this._gl;

            gl.activeTexture(gl[slotName]);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.uniform1i(sampler, slot);
        };

        StaticTexture.prototype.update = function (frameCount) {
            //No op on a static texture.
        };

        Object.defineProperty(StaticTexture.prototype, "isEmpty", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        return StaticTexture;
    })();
    RwxViewer.StaticTexture = StaticTexture;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    (function (TextureFilteringMode) {
        TextureFilteringMode[TextureFilteringMode["None"] = 0] = "None";
        TextureFilteringMode[TextureFilteringMode["MipMap"] = 1] = "MipMap";
    })(RwxViewer.TextureFilteringMode || (RwxViewer.TextureFilteringMode = {}));
    var TextureFilteringMode = RwxViewer.TextureFilteringMode;

    (function (TextureCache) {
        var imageCache = {};
        var textureCache = {};

        var emptyTexture = null;

        function addImageToCache(name, image) {
            if (!(name in imageCache)) {
                imageCache[name] = image;
            }
        }
        TextureCache.addImageToCache = addImageToCache;

        function getTexture(gl, name, filteringMode) {
            if (emptyTexture === null) {
                emptyTexture = new RwxViewer.EmptyTexture(gl);
            }

            if (!name) {
                return emptyTexture;
            }

            var textureCacheKey = buildCacheKey(name, filteringMode);
            var texture = getFromCache(textureCacheKey);

            if (texture) {
                return texture;
            }

            texture = createTexture(gl, imageCache[name], filteringMode);

            if (texture) {
                addToCache(textureCacheKey, texture);
            }

            return texture;
        }
        TextureCache.getTexture = getTexture;

        function createTexture(gl, imageSource, filteringMode) {
            if (imageSource) {
                if (imageSource.width < imageSource.height && imageSource.height % imageSource.width === 0) {
                    return new RwxViewer.AnimatedTexture(gl, imageSource, RwxViewer.TextureFactory.getFactory(gl, filteringMode));
                } else {
                    return new RwxViewer.StaticTexture(gl, imageSource, RwxViewer.TextureFactory.getFactory(gl, filteringMode));
                }
            }

            return emptyTexture;
        }

        function buildCacheKey(name, filteringMode) {
            if (filteringMode === 0 /* None */) {
                return "not-filtered-" + name;
            } else {
                return "filtered-" + name;
            }
        }

        function getFromCache(name) {
            if (name in textureCache) {
                return textureCache[name];
            }

            return null;
        }

        function addToCache(name, texture) {
            if (!(name in textureCache)) {
                textureCache[name] = texture;
            }
        }
    })(RwxViewer.TextureCache || (RwxViewer.TextureCache = {}));
    var TextureCache = RwxViewer.TextureCache;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    (function (TextureFactory) {
        function getFactory(gl, filteringMode) {
            switch (filteringMode) {
                case 1 /* MipMap */:
                    return new MipMapTextureFactory(gl);
                default:
                    return new UnfilteredTextureFactory(gl);
            }
        }
        TextureFactory.getFactory = getFactory;
    })(RwxViewer.TextureFactory || (RwxViewer.TextureFactory = {}));
    var TextureFactory = RwxViewer.TextureFactory;

    var MipMapTextureFactory = (function () {
        function MipMapTextureFactory(gl) {
            this._gl = gl;
        }
        MipMapTextureFactory.prototype.getTexture = function (source) {
            var gl = this._gl;
            var texture = gl.createTexture();

            this.fillTexture(texture, source);

            return texture;
        };

        MipMapTextureFactory.prototype.updateTexture = function (texture, source) {
            this.fillTexture(texture, source);
        };

        MipMapTextureFactory.prototype.fillTexture = function (texture, source) {
            var gl = this._gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);

            if (this._anisotropicFilterExt) {
                var maxAnisotropy = gl.getParameter(this._anisotropicFilterExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
                gl.texParameterf(gl.TEXTURE_2D, this._anisotropicFilterExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
            }

            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        return MipMapTextureFactory;
    })();

    var UnfilteredTextureFactory = (function () {
        function UnfilteredTextureFactory(gl) {
            this._gl = gl;
        }
        UnfilteredTextureFactory.prototype.getTexture = function (source) {
            var gl = this._gl;
            var texture = gl.createTexture();

            this.fillTexture(texture, source);

            return texture;
        };

        UnfilteredTextureFactory.prototype.updateTexture = function (texture, source) {
            this.fillTexture(texture, source);
        };

        UnfilteredTextureFactory.prototype.fillTexture = function (texture, source) {
            var gl = this._gl;

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        return UnfilteredTextureFactory;
    })();
})(RwxViewer || (RwxViewer = {}));
