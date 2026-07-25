package com.financeai.backend.service;

import com.financeai.backend.dto.ProfileResponse;
import com.financeai.backend.dto.UpdateProfileRequest;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ProfileResponse getProfile(String email) {
        User user = findUser(email);
        return toResponse(user);
    }

    public ProfileResponse updateFullName(String email, UpdateProfileRequest request) {
        User user = findUser(email);
        user.setFullName(request.getFullName());
        userRepository.save(user);
        return toResponse(user);
    }

    public ProfileResponse uploadPhoto(String email, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File tidak boleh kosong");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File harus berupa gambar");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Ukuran gambar maksimal 2MB");
        }

        User user = findUser(email);

        // Hapus foto lama dari disk kalau ada, sebelum simpan yang baru
        deletePhotoFileIfExists(user.getProfileImageUrl());

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path target = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            user.setProfileImageUrl("/uploads/" + filename);
            userRepository.save(user);
        } catch (IOException e) {
            throw new RuntimeException("Gagal menyimpan foto: " + e.getMessage());
        }

        return toResponse(user);
    }

    public ProfileResponse deletePhoto(String email) {
        User user = findUser(email);
        deletePhotoFileIfExists(user.getProfileImageUrl());
        user.setProfileImageUrl(null);
        userRepository.save(user);
        return toResponse(user);
    }

    private void deletePhotoFileIfExists(String profileImageUrl) {
        if (profileImageUrl == null || profileImageUrl.isBlank()) {
            return;
        }
        try {
            String filename = profileImageUrl.substring(profileImageUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Kalau gagal hapus file lama, jangan sampai proses utama gagal total
            System.err.println("Gagal menghapus file lama: " + e.getMessage());
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf("."));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}