package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.AssetRequest;
import com.jason.personalmoneyflow.model.dto.response.AssetResponse;
import com.jason.personalmoneyflow.service.AssetService;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Asset Controller
 * 资产管理
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssetController {

    private final AssetService assetService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 获取所有资产
     * GET /api/v1/assets
     */
    @GetMapping
    public ResponseEntity<List<AssetResponse>> getAssets(HttpServletRequest request) {
        log.info("获取所有资产");
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<AssetResponse> assets = assetService.getAssets(userId);
        return ResponseEntity.ok(assets);
    }

    /**
     * 获取单个资产
     * GET /api/v1/assets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponse> getAsset(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("获取资产详情: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        AssetResponse asset = assetService.getAsset(id, userId);
        return ResponseEntity.ok(asset);
    }

    /**
     * 创建资产
     * POST /api/v1/assets
     */
    @PostMapping
    public ResponseEntity<AssetResponse> createAsset(
            @Valid @RequestBody AssetRequest request,
            HttpServletRequest httpRequest) {
        log.info("创建资产: {}", request.getAssetName());
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        AssetResponse asset = assetService.createAsset(userId, request);
        return ResponseEntity.ok(asset);
    }

    /**
     * 更新资产
     * PUT /api/v1/assets/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request,
            HttpServletRequest httpRequest) {
        log.info("更新资产: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        AssetResponse asset = assetService.updateAsset(id, userId, request);
        return ResponseEntity.ok(asset);
    }

    /**
     * 删除资产
     * DELETE /api/v1/assets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("删除资产: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        assetService.deleteAsset(id, userId);
        return ResponseEntity.ok().build();
    }
}
