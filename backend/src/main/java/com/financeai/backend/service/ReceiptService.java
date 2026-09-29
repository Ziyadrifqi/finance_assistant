package com.financeai.backend.service;

import com.financeai.backend.dto.ReceiptScanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final RestClient mlServiceRestClient;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ReceiptScanResponse scanReceipt(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File tidak boleh kosong");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File harus berupa gambar");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Ukuran gambar maksimal 5MB");
        }

        // 1. Simpan file ke disk (folder terpisah dari foto profil)
        String savedUrl = saveReceiptFile(file);

        // 2. Kirim gambar yang sama ke FastAPI untuk di-OCR
        Map<String, Object> ocrResult = callOcrService(file);

        @SuppressWarnings("unchecked")
        List<String> rawText = (List<String>) ocrResult.get("raw_text");
        Object amountObj = ocrResult.get("detected_amount");
        Double detectedAmount = amountObj != null ? ((Number) amountObj).doubleValue() : null;
        String detectedDate = (String) ocrResult.get("detected_date");

        return ReceiptScanResponse.builder()
                .receiptImageUrl(savedUrl)
                .detectedAmount(detectedAmount)
                .detectedDate(detectedDate)
                .rawText(rawText)
                .build();
    }

    private String saveReceiptFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir, "receipts");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path target = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/receipts/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Gagal menyimpan struk: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callOcrService(MultipartFile file) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            return mlServiceRestClient.post()
                    .uri("/ocr/receipt")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Gagal memproses OCR: " + e.getMessage());
        }
    }

    public void deleteReceiptFileIfExists(String receiptImageUrl) {
        if (receiptImageUrl == null || receiptImageUrl.isBlank()) {
            return;
        }
        try {
            String filename = receiptImageUrl.substring(receiptImageUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, "receipts").resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Gagal menghapus file struk lama: " + e.getMessage());
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf("."));
    }
}