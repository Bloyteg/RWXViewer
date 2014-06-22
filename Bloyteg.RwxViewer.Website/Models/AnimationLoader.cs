using System;
using System.Data.Entity;
using System.IO;
using System.Net;
using System.Runtime.Caching;
using System.Threading.Tasks;
using Bloyteg.AW.Animation.Seq;
using Bloyteg.RwxViewer.Website.Models.DAL;
using Animation = Bloyteg.AW.Animation.Seq.Animation;

namespace Bloyteg.RwxViewer.Website.Models
{
    internal class AnimationLoader
    {
        public async Task<Animation> GetAnimationAsync(int id, string animationName)
        {
            var animation = LoadFromCache(id, animationName);

            if (animation != null)
            {
                return animation;
            }

            animation = await LoadAsync(id, animationName);

            if (animation != null)
            {
                AddToCache(id, animationName, animation);
            }

            return animation;
        }

        private Animation LoadFromCache(int worldId, string textureName)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, textureName);
            return cache[key] as Animation;
        }

        private void AddToCache(int worldId, string animationName, Animation animation)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, animationName);
            cache.Add(key, animation, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }

        private string BuildCacheKey(int worldId, string textureName)
        {
            return string.Format("animation-{0}/{1}", worldId, textureName);
        }

        private async Task<Animation> LoadAsync(int worldId, string animationName)
        {
            using (var context = new ObjectPathContext())
            using (var webClient = new WebClient())
            {
                var animation = await context.Animations.SingleOrDefaultAsync(entity => entity.WorldId == worldId && entity.Name == animationName);

                if (animation == null)
                {
                    return null;
                }

                try
                {
                    var resultData = await webClient.DownloadDataTaskAsync(BuildDownloadUri(animation));

                    using (var inputStream = OpenTextureStream(resultData))
                    {
                        return new Loader().LoadFromStream(inputStream);
                    }

                }
                catch (WebException)
                {
                    return null;
                }
            }
        }

        private Stream OpenTextureStream(byte[] resultData)
        {

            return ArchiveFile.OpenArchiveStream(resultData);
        }

        private static Uri BuildDownloadUri(DAL.Animation animation)
        {
            return new Uri(string.Format("{0}/seqs/{1}", animation.World.ObjectPathUrl, animation.FileName));
        }
    }
}