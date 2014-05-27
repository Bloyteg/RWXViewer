// Copyright 2014 Joshua R. Rodgers
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
using System;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Threading.Tasks;
using MrByte.RWX;
using MrByte.RWX.Model;

namespace RWXViewer.Models
{
    public class ObjectPathItemLoader : IObjectPathItemLoader
    { 
        public async Task<Model> GetModelAsync(int id)
        {
            var model = LoadFromCache(id);

            if (model != null)
            {
                return model;
            }

            model = await LoadFromObjectPath(id);

            if (model != null)
            {
                AddToCache(id, model);
            }

            return model;
        }

        private static Model LoadFromCache(int id)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(id);
            var model = cache[key] as Model;
            return model;
        }

        private void AddToCache(int id, Model model)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(id);
            cache.Add(key, model, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }

        private static string BuildCacheKey(int id)
        {
            return string.Format("Model-{0}", id);
        }

        private static async Task<Model> LoadFromObjectPath(int id)
        {
            using (var context = new ObjectPathContext())
            using (var webClient = new WebClient())
            {
                var pathObject = await context.ObjectPathItem.FindAsync(id);

                if (pathObject != null)
                {
                    try
                    {
                        var resultData = await webClient.DownloadDataTaskAsync(BuildDownloadUri(pathObject));
                        var archiveType = GetArchiveType(resultData);

                        if (archiveType != ArchiveType.Unknown)
                        {
                            using (var archiveStream = OpenArchiveStream(archiveType, resultData))
                            {
                                var loader = new Loader();
                                Model model = loader.LoadFromStream(archiveStream);

                                return model;
                            }
                        }
                    }
                    catch (WebException)
                    {
                        return null;
                    }
                }
            }

            return null;
        }

        private static Stream OpenArchiveStream(ArchiveType archiveType, byte[] streamData)
        {
            switch (archiveType)
            {
            case ArchiveType.Zip:
                return OpenZipArchive(streamData);

            case ArchiveType.Gzip:
                return OpenGzipArchive(streamData);

            default:
                throw new InvalidEnumArgumentException("archiveType");
            }
        }

        private static Stream OpenGzipArchive(byte[] streamData)
        {
            return new GZipStream(new MemoryStream(streamData), CompressionMode.Decompress);
        }

        private static Stream OpenZipArchive(byte[] streamData)
        {
            var zipArchive = new ZipArchive(new MemoryStream(streamData), ZipArchiveMode.Read);
            return zipArchive.Entries.First().Open();
        }

        private static ArchiveType GetArchiveType(byte[] resultData)
        {
            if (resultData.Length >= 4)
            {
                if (resultData[0] == 0x50 && resultData[1] == 0x4B && resultData[2] == 0x03 && resultData[3] == 0x04)
                {
                    return ArchiveType.Zip;
                }
                
                if (resultData[0] == 0x1F && resultData[2] == 0x8B)
                {
                    return ArchiveType.Gzip;
                }
            }

            return ArchiveType.Unknown;
        }

        private static Uri BuildDownloadUri(ObjectPathItem pathObject)
        {
            return new Uri(string.Format("{0}/{1}/{2}", pathObject.World.ObjectPathUrl, pathObject.Type.ToPathName(), pathObject.FileName));
        }
    }

    internal enum ArchiveType
    {
        Zip,
        Gzip,
        Unknown
    }
}