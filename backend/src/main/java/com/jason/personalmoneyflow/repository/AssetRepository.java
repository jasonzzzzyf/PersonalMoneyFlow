package com.jason.personalmoneyflow.repository;

import com.jason.personalmoneyflow.model.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    List<Asset> findByUserId(Long userId);
    
    Optional<Asset> findByIdAndUserId(Long id, Long userId);
}
