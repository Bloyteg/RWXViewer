using System.Web;
using System.Web.Http;
using MrByte.RWX;
using MrByte.RWX.Model;

namespace RWXViewer.Controllers
{
    public class ModelController : ApiController
    {
        [Route("api/Model/{name}")]
        public Model Get(string name)
        {
            var loader = new Loader();
            return loader.LoadFromFile(HttpContext.Current.Server.MapPath("~/App_Data/" + name));
        }
    }
}
