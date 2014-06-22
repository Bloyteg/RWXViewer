using System;
using System.ComponentModel;
using System.Data.Entity;
using System.Net;
using System.Runtime.Caching;
using System.Threading.Tasks;
using Bloyteg.RwxViewer.Website.Models.DAL;
using MrByte.RWX;

namespace Bloyteg.RwxViewer.Website.Models
{
    public class ModelLoader
    {
        public async Task<MrByte.RWX.Model.Model> GetAsync(int worldId, string modelName)
        {
            var model = LoadFromCache(worldId, modelName);

            if (model != null)
            {
                return model;
            }

            model = await LoadAsync(worldId, modelName);

            if (model != null)
            {
                AddToCache(worldId, modelName, model);
            }

            return model;
        }

        private MrByte.RWX.Model.Model LoadFromCache(int worldId, string modelName)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, modelName);
            return cache[key] as MrByte.RWX.Model.Model;
        }

        private void AddToCache(int worldId, string modelName, MrByte.RWX.Model.Model model)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, modelName);
            cache.Add(key, model, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }

        private string BuildCacheKey(int worldId, string modelName)
        {
            return String.Format("model-{0}/{1}", worldId, modelName);
        }

        private async Task<MrByte.RWX.Model.Model> LoadAsync(int worldId, string modelName)
        {
            using (var context = new ObjectPathContext())
            using (var webClient = new WebClient())
            {
                var model = await context.Models.SingleOrDefaultAsync(entity => entity.WorldId == worldId && entity.Name == modelName);

                if (model == null)
                {
                    return null;
                }

                try
                {
                    var resultData = await webClient.DownloadDataTaskAsync(BuildDownloadUri(model));

                    using (var archiveStream = ArchiveFile.OpenArchiveStream(resultData))
                    {
                        var loader = new Loader();
                        var modelResult = loader.LoadFromStream(archiveStream);

                        return modelResult;
                    }
                }
                catch (WebException)
                {
                    return null;
                }
                catch (InvalidEnumArgumentException)
                {
                    return null;
                }
            }
        }

        private static Uri BuildDownloadUri(Model pathObject)
        {
            return new Uri(String.Format("{0}/{1}/{2}", pathObject.World.ObjectPathUrl, pathObject.Type.ToPathName(), pathObject.FileName));
        }
    }
}