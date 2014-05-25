import Model = require("Model");

export function loadModel(modelName: string, handler: (model: Model.IModel) => void) {
    $.getJSON("/api/Model/" + modelName).done((data) => {
        handler(data);
    });
}