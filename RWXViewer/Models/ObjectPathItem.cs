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
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace RWXViewer.Models
{
    [DataContract]
    public enum ObjectPathItemType
    {
        [EnumMember]
        Model,
        [EnumMember]
        Avatar,
        [EnumMember]
        Texture
    }

    public static class ObjectPathItemTypeExtensions
    {
        public static string ToPathName(this ObjectPathItemType itemType)
        {
            switch (itemType)
            {
            case ObjectPathItemType.Model:
                return "models";

            case ObjectPathItemType.Avatar:
                return "avatars";

            case ObjectPathItemType.Texture:
                return "textures";

            default:
                throw new InvalidEnumArgumentException("itemType");
            }
        }
    }

    [DataContract]
    public class ObjectPathItem
    {
        [Key]
        [DataMember]
        public int ObjectPathId { get; set; }

        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public ObjectPathItemType Type { get; set; }

        [DataMember]
        public string FileName { get; set; }

        [DataMember]
        public virtual World World { get; set; }
    }
}