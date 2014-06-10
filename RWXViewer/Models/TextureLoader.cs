using System;
using System.Data.Entity;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Runtime.Caching;
using System.Threading.Tasks;
using RWXViewer.Models.DAL;

namespace RWXViewer.Models
{
    public class TextureLoader
    {
        public async Task<byte[]> GetTextureAsync(int worldId, string textureName)
        {
            var image = LoadFromCache(worldId, textureName);

            if (image != null)
            {
                return image;
            }

            image = await LoadAsync(worldId, textureName);

            if (image != null)
            {
                AddToCache(worldId, textureName, image);
            }

            return image;
        }

        private byte[] LoadFromCache(int worldId, string textureName)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, textureName);
            return cache[key] as byte[];
        }

        private void AddToCache(int worldId, string textureName, byte[] image)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, textureName);
            cache.Add(key, image, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }

        private string BuildCacheKey(int worldId, string textureName)
        {
            return string.Format("texture-{0}/{1}", worldId, textureName);
        }

        private async Task<byte[]> LoadAsync(int worldId, string textureName)
        {
            using (var context = new ObjectPathContext())
            using (var webClient = new WebClient())
            {
                var texture = await context.Textures.SingleOrDefaultAsync(entity => entity.WorldId == worldId && entity.Name == textureName);

                if (texture == null)
                {
                    return null;
                }

                try
                {
                    var resultData = await webClient.DownloadDataTaskAsync(BuildDownloadUri(texture));

                    using (var inputStream = OpenTextureStream(texture, resultData))
                    using (var outputStream = new MemoryStream())
                    {
                        var image = Image.FromStream(inputStream);
                        image.Save(outputStream, ImageFormat.Png);

                        return outputStream.ToArray();
                    }
                }
                catch (WebException)
                {
                    return null;
                }
            }
        }

        private Stream OpenTextureStream(Texture texture, byte[] resultData)
        {
            var extension = Path.GetExtension(texture.FileName);
            if (extension != null)
            {
                var fileExtension = extension.ToUpperInvariant();

                switch (fileExtension)
                {
                case ".JPG":
                case ".PNG":
                case ".BMP":
                    return new MemoryStream(resultData);

                case ".ZIP":
                    return ArchiveFile.OpenArchiveStream(resultData);

                default:
                    throw new InvalidDataException("The provided file format is not recognized.");
                }
            }

            return null;
        }

        private static Uri BuildDownloadUri(Texture texture)
        {
            return new Uri(String.Format("{0}/textures/{1}", texture.World.ObjectPathUrl, texture.FileName));
        }
    }
}