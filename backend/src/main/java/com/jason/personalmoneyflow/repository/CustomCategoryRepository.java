// CustomCategoryRepository.java

package com.jason.personalmoneyflow.repository;

import com.jason.personalmoneyflow.model.entity.CustomCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomCategoryRepository extends JpaRepository<CustomCategory, Long> {
    
    List<CustomCategory> findByUserId(Long userId);
    
    Optional<CustomCategory> findByIdAndUserId(Long id, Long userId);
    
    List<CustomCategory> findByUserIdAndCategoryType(Long userId, String categoryType);
}
