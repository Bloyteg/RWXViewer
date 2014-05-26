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
    

    (function (AxisAlignment) {
        AxisAlignment[AxisAlignment["None"] = 0] = "None";
        AxisAlignment[AxisAlignment["ZOrientX"] = 1] = "ZOrientX";
        AxisAlignment[AxisAlignment["ZOrientY"] = 2] = "ZOrientY";
        AxisAlignment[AxisAlignment["Xyz"] = 3] = "Xyz";
    })(exports.AxisAlignment || (exports.AxisAlignment = {}));
    var AxisAlignment = exports.AxisAlignment;

    (function (GeometrySampling) {
        GeometrySampling[GeometrySampling["Solid"] = 0] = "Solid";
        GeometrySampling[GeometrySampling["Wireframe"] = 1] = "Wireframe";
        GeometrySampling[GeometrySampling["Pointcloud"] = 2] = "Pointcloud";
    })(exports.GeometrySampling || (exports.GeometrySampling = {}));
    var GeometrySampling = exports.GeometrySampling;

    (function (LightSampling) {
        LightSampling[LightSampling["Facet"] = 0] = "Facet";
        LightSampling[LightSampling["Vertex"] = 1] = "Vertex";
    })(exports.LightSampling || (exports.LightSampling = {}));
    var LightSampling = exports.LightSampling;

    (function (TextureMode) {
        TextureMode[TextureMode["Null"] = 0] = "Null";
        TextureMode[TextureMode["Lit"] = 1] = "Lit";
        TextureMode[TextureMode["Foreshorten"] = 2] = "Foreshorten";
        TextureMode[TextureMode["Filter"] = 4] = "Filter";
    })(exports.TextureMode || (exports.TextureMode = {}));
    var TextureMode = exports.TextureMode;

    (function (TextureAddressMode) {
        TextureAddressMode[TextureAddressMode["Wrap"] = 0] = "Wrap";
        TextureAddressMode[TextureAddressMode["Mirror"] = 1] = "Mirror";
        TextureAddressMode[TextureAddressMode["Clamp"] = 2] = "Clamp";
    })(exports.TextureAddressMode || (exports.TextureAddressMode = {}));
    var TextureAddressMode = exports.TextureAddressMode;

    (function (MaterialMode) {
        MaterialMode[MaterialMode["Null"] = 0] = "Null";
        MaterialMode[MaterialMode["Double"] = 1] = "Double";
    })(exports.MaterialMode || (exports.MaterialMode = {}));
    var MaterialMode = exports.MaterialMode;
});
//# sourceMappingURL=Model.js.map
