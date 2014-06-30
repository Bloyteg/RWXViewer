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
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Bloyteg.RwxViewer.Resources.DAL;

namespace Bloyteg.RwxViewer.Resources
{
    public class TextureDownloader : IResourceDownloader<Texture, byte[]>
    {
        public async Task<byte[]> DownloadResourceAsync(Texture texture)
        {
            using (var webClient = new WebClient())
            {
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