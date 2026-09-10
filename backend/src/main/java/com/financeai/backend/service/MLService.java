package com.financeai.backend.service;

import com.financeai.backend.dto.ml.*;
import com.financeai.backend.entity.CategoryType;
import com.financeai.backend.entity.Transaction;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.TransactionRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MLService {

    private final RestClient mlServiceRestClient;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public PredictionResultDto predictNextMonthExpense(String email, int monthsBack) {
        User user = findUser(email);
        YearMonth current = YearMonth.now();

        List<MonthlyExpenseDto> history = java.util.stream.IntStream.range(0, monthsBack)
                .mapToObj(i -> current.minusMonths(monthsBack - 1 - i))
                .map(ym -> {
                    var total = transactionRepository.sumByUserAndTypeAndDateRange(
                            user, CategoryType.EXPENSE, ym.atDay(1), ym.atEndOfMonth());
                    return MonthlyExpenseDto.builder()
                            .month(ym.getMonthValue())
                            .year(ym.getYear())
                            .totalExpense(total.doubleValue())
                            .build();
                })
                .toList();

        PredictionRequestDto request = PredictionRequestDto.builder().history(history).build();

        return mlServiceRestClient.post()
                .uri("/predict")
                .body(request)
                .retrieve()
                .body(PredictionResultDto.class);
    }

    public AnomalyResponseDto detectAnomalies(String email) {
        User user = findUser(email);
        List<Transaction> transactions = transactionRepository
                .findByUserOrderByTransactionDateDescCreatedAtDesc(user);

        List<TransactionForAnomalyDto> dtos = transactions.stream()
                .map(t -> TransactionForAnomalyDto.builder()
                        .id(t.getId())
                        .amount(t.getAmount().doubleValue())
                        .categoryName(t.getCategory().getName())
                        .transactionDate(t.getTransactionDate().toString())
                        .build())
                .toList();

        AnomalyRequestDto request = AnomalyRequestDto.builder().transactions(dtos).build();

        return mlServiceRestClient.post()
                .uri("/anomaly")
                .body(request)
                .retrieve()
                .body(AnomalyResponseDto.class);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }
}