package com.jason.personalmoneyflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringTransactionScheduler {

    private final RecurringTransactionService recurringTransactionService;

    /** Run every day at 00:05 AM server time */
    @Scheduled(cron = "0 5 0 * * ?")
    public void processRecurringTransactions() {
        log.info("Scheduler: processing recurring transactions...");
        try {
            recurringTransactionService.processDueTransactions();
            log.info("Scheduler: done");
        } catch (Exception e) {
            log.error("Scheduler error: {}", e.getMessage(), e);
        }
    }
}
