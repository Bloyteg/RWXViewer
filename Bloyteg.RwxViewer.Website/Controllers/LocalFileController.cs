using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using MrByte.RWX;

namespace Bloyteg.RwxViewer.Website.Controllers
{
    public class LocalFileController : ApiController
    {
        [HttpPost, Route("api/LocalFile/Convert/RWX")]
        public async Task<IHttpActionResult> ConvertRwx()
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            var provider = new MultipartMemoryStreamProvider();
            await Request.Content.ReadAsMultipartAsync(provider);

            var file = provider.Contents.FirstOrDefault();

            if(file != null)
            {
                using (var stream = await file.ReadAsStreamAsync())
                {
                    return Ok(new Loader().LoadFromStream(stream));
                }
            }

            return NotFound();
        }
    }
}