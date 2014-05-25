using System;
using System.IO;
using System.Runtime.Caching;
using System.Web;
using MrByte.RWX;
using MrByte.RWX.Model;

namespace RWXViewer.Models
{
    public class ModelLoader : IModelLoader
    { 
        public Model GetModel(string group, string name)
        {
            var cache = MemoryCache.Default;
            var key = string.Format("{0}/{1}", group, name);
            var model = cache[key] as Model;

            if (model != null)
            {
                return model;
            }

            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/App_Data/"), @group, name);

            if (!File.Exists(path))
            {
                return null;
            }

            var loader = new Loader();
            model = loader.LoadFromFile(path);
            cache.Add(key, model, DateTimeOffset.Now + TimeSpan.FromHours(24));

            return model;
        }
    }
}