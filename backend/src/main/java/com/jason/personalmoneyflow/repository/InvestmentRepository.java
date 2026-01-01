package com.jason.personalmoneyflow.repository;

import com.jason.personalmoneyflow.model.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    
    List<Investment> findByUserId(Long userId);
    
    Optional<Investment> findByIdAndUserId(Long id, Long userId);
    
    Optional<Investment> findByUserIdAndStockSymbol(Long userId, String stockSymbol);
    
    boolean existsByUserIdAndStockSymbol(Long userId, String stockSymbol);
}
