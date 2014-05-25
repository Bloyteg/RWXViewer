using System.Web.Http;
using RWXViewer.Models;

namespace RWXViewer.Controllers
{
    public class ModelController : ApiController
    {
        private readonly IModelLoader _modelLoader;

        public ModelController(IModelLoader modelLoader)
        {
            _modelLoader = modelLoader;
        }

        [Route("api/Model/{name}")]
        public IHttpActionResult Get(string name)
        {
            var model = _modelLoader.GetModel("default", "test.rwx");
            return model == null ? (IHttpActionResult)NotFound() : Ok(model);
        }
    }
}
