package com.financeai.backend.controller;

import com.financeai.backend.dto.ProfileResponse;
import com.financeai.backend.dto.UpdateProfileRequest;
import com.financeai.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfile(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(profileService.updateFullName(authentication.getName(), request));
    }

    @PostMapping(value = "/photo", consumes = "multipart/form-data")
    public ResponseEntity<ProfileResponse> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        return ResponseEntity.ok(profileService.uploadPhoto(authentication.getName(), file));
    }

    @DeleteMapping("/photo")
    public ResponseEntity<ProfileResponse> deletePhoto(Authentication authentication) {
        return ResponseEntity.ok(profileService.deletePhoto(authentication.getName()));
    }
}