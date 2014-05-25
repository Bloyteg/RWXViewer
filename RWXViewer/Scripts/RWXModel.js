var AxisAlignment;
(function (AxisAlignment) {
    AxisAlignment[AxisAlignment["None"] = 0] = "None";
    AxisAlignment[AxisAlignment["ZOrientX"] = 1] = "ZOrientX";
    AxisAlignment[AxisAlignment["ZOrientY"] = 2] = "ZOrientY";
    AxisAlignment[AxisAlignment["Xyz"] = 3] = "Xyz";
})(AxisAlignment || (AxisAlignment = {}));

var GeometrySampling;
(function (GeometrySampling) {
    GeometrySampling[GeometrySampling["Solid"] = 0] = "Solid";
    GeometrySampling[GeometrySampling["Wireframe"] = 1] = "Wireframe";
    GeometrySampling[GeometrySampling["Pointcloud"] = 2] = "Pointcloud";
})(GeometrySampling || (GeometrySampling = {}));

var LightSampling;
(function (LightSampling) {
    LightSampling[LightSampling["Facet"] = 0] = "Facet";
    LightSampling[LightSampling["Vertex"] = 1] = "Vertex";
})(LightSampling || (LightSampling = {}));

var TextureMode;
(function (TextureMode) {
    TextureMode[TextureMode["Null"] = 0] = "Null";
    TextureMode[TextureMode["Lit"] = 1] = "Lit";
    TextureMode[TextureMode["Foreshorten"] = 2] = "Foreshorten";
    TextureMode[TextureMode["Filter"] = 4] = "Filter";
})(TextureMode || (TextureMode = {}));

var TextureAddressMode;
(function (TextureAddressMode) {
    TextureAddressMode[TextureAddressMode["Wrap"] = 0] = "Wrap";
    TextureAddressMode[TextureAddressMode["Mirror"] = 1] = "Mirror";
    TextureAddressMode[TextureAddressMode["Clamp"] = 2] = "Clamp";
})(TextureAddressMode || (TextureAddressMode = {}));

var MaterialMode;
(function (MaterialMode) {
    MaterialMode[MaterialMode["Null"] = 0] = "Null";
    MaterialMode[MaterialMode["Double"] = 1] = "Double";
})(MaterialMode || (MaterialMode = {}));
//# sourceMappingURL=RWXModel.js.map
