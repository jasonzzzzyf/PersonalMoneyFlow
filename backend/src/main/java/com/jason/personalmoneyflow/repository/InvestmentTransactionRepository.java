package com.jason.personalmoneyflow.repository;

import com.jason.personalmoneyflow.model.entity.InvestmentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentTransactionRepository extends JpaRepository<InvestmentTransaction, Long> {
    List<InvestmentTransaction> findByInvestmentIdOrderByTransactionDateDesc(Long investmentId);
}
