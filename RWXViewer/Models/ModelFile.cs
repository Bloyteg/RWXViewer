namespace RWXViewer.Models
{
    public class ModelFile
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string FileName { get; set; }
        public World World { get; set; }
    }
}