package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.entity.Asset;
import com.jason.personalmoneyflow.model.dto.request.AssetRequest;
import com.jason.personalmoneyflow.model.dto.response.AssetResponse;
import com.jason.personalmoneyflow.repository.AssetRepository;
import com.jason.personalmoneyflow.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Asset Service
 * 资产管理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    /**
     * 获取所有资产
     */
    @Transactional(readOnly = true)
    public List<AssetResponse> getAssets(Long userId) {
        return assetRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取单个资产
     */
    @Transactional(readOnly = true)
    public AssetResponse getAsset(Long id, Long userId) {
        Asset asset = findAssetByIdAndUserId(id, userId);
        return toResponse(asset);
    }

    /**
     * 创建资产
     */
    @Transactional
    public AssetResponse createAsset(Long userId, AssetRequest request) {
        log.info("用户 {} 创建资产: {}", userId, request.getAssetName());
        
        Asset asset = Asset.builder()
                .userId(userId)
                .assetType(request.getAssetType())
                .assetName(request.getAssetName())
                .currentValue(request.getCurrentValue())
                .notes(request.getNotes())
                .build();
        
        Asset saved = assetRepository.save(asset);
        return toResponse(saved);
    }

    /**
     * 更新资产
     */
    @Transactional
    public AssetResponse updateAsset(Long id, Long userId, AssetRequest request) {
        log.info("用户 {} 更新资产: {}", userId, id);
        
        Asset asset = findAssetByIdAndUserId(id, userId);
        
        asset.setAssetType(request.getAssetType());
        asset.setAssetName(request.getAssetName());
        asset.setCurrentValue(request.getCurrentValue());
        asset.setNotes(request.getNotes());
        
        Asset saved = assetRepository.save(asset);
        return toResponse(saved);
    }

    /**
     * 删除资产
     */
    @Transactional
    public void deleteAsset(Long id, Long userId) {
        log.info("用户 {} 删除资产: {}", userId, id);
        
        Asset asset = findAssetByIdAndUserId(id, userId);
        assetRepository.delete(asset);
    }

    private Asset findAssetByIdAndUserId(Long id, Long userId) {
        return assetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", id));
    }

    private AssetResponse toResponse(Asset asset) {
        return AssetResponse.builder()
                .id(asset.getId())
                .userId(asset.getUserId())
                .assetType(asset.getAssetType())
                .assetName(asset.getAssetName())
                .currentValue(asset.getCurrentValue())
                .notes(asset.getNotes())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }
}
