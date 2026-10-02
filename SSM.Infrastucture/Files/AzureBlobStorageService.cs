using System.Linq;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using SMM.Application.Files.Interfaces;
using SSM.Infrastucture.Files.Options;

namespace SMM.Infrastructure.Files;

public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly AzureBlobStorageOptions _options;

    private static readonly string[] AllowedImageExtensions =
        {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    };

    private static readonly string[] AllowedVideoExtensions =
        {
        ".mp4",
        ".webm",
        ".mov"
    };

    private const long MaxImageSize = 10 * 1024 * 1024;
    private const long MaxVideoSize = 150 * 1024 * 1024;

    public AzureBlobStorageService(BlobServiceClient blobServiceClient, IOptions<AzureBlobStorageOptions> options)
    {
        _blobServiceClient = blobServiceClient;
        _options = options.Value;
    }

    public async Task<string> SaveImageAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        ValidateFile(
            file,
            AllowedImageExtensions,
            MaxImageSize,
            "image");

        return await SaveFileAsync(file, "images", cancellationToken);
    }

    public async Task<string> SaveVideoAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        ValidateFile(
            file,
            AllowedVideoExtensions,
            MaxVideoSize,
            "video"
        );

        return await SaveFileAsync(file, "videos", cancellationToken);
    }

    public async Task DeleteAsync(string? fileUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
        {
            return;
        }

        var blobName = ExtractBlobName(fileUrl);

        if (blobName is null)
        {
            return;
        }

        var containerClient = _blobServiceClient
            .GetBlobContainerClient(_options.ContainerName);

        await containerClient.DeleteBlobIfExistsAsync(blobName, DeleteSnapshotsOption.IncludeSnapshots, cancellationToken: cancellationToken
        );
    }

    private async Task<string> SaveFileAsync(IFormFile file, string folderName, CancellationToken cancellationToken)
    {
        var extension = Path
            .GetExtension(file.FileName)
            .ToLowerInvariant();

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var blobName = $"{folderName}/{fileName}";

        var containerClient = _blobServiceClient
            .GetBlobContainerClient(_options.ContainerName);

        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: cancellationToken
        );

        var blobClient = containerClient.GetBlobClient(blobName);

        var blobHttpHeaders = new BlobHttpHeaders
        {
            ContentType = GetContentType(extension)
        };

        await using var stream = file.OpenReadStream();

        await blobClient.UploadAsync(stream,
            new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders
            },
            cancellationToken
        );

        if (!string.IsNullOrWhiteSpace(_options.PublicBaseUrl))
        {
            return $"{_options.PublicBaseUrl.TrimEnd('/')}/{blobName}";
        }

        return blobClient.Uri.ToString();
    }

    private string? ExtractBlobName(string fileUrl)
    {
        if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
        {
            var segments = uri.AbsolutePath
                .Trim('/')
                .Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (segments.Length >= 3 &&
                string.Equals(
                    segments[0],
                    _options.ContainerName,
                    StringComparison.OrdinalIgnoreCase))
            {
                return string.Join('/', segments.Skip(1));
            }

            if (segments.Length >= 2)
            {
                return string.Join('/', segments[^2..]);
            }
        }

        return null;
    }

    private static string GetContentType(string extension) => extension switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".webp" => "image/webp",
        ".gif" => "image/gif",
        ".mp4" => "video/mp4",
        ".webm" => "video/webm",
        ".mov" => "video/quicktime",
        _ => "application/octet-stream"
    };

    private static void ValidateFile(
        IFormFile file,
        string[] allowedExtensions,
        long maxFileSize,
        string fileType)
    {
        if (file is null || file.Length == 0)
        {
            throw new InvalidOperationException
                (
                $"The {fileType} file is empty."
                );
        }

        if (file.Length > maxFileSize)
        {
            throw new InvalidOperationException
            (
                $"The {fileType} file is too large."
            );
        }

        var extension = Path
            .GetExtension(file.FileName)
            .ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException(
                $"Unsupported {fileType} format."
            );
        }
    }
}
