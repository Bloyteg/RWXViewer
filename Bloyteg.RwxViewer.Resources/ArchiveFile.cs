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
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace Bloyteg.RwxViewer.Resources
{
    public enum ArchiveType
    {
        Zip,
        Gzip,
        Unknown
    }

    public class ArchiveFile
    {
        public static Stream OpenArchiveStream(byte[] streamData)
        {
            var archiveType = GetArchiveType(streamData);

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
            if (resultData.Length < 4)
            {
                return ArchiveType.Unknown;
            }

            if (resultData[0] == 0x50 && resultData[1] == 0x4B && resultData[2] == 0x03 && resultData[3] == 0x04)
            {
                return ArchiveType.Zip;
            }
                
            if (resultData[0] == 0x1F && resultData[1] == 0x8B)
            {
                return ArchiveType.Gzip;
            }

            return ArchiveType.Unknown;
        }
    }
}