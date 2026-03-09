package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.exception.ResourceNotFoundException;
import com.jason.personalmoneyflow.model.dto.request.RecurringTransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.RecurringTransactionResponse;
import com.jason.personalmoneyflow.model.entity.CustomCategory;
import com.jason.personalmoneyflow.model.entity.RecurringTransaction;
import com.jason.personalmoneyflow.model.entity.Transaction;
import com.jason.personalmoneyflow.repository.CustomCategoryRepository;
import com.jason.personalmoneyflow.repository.RecurringTransactionRepository;
import com.jason.personalmoneyflow.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;
    private final CustomCategoryRepository categoryRepository;

    public List<RecurringTransactionResponse> getAll(Long userId) {
        List<RecurringTransaction> list = recurringRepository.findByUserIdOrderByNextExecutionDateAsc(userId);
        return toResponses(list);
    }

    @Transactional
    public RecurringTransactionResponse create(Long userId, RecurringTransactionRequest request) {
        categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        RecurringTransaction rt = RecurringTransaction.builder()
                .userId(userId)
                .transactionType(request.getTransactionType())
                .categoryId(request.getCategoryId())
                .amount(request.getAmount())
                .frequency(request.getFrequency())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .nextExecutionDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(true)
                .build();

        return toResponse(recurringRepository.save(rt), null);
    }

    @Transactional
    public RecurringTransactionResponse update(Long userId, Long id, RecurringTransactionRequest request) {
        RecurringTransaction rt = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));

        rt.setTransactionType(request.getTransactionType());
        rt.setCategoryId(request.getCategoryId());
        rt.setAmount(request.getAmount());
        rt.setFrequency(request.getFrequency());
        rt.setDescription(request.getDescription());
        rt.setEndDate(request.getEndDate());

        return toResponse(recurringRepository.save(rt), null);
    }

    @Transactional
    public RecurringTransactionResponse toggleActive(Long userId, Long id) {
        RecurringTransaction rt = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));
        rt.setIsActive(!Boolean.TRUE.equals(rt.getIsActive()));
        return toResponse(recurringRepository.save(rt), null);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        RecurringTransaction rt = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));
        recurringRepository.delete(rt);
    }

    /** Called by scheduler daily to generate due transactions */
    @Transactional
    public void processDueTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> due =
                recurringRepository.findByNextExecutionDateLessThanEqualAndIsActive(today, true);

        log.info("Processing {} due recurring transactions", due.size());

        for (RecurringTransaction rt : due) {
            try {
                Transaction tx = Transaction.builder()
                        .userId(rt.getUserId())
                        .transactionType(Transaction.TransactionType.valueOf(rt.getTransactionType()))
                        .categoryId(rt.getCategoryId())
                        .amount(rt.getAmount())
                        .transactionDate(today)
                        .notes(rt.getDescription())
                        .build();
                transactionRepository.save(tx);

                LocalDate next = calculateNextDate(rt.getFrequency(), today);
                rt.setNextExecutionDate(next);

                if (rt.getEndDate() != null && next.isAfter(rt.getEndDate())) {
                    rt.setIsActive(false);
                }
                recurringRepository.save(rt);

            } catch (Exception e) {
                log.error("Failed to process recurring transaction {}: {}", rt.getId(), e.getMessage());
            }
        }
    }

    private LocalDate calculateNextDate(String frequency, LocalDate current) {
        return switch (frequency) {
            case "DAILY" -> current.plusDays(1);
            case "WEEKLY" -> current.plusWeeks(1);
            case "YEARLY" -> current.plusYears(1);
            default -> current.plusMonths(1); // MONTHLY
        };
    }

    private List<RecurringTransactionResponse> toResponses(List<RecurringTransaction> list) {
        if (list.isEmpty()) return List.of();

        Map<Long, CustomCategory> catMap = categoryRepository.findAllById(
                list.stream().map(RecurringTransaction::getCategoryId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(CustomCategory::getId, c -> c));

        return list.stream().map(rt -> toResponse(rt, catMap.get(rt.getCategoryId()))).collect(Collectors.toList());
    }

    private RecurringTransactionResponse toResponse(RecurringTransaction rt, CustomCategory category) {
        return RecurringTransactionResponse.builder()
                .id(rt.getId())
                .transactionType(rt.getTransactionType())
                .categoryId(rt.getCategoryId())
                .categoryName(category != null ? category.getCategoryName() : null)
                .categoryIcon(category != null ? category.getIcon() : null)
                .amount(rt.getAmount())
                .frequency(rt.getFrequency())
                .description(rt.getDescription())
                .startDate(rt.getStartDate())
                .nextExecutionDate(rt.getNextExecutionDate())
                .endDate(rt.getEndDate())
                .isActive(rt.getIsActive())
                .build();
    }
}
