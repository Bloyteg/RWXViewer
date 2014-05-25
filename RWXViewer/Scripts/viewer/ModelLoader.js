define(["require", "exports"], function(require, exports) {
    function loadModel(modelName, handler) {
        $.getJSON("/api/Model/" + modelName).done(function (data) {
            handler(data);
        });
    }
    exports.loadModel = loadModel;
});
//# sourceMappingURL=ModelLoader.js.map
