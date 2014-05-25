using MrByte.RWX.Model;

namespace RWXViewer.Models
{
    public interface IModelLoader
    {
        Model GetModel(string group, string name);
    }
}