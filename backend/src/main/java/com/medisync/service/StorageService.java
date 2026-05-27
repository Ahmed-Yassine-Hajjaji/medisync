package com.medisync.service;

import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    @Value("${SUPABASE_URL}")
    private String supabaseUrl;

    @Value("${SUPABASE_SERVICE_KEY}")
    private String supabaseServiceKey;

    private static final String BUCKET_NAME = "medical-documents";
    private final OkHttpClient httpClient = new OkHttpClient();

    /**
     * Upload file to Supabase Storage
     */
    public String uploadFile(MultipartFile file, Long patientId, String category) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = generateFilename(patientId, category, extension);
        String path = String.format("patients/%d/%s/%s", patientId, category, filename);

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, BUCKET_NAME, path);

        RequestBody requestBody = RequestBody.create(
                file.getBytes(),
                MediaType.parse(file.getContentType())
        );

        Request request = new Request.Builder()
                .url(uploadUrl)
                .addHeader("Authorization", "Bearer " + supabaseServiceKey)
                .addHeader("Content-Type", file.getContentType())
                .post(requestBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("Failed to upload file to Supabase: {}", errorBody);
                throw new IOException("Failed to upload file: " + errorBody);
            }

            String publicUrl = getPublicUrl(path);
            log.info("File uploaded successfully: {}", publicUrl);
            return publicUrl;
        }
    }

    /**
     * Upload DICOM file with specific handling
     */
    public String uploadDicomFile(MultipartFile file, Long patientId, String studyId) throws IOException {
        validateDicomFile(file);

        String filename = generateFilename(patientId, "dicom", ".dcm");
        String path = String.format("patients/%d/dicom/%s/%s", patientId, studyId, filename);

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, BUCKET_NAME, path);

        RequestBody requestBody = RequestBody.create(
                file.getBytes(),
                MediaType.parse("application/dicom")
        );

        Request request = new Request.Builder()
                .url(uploadUrl)
                .addHeader("Authorization", "Bearer " + supabaseServiceKey)
                .addHeader("Content-Type", "application/dicom")
                .addHeader("x-upsert", "true")
                .post(requestBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("Failed to upload DICOM file: {}", errorBody);
                throw new IOException("Failed to upload DICOM file: " + errorBody);
            }

            String publicUrl = getPublicUrl(path);
            log.info("DICOM file uploaded successfully: {}", publicUrl);
            return publicUrl;
        }
    }

    /**
     * Delete file from Supabase Storage
     */
    public boolean deleteFile(String filePath) {
        String deleteUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, BUCKET_NAME, filePath);

        Request request = new Request.Builder()
                .url(deleteUrl)
                .addHeader("Authorization", "Bearer " + supabaseServiceKey)
                .delete()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (response.isSuccessful()) {
                log.info("File deleted successfully: {}", filePath);
                return true;
            } else {
                log.error("Failed to delete file: {}", filePath);
                return false;
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get signed URL for private file access
     */
    public String getSignedUrl(String filePath, int expiresInSeconds) throws IOException {
        String signUrl = String.format("%s/storage/v1/object/sign/%s/%s",
                supabaseUrl, BUCKET_NAME, filePath);

        String jsonBody = String.format("{\"expiresIn\": %d}", expiresInSeconds);

        RequestBody requestBody = RequestBody.create(
                jsonBody,
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(signUrl)
                .addHeader("Authorization", "Bearer " + supabaseServiceKey)
                .addHeader("Content-Type", "application/json")
                .post(requestBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to generate signed URL");
            }

            String responseBody = response.body().string();
            // Parse signedURL from response
            // Response format: {"signedURL": "..."}
            int startIndex = responseBody.indexOf("\"signedURL\":\"") + 13;
            int endIndex = responseBody.indexOf("\"", startIndex);
            String signedPath = responseBody.substring(startIndex, endIndex);

            return supabaseUrl + signedPath;
        }
    }

    /**
     * Download file bytes
     */
    public byte[] downloadFile(String filePath) throws IOException {
        String downloadUrl = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, BUCKET_NAME, filePath);

        Request request = new Request.Builder()
                .url(downloadUrl)
                .addHeader("Authorization", "Bearer " + supabaseServiceKey)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to download file");
            }
            return response.body().bytes();
        }
    }

    /**
     * List files in a directory
     */
    public String listFiles(String prefix) throws IOException {
        String listUrl = String.format("%s/storage/v1/object/list/%s",
                supabaseUrl, BUCKET_NAME);

        String jsonBody = String.format("{\"prefix\": \"%s\"}", prefix);

        RequestBody requestBody = RequestBody.create(
                jsonBody,
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(listUrl)
                .addHeader("Authorization", "Bearer " + supabaseServiceKey)
                .addHeader("Content-Type", "application/json")
                .post(requestBody)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to list files");
            }
            return response.body().string();
        }
    }

    private String getPublicUrl(String path) {
        return String.format("%s/storage/v1/object/public/%s/%s",
                supabaseUrl, BUCKET_NAME, path);
    }

    private String generateFilename(Long patientId, String category, String extension) {
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        long timestamp = System.currentTimeMillis();
        return String.format("%s_%d_%s%s", category, timestamp, uuid, extension);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private void validateDicomFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("DICOM file is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.toLowerCase().endsWith(".dcm") &&
                !filename.toLowerCase().endsWith(".dicom"))) {
            throw new IOException("Invalid DICOM file extension");
        }

        // Check for DICOM magic number (DICM at offset 128)
        byte[] bytes = file.getBytes();
        if (bytes.length > 132) {
            String magic = new String(bytes, 128, 4);
            if (!"DICM".equals(magic)) {
                log.warn("File does not have standard DICOM header, proceeding anyway");
            }
        }

        // Check file size (max 100MB for DICOM)
        if (file.getSize() > 100 * 1024 * 1024) {
            throw new IOException("DICOM file exceeds maximum size of 100MB");
        }
    }
}
