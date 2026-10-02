using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SSM.Infrastucture.Files.Options
{
    public class AzureBlobStorageOptions
    {
        public const string SectionName = "AzureBlobStorage";
        public string ConnectionString { get; set; } = string.Empty;
        public string ContainerName { get; set; } = "uploads";
        public string? PublicBaseUrl { get; set; }
    }
}
