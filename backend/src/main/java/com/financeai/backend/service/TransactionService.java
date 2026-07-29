package com.financeai.backend.service;

import com.financeai.backend.dto.CategoryResponse;
import com.financeai.backend.dto.TransactionRequest;
import com.financeai.backend.dto.TransactionResponse;
import com.financeai.backend.entity.Category;
import com.financeai.backend.entity.Transaction;
import com.financeai.backend.entity.User;
import com.financeai.backend.repository.CategoryRepository;
import com.financeai.backend.repository.TransactionRepository;
import com.financeai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.YearMonth;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<TransactionResponse> getAll(String email) {
        User user = findUser(email);
        return transactionRepository.findByUserOrderByTransactionDateDescCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    public List<TransactionResponse> getByMonth(String email, Integer month, Integer year) {
        User user = findUser(email);
        YearMonth ym = YearMonth.of(year, month);
        return transactionRepository.findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
                        user, ym.atDay(1), ym.atEndOfMonth())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TransactionResponse create(String email, TransactionRequest request) {
        User user = findUser(email);
        Category category = findCategory(request.getCategoryId(), user);

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .note(request.getNote())
                .transactionDate(request.getTransactionDate())
                .category(category)
                .user(user)
                .build();

        transactionRepository.save(transaction);
        return toResponse(transaction);
    }

    public TransactionResponse update(String email, Long id, TransactionRequest request) {
        User user = findUser(email);
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Transaksi tidak ditemukan"));

        Category category = findCategory(request.getCategoryId(), user);

        transaction.setAmount(request.getAmount());
        transaction.setNote(request.getNote());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setCategory(category);

        transactionRepository.save(transaction);
        return toResponse(transaction);
    }

    public void delete(String email, Long id) {
        User user = findUser(email);
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Transaksi tidak ditemukan"));
        transactionRepository.delete(transaction);
    }

    private Category findCategory(Long categoryId, User user) {
        return categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("Kategori tidak ditemukan"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        Category category = transaction.getCategory();
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .note(transaction.getNote())
                .transactionDate(transaction.getTransactionDate())
                .category(CategoryResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .type(category.getType())
                        .icon(category.getIcon())
                        .color(category.getColor())
                        .build())
                .build();
    }
}